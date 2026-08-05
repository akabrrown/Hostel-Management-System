import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createSession, destroySession, validateSession, logAuditEvent } from './security'
import { loginSchema, signupSchema, passwordChangeSchema } from './schemas'

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
export async function authenticateUser(email: string, password: string, role: string) {
  // Validate input
  const validation = loginSchema.safeParse({ email, password, role })
  if (!validation.success) {
    throw new Error('Invalid input data')
  }

  // Find user in database
  const user = await findUserByEmail(email)
  if (!user) {
    throw new Error('Invalid credentials')
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    throw new Error('Invalid credentials')
  }

  // Check role match
  if (user.role !== role) {
    throw new Error('Invalid credentials')
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is deactivated')
  }

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
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    token: generateToken({ sessionId }),
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

  const { firstName, lastName, indexNumber, email, password, programOfStudy, level } = validation.data

  // Check if user already exists
  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const existingIndexNumber = await findUserByIndexNumber(indexNumber)
  if (existingIndexNumber) {
    throw new Error('Index number already exists')
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
    role: 'student',
    isActive: true,
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

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
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
async function findUserByEmail(email: string): Promise<{ id: string; email: string; password: string; firstName: string; lastName: string; indexNumber: string; programOfStudy: string; level: string; role: string; isActive: boolean } | null> {
  // Database implementation needed
  return null
}

async function findUserByIndexNumber(indexNumber: string) {
  // Database implementation needed
  return null
}

async function findUserById(id: string): Promise<{ id: string; email: string; password: string; firstName: string; lastName: string; indexNumber: string; programOfStudy: string; level: string; role: string; isActive: boolean } | null> {
  // Database implementation needed
  return null
}

async function createUser(userData: any): Promise<{ id: string; email: string; password: string; firstName: string; lastName: string; indexNumber: string; programOfStudy: string; level: string; role: string; isActive: boolean }> {
  // Database implementation needed
  return {
    id: crypto.randomUUID(),
    email: userData.email,
    password: userData.password,
    firstName: userData.firstName,
    lastName: userData.lastName,
    indexNumber: userData.indexNumber,
    programOfStudy: userData.programOfStudy,
    level: userData.level,
    role: userData.role,
    isActive: userData.isActive
  }
}

async function updateUserPassword(userId: string, hashedPassword: string) {
  // Database implementation needed
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
