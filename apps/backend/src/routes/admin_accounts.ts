import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import bcrypt from 'bcryptjs'

const adminUserSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['admin', 'porter', 'student']),
  phone: z.string().optional(),
  indexNumber: z.string().optional(),
  assignedHostelId: z.string().uuid().optional().nullable()
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.query['role'] as string
    const status = req.query['status'] as string
    const search = req.query['search'] as string

    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        index_number,
        phone,
        status,
        created_at,
        role,
        student:students(full_name),
        porter:porters(full_name, assigned_hostel_id),
        administrator:administrators(full_name)
      `)

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,index_number.ilike.%${search}%`)
    }

    const { data: users, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching accounts:', error)
      return res.status(500).json({ error: 'Failed to fetch accounts' });
    }

    const transformedUsers = users.map((user: any) => {
      let fullName = ''
      let assignedHostelId = null
      if (user.role === 'student' && user.student) fullName = user.student.full_name || ''
      if (user.role === 'porter' && user.porter) {
        const p = Array.isArray(user.porter) ? user.porter[0] : user.porter;
        fullName = p?.full_name || ''
        assignedHostelId = p?.assigned_hostel_id || null
      }
      if (user.role === 'admin' && user.administrator) fullName = user.administrator.full_name || ''
      
      const nameParts = fullName.split(' ')
      
      return {
        id: user.id,
        email: user.email,
        firstName: nameParts[0] || 'N/A',
        lastName: nameParts.slice(1).join(' ') || '',
        role: user.role,
        indexNumber: user.index_number || '',
        phone: user.phone || '',
        status: user.status === 'active' ? 'active' : 'inactive',
        lastLogin: 'Never',
        createdAt: user.created_at,
        isLocked: user.status !== 'active',
        assignedHostelId
      }
    })

    return res.json(transformedUsers)

  } catch (error) {
    console.error('Admin accounts GET error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body
    
    const validation = adminUserSchema.safeParse(body)
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input', details: validation.error.errors });
    }

    const { firstName, lastName, email, role, phone, indexNumber, assignedHostelId } = validation.data
    const defaultPassword = 'Welcome@2025'
    const fullName = `${firstName} ${lastName}`.trim()

    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        firstName,
        lastName,
        role
      }
    })

    if (authError || !authUser?.user) {
      console.error('Auth creation error:', authError)
      return res.status(500).json({ error: authError?.message || 'Failed to create auth account' });
    }

    const userId = authUser.user.id

    // 2. Create Public User Record
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: hashedPassword,
        role,
        index_number: indexNumber || null,
        phone: phone || null,
        status: 'active'
      })

    if (userError) {
      console.error('Public user creation error:', userError)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(500).json({ error: 'Failed to create user record' });
    }

    // 3. Create Role-Specific Profile
    let profileError = null;
    if (role === 'student') {
      const { error } = await supabaseAdmin.from('students').insert({
        user_id: userId,
        full_name: fullName,
        programme: 'TBD',
        level: '100',
        date_of_birth: new Date().toISOString().split('T')[0],
        gender: 'Not Specified',
        next_of_kin_name: 'TBD',
        next_of_kin_phone: 'TBD'
      })
      profileError = error
    } else if (role === 'porter') {
      const { error } = await supabaseAdmin.from('porters').insert({
        user_id: userId,
        full_name: fullName,
        phone: phone || '',
        assigned_hostel_id: assignedHostelId || null
      })
      profileError = error
    } else if (role === 'admin') {
      const { error } = await supabaseAdmin.from('administrators').insert({
        user_id: userId,
        full_name: fullName
      })
      profileError = error
    }

    if (profileError) {
      console.error('Profile creation error:', profileError)
      await supabaseAdmin.from('users').delete().eq('id', userId)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(500).json({ error: 'Failed to create role profile' });
    }

    return res.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userId,
        email,
        role,
        firstName,
        lastName,
        assignedHostelId
      }
    });

  } catch (error) {
    console.error('Admin accounts POST error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const body = req.body;
    
    const { firstName, lastName, role, phone, indexNumber, assignedHostelId } = body;
    const fullName = `${firstName} ${lastName}`.trim();

    // 1. Update users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({
        role,
        index_number: indexNumber || null,
        phone: phone || null
      })
      .eq('id', userId);

    if (userError) throw userError;

    // 2. Update role-specific table
    if (role === 'student') {
      await supabaseAdmin.from('students').update({ full_name: fullName }).eq('user_id', userId);
    } else if (role === 'porter') {
      await supabaseAdmin.from('porters').update({ 
        full_name: fullName, 
        phone: phone || '',
        assigned_hostel_id: assignedHostelId || null 
      }).eq('user_id', userId);
    } else if (role === 'admin') {
      await supabaseAdmin.from('administrators').update({ full_name: fullName }).eq('user_id', userId);
    }

    return res.json({ success: true, message: 'Account updated successfully' });
  } catch (error) {
    console.error('Admin accounts PUT error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/toggle-lock', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { isLocked } = req.body;

    const newStatus = isLocked ? 'suspended' : 'active';
    
    const { error } = await supabaseAdmin
      .from('users')
      .update({ status: newStatus })
      .eq('id', userId);

    if (error) throw error;

    return res.json({ success: true, message: `Account ${isLocked ? 'locked' : 'unlocked'}` });
  } catch (error) {
    console.error('Toggle lock error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    // Supabase admin auth delete
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.warn('Auth user delete error (might be okay):', authError.message);
    }

    const { error: userError } = await supabaseAdmin.from('users').delete().eq('id', userId);
    if (userError) throw userError;

    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
