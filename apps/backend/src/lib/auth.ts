import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createSession, destroySession, validateSession, logAuditEvent } from './security'
import { loginSchema, signupSchema, passwordChangeSchema } from './schemas'
import { supabase } from './supabase'
import { mockFetchStudentDetails } from '../services/schoolDbMock'

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '24h'

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// JWT token management
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// User authentication
export async function authenticateUser(identifier: string, password: string, providedRole?: string) {
  console.log('[AuthLib] authenticateUser called with:', { identifier, providedRole, passwordLength: password.length });
  // Validate input
  const validation = loginSchema.safeParse({ identifier, password, role: providedRole })
  if (!validation.success) {
    console.error('[AuthLib] validation failed:', JSON.stringify(validation.error.format(), null, 2));
    throw new Error('Invalid input data')
  }

  let email = identifier;
  let role = providedRole;

  // Clean UPSA from identifier if present and detect student
  const cleanIdentifier = identifier.toUpperCase().startsWith('UPSA') ? identifier.slice(4) : identifier;
  
  if (/^\d{8}$/.test(cleanIdentifier)) {
    email = `${cleanIdentifier}@upsamail.edu.gh`;
    role = 'student';
  } else if (!email.includes('@')) {
    throw new Error('Invalid email or index number format');
  }

  console.log('[AuthLib] Determined email:', email, 'role:', role);

  // Find user in database
  let user = await findUserByEmail(email)
  console.log('[AuthLib] findUserByEmail result:', user ? `Found user ${user.id}` : 'null');

  if (!role && user) {
    role = user.role;
  }

  if (!role) {
    console.error('[AuthLib] Role missing after parsing and user not found');
    throw new Error('Invalid input data');
  }

  if (!user && role === 'student') {
    // Attempt mock auto-provisioning
    const indexNumber = cleanIdentifier;
    console.log('[AuthLib] User not found, attempting auto-provision for index:', indexNumber);
    try {
      const studentData = await mockFetchStudentDetails(indexNumber, password);
      console.log('[AuthLib] Mock fetch success:', studentData.indexNumber);
      // Auto-provision user in DB
      const hashedPassword = await hashPassword(password);
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          index_number: indexNumber,
          role: 'student',
          password_hash: hashedPassword,
          must_reset_password: true,
          status: 'active'
        })
        .select()
        .single();
        
      if (createError || !newUser) {
        console.error('[AuthLib] Error creating user:', createError);
        throw new Error('Failed to provision account');
      }
      
      // Also insert into students table
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: newUser.id,
          full_name: `${studentData.firstName} ${studentData.lastName}`,
          level: String(studentData.level || '100'),
          programme: studentData.programOfStudy || 'Unknown',
          date_of_birth: studentData.dateOfBirth || '2000-01-01',
          gender: 'unknown',
          next_of_kin_name: 'Unknown',
          next_of_kin_phone: 'Unknown'
        });
        
      if (studentError) {
        console.error('[AuthLib] Error creating student profile:', studentError);
        // Continue anyway since user is created
      }
      
      user = newUser;
      console.log('[AuthLib] Auto-provision successful. User id:', user.id);
    } catch (mockError) {
      console.error('[AuthLib] Mock auth failed:', mockError);
      // Fall through to regular invalid credentials
    }
  }

  if (!user) {
    console.error('[AuthLib] User still null after provision attempt');
    throw new Error('Invalid credentials');
  }

  // Verify password
  console.log('[AuthLib] Verifying password...');
  const isPasswordValid = await verifyPassword(password, user.password_hash || user.password)
  if (!isPasswordValid) {
    console.error('[AuthLib] Password validation failed');
    throw new Error('Invalid credentials')
  }

  // Check role match
  if (user.role !== role) {
    console.error('[AuthLib] Role mismatch:', user.role, '!==', role);
    throw new Error('Invalid credentials')
  }

  // Check if user is active
  const isActive = user.status === 'active' || user.isActive === true;
  if (!isActive) {
    console.error('[AuthLib] User is deactivated');
    throw new Error('Account is deactivated')
  }

  // Check if this is their first login (needs OTP and forced reset)
  const isFirstLogin = user.must_reset_password;
  console.log('[AuthLib] First login check:', { isFirstLogin, must_reset_password: user.must_reset_password });
  if (isFirstLogin && role === 'student') {
    return {
      requiresOtp: true,
      tempToken: generateToken({ userId: user.id, type: 'otp_pending' })
    }
  }

  // Update last_login since they are logging in normally
  await updateLastLogin(user.id);

  // Create session
  const sessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: crypto.randomUUID(),
    csrfToken: generateCSRFToken(),
  }

  const sessionId = await createSession(sessionData)

  // Log successful login
  await logAuditEvent({
    userId: user.id,
    action: 'login',
    resource: 'auth',
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    success: true,
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.students?.[0]?.full_name?.split(' ')[0] || user.firstName,
      lastName: user.students?.[0]?.full_name?.split(' ').slice(1).join(' ') || user.lastName,
      role: user.role,
    },
    token: generateToken({ sessionId, userId: user.id, email: user.email, role: user.role }),
    csrfToken: sessionData.csrfToken,
  }
}

// User registration
export async function registerUser(userData: any) {
  // Validate input
  const validation = signupSchema.safeParse(userData)
  if (!validation.success) {
    throw new Error('Invalid input data')
  }

  const { firstName, lastName, indexNumber, email, password, programOfStudy, level, role, dateOfBirth, phone, emergencyContact } = validation.data

  // Check if user already exists
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  if (indexNumber) {
    const existingIndexNumber = await findUserByIndexNumber(indexNumber)
    if (existingIndexNumber) {
      throw new Error('Index number already exists')
    }
  }

  // Hash password
  const hashedPassword = await hashPassword(password)

  // Create user in database
  const user = await createUser({
    firstName,
    lastName,
    indexNumber,
    email,
    password: hashedPassword,
    programOfStudy,
    level,
    role: role || 'student',
    isActive: true,
    dateOfBirth,
    phone,
    emergencyContact
  })

  // Log registration
  await logAuditEvent({
    userId: user?.id || 'unknown',
    action: 'register',
    resource: 'user',
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    success: true,
  })

  // Create a session so the student is automatically logged in
  const sessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: crypto.randomUUID(),
    csrfToken: generateCSRFToken(),
  }
  const sessionId = await createSession(sessionData)

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token: generateToken({ sessionId, userId: user.id, email: user.email, role: user.role }),
  }
}

// Password change
export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  // Validate input
  const validation = passwordChangeSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword: newPassword,
  })
  if (!validation.success) {
    throw new Error('Invalid input data')
  }

  // Find user
  const user = await findUserById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Verify current password
  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
  if (!isCurrentPasswordValid) {
    throw new Error('Current password is incorrect')
  }

  // Hash new password
  const hashedNewPassword = await hashPassword(newPassword)

  // Update password in database
  await updateUserPassword(userId, hashedNewPassword)

  // Destroy all existing sessions for this user (force re-login)
  await destroyAllUserSessions(userId)

  // Log password change
  await logAuditEvent({
    userId,
    action: 'password_change',
    resource: 'auth',
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    success: true,
  })

  return { success: true }
}

// Password reset
export async function verifyMockOtp(token: string, otp: string) {
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'otp_pending') {
    throw new Error('Invalid or expired token');
  }

  if (otp !== '123456') {
    throw new Error('Invalid OTP');
  }

  // Success, return a new token specifically for the password reset step
  return {
    success: true,
    tempToken: generateToken({ userId: decoded.userId, type: 'initial_password_reset_pending' })
  };
}

export async function completeInitialReset(token: string, newPassword: string) {
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'initial_password_reset_pending') {
    throw new Error('Invalid or expired token');
  }

  const user = await findUserById(decoded.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const hashedPassword = await hashPassword(newPassword);
  
  // Update password and clear must_reset_password flag
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      password_hash: hashedPassword,
      must_reset_password: false
    })
    .eq('id', user.id);
    
  if (updateError) {
    throw new Error('Failed to update password');
  }
  
  // Mark lastLogin so they don't get trapped in this flow again
  await updateLastLogin(user.id);

  // Create real session
  const sessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId: crypto.randomUUID(),
    csrfToken: generateCSRFToken(),
  }

  const sessionId = await createSession(sessionData)

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token: generateToken({ sessionId, userId: user.id, email: user.email, role: user.role }),
    csrfToken: sessionData.csrfToken,
  }
}

export async function requestPasswordReset(email: string) {
  // Find user
  const user = await findUserByEmail(email)
  if (!user) {
    // Don't reveal if user exists or not
    return { success: true }
  }

  // Generate reset token
  const resetToken = generateToken({ userId: user.id, type: 'password_reset' })
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  // Store reset token in database
  await storePasswordResetToken(user.id, resetToken, expiresAt)

  // Send reset email
  await sendPasswordResetEmail(email, resetToken)

  // Log password reset request
  await logAuditEvent({
    userId: user.id,
    action: 'password_reset_request',
    resource: 'auth',
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    success: true,
  })

  return { success: true }
}

export async function resetPassword(token: string, newPassword: string) {
  // Verify token
  const decoded = verifyToken(token)
  if (!decoded || decoded.type !== 'password_reset') {
    throw new Error('Invalid or expired token')
  }

  // Find user
  const user = await findUserById(decoded.userId)
  if (!user) {
    throw new Error('User not found')
  }

  // Check if token is still valid
  const resetToken = await getPasswordResetToken(user.id)
  if (!resetToken || resetToken.token !== token || new Date() > new Date(resetToken.expiresAt)) {
    throw new Error('Invalid or expired token')
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword)

  // Update password
  await updateUserPassword(user.id, hashedPassword)

  // Delete reset token
  await deletePasswordResetToken(user.id)

  // Destroy all existing sessions
  await destroyAllUserSessions(user.id)

  // Log password reset
  await logAuditEvent({
    userId: user.id,
    action: 'password_reset',
    resource: 'auth',
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    success: true,
  })

  return { success: true }
}

// Session management
export async function getSessionFromToken(token: string) {
  const decoded = verifyToken(token)
  if (!decoded || !decoded.sessionId) {
    return null
  }

  const session = await validateSession(decoded.sessionId)
  return session
}

export async function logoutUser(sessionId: string, userId: string) {
  await destroySession(sessionId)

  // Log logout
  await logAuditEvent({
    userId,
    action: 'logout',
    resource: 'auth',
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    success: true,
  })

  return { success: true }
}

// Two-factor authentication (future enhancement)
export async function enable2FA(userId: string, secret: string) {
  // Store 2FA secret for user
  await store2FASecret(userId, secret)

  // Log 2FA enablement
  await logAuditEvent({
    userId,
    action: '2fa_enable',
    resource: 'auth',
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    success: true,
  })

  return { success: true }
}

export async function verify2FA(userId: string, code: string) {
  const secret = await get2FASecret(userId)
  if (!secret) {
    throw new Error('2FA not enabled')
  }

  // Verify TOTP code
  const isValid = verifyTOTP(secret, code)
  if (!isValid) {
    throw new Error('Invalid 2FA code')
  }

  return { success: true }
}

// Helper functions (these would be implemented with actual database calls)
async function findUserByEmail(email: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*, students(*)')
    .eq('email', email)
    .single()
    
  if (error) {
    console.error('[AuthLib] findUserByEmail error:', error);
    return null;
  }
  if (!data) return null;
  
  return {
    id: data.id,
    email: data.email,
    password: data.password_hash,
    firstName: data.students?.[0]?.full_name?.split(' ')[0] || data.first_name || 'User',
    lastName: data.students?.[0]?.full_name?.split(' ').slice(1).join(' ') || data.last_name || '',
    indexNumber: data.index_number || '',
    programOfStudy: data.students?.[0]?.programme || '',
    level: data.students?.[0]?.level || '',
    role: data.role,
    isActive: data.status === 'active',
    lastLogin: null,
    must_reset_password: data.must_reset_password
  }
}

async function updateLastLogin(userId: string) {
  // Not in schema currently, skip for mock
}

async function findUserByIndexNumber(indexNumber: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('index_number', indexNumber)
    .single()
  
  return error ? null : data
}

async function findUserById(id: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*, students(*)')
    .eq('id', id)
    .single()
    
  if (error || !data) return null;
  
  return {
    id: data.id,
    email: data.email,
    password: data.password_hash,
    firstName: data.students?.[0]?.full_name?.split(' ')[0] || data.first_name || 'User',
    lastName: data.students?.[0]?.full_name?.split(' ').slice(1).join(' ') || data.last_name || '',
    indexNumber: data.index_number || '',
    programOfStudy: data.students?.[0]?.programme || '',
    level: data.students?.[0]?.level || '',
    role: data.role,
    isActive: data.status === 'active',
    lastLogin: null,
    must_reset_password: data.must_reset_password
  }
}

async function createUser(userData: any): Promise<any> {
  const { data: newUser, error: userError } = await supabase.from('users').insert({
    email: userData.email,
    password_hash: userData.password,
    index_number: userData.indexNumber,
    role: userData.role === 'director' ? 'admin' : userData.role,
    status: userData.isActive ? 'active' : 'inactive',
    must_reset_password: false,
  }).select().single();
  
  if (userError) throw userError;

  if (userData.role === 'student') {
    await supabase.from('students').insert({
      user_id: newUser.id,
      full_name: `${userData.firstName} ${userData.lastName}`,
      programme: userData.programOfStudy || 'Unknown',
      level: userData.level || '100',
      date_of_birth: userData.dateOfBirth || '2000-01-01',
      gender: 'unknown',
      next_of_kin_name: userData.emergencyContact?.name || 'Unknown',
      next_of_kin_phone: userData.emergencyContact?.phone || 'Unknown'
    });
  } else if (userData.role === 'porter') {
    await supabase.from('porters').insert({
      user_id: newUser.id,
      full_name: `${userData.firstName} ${userData.lastName}`
    });
  } else if (userData.role === 'admin' || userData.role === 'director') {
    await supabase.from('administrators').insert({
      user_id: newUser.id,
      full_name: `${userData.firstName} ${userData.lastName}`,
      permissions: {}
    });
  }

  return {
    id: newUser.id,
    email: newUser.email,
    password: newUser.password_hash,
    firstName: userData.firstName,
    lastName: userData.lastName,
    indexNumber: newUser.index_number || '',
    programOfStudy: userData.programOfStudy,
    level: userData.level,
    role: userData.role,
    isActive: newUser.status === 'active',
    lastLogin: null
  }
}

async function updateUserPassword(userId: string, hashedPassword: string) {
  await supabase.from('users').update({ 
    password_hash: hashedPassword,
    must_reset_password: false
  }).eq('id', userId);
}

async function destroyAllUserSessions(userId: string) {
  // Database implementation needed
}

async function storePasswordResetToken(userId: string, token: string, expiresAt: Date) {
  // Database implementation needed
}

async function getPasswordResetToken(userId: string): Promise<{ token: string; expiresAt: string } | null> {
  // Database implementation needed
  return null
}

async function deletePasswordResetToken(userId: string) {
  // Database implementation needed
}

async function sendPasswordResetEmail(email: string, token: string) {
  // Email implementation needed
}

async function store2FASecret(userId: string, secret: string) {
  // Database implementation needed
}

async function get2FASecret(userId: string) {
  // Database implementation needed
  return null
}

function verifyTOTP(secret: string, code: string): boolean {
  // TOTP verification implementation needed
  return false
}

function generateCSRFToken(): string {
  return crypto.randomUUID()
}

function getClientIP(): string {
  // Implementation needed
  return 'unknown'
}

function getUserAgent(): string {
  // Implementation needed
  return 'unknown'
}
