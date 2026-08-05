import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  phoneNumber: z.string().min(10, 'Phone number too short').max(15, 'Phone number too long').optional(),
  programOfStudy: z.string().min(1, 'Program is required').max(100, 'Program too long').optional(),
  yearOfStudy: z.number().min(1, 'Year must be at least 1').max(6, 'Year too high').optional(),
  indexNumber: z.string().min(1, 'Index number is required').max(20, 'Index number too long').optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required').max(100, 'Name too long').optional(),
  emergencyContactPhone: z.string().min(10, 'Emergency phone too short').max(15, 'Phone too long').optional(),
  emergencyContactRelationship: z.string().min(1, 'Relationship is required').max(50, 'Relationship too long').optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const userId = user.id || user.userId;
    const userEmail = user.email;
    const userRole = user.role;
    
    let profileData: any = null;
    let table = 'students';
    if (userRole === 'porter') table = 'porters';
    if (userRole === 'admin') table = 'administrators';

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from(table)
      .select(`
        *,
        users(email, index_number, phone)
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (dbError || !dbData) {
      if (dbError) console.warn(`[Profile Route] Error fetching ${table}, using fallback:`, dbError);
      profileData = {
        first_name: 'System',
        last_name: 'User',
        phone_number: '',
        users: { email: userEmail, index_number: '', phone: '' }
      };
    } else {
      profileData = dbData;
    }

    const { data: accommodations } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        status,
        room_id,
        created_at,
        hostel:hostels(name),
        room_type:room_types(name),
        room:rooms(
          room_number,
          floors(blocks(hostels(name)))
        )
      `)
      .eq('student_id', userId)
      .in('status', ['pending_payment', 'allocated', 'checked_in'])
      .order('created_at', { ascending: false })
      .limit(1);

    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select(`*, hostel:hostels(name), room_type:room_types(name), room:rooms(room_number, floors(blocks(hostels(name))))`)
      .eq('student_id', userId)
      .not('room_id', 'is', null);

    const { data: reservations } = await supabaseAdmin
      .from('bookings')
      .select(`*, hostel:hostels(name), room_type:room_types(name)`)
      .eq('student_id', userId)
      .is('room_id', null);

    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select(`*`)
      .eq('student_id', userId)
      .order('created_at', { ascending: false });

    // Fetch invoices linked to this student's bookings
    const { data: invoices } = await supabaseAdmin
      .from('finance_invoices')
      .select(`
        id,
        invoice_reference,
        amount,
        status,
        issued_at,
        paid_at,
        booking:bookings(
          id,
          status,
          hostel:hostels(name),
          room:rooms(room_number, floors(blocks(hostels(name))))
        )
      `)
      .eq('student_id', userId)
      .order('issued_at', { ascending: false });

    res.json({
      data: {
        user: { id: userId, email: userEmail, role: userRole },
        profile: {
          ...profileData,
          first_name: profileData.full_name?.split(' ')[0] || profileData.first_name,
          last_name: profileData.full_name?.split(' ').slice(1).join(' ') || profileData.last_name,
          accommodation: accommodations?.[0] || null,
          bookings: bookings || [],
          reservations: reservations || [],
          payments: payments || [],
          invoices: invoices || []
        },
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = user.id || user.userId;
    const userRole = user.role;
    const userEmail = user.email;

    const { action } = req.body;

    let table = 'students';
    if (userRole === 'porter') table = 'porters';
    if (userRole === 'admin') table = 'administrators';

    if (action === 'profile') {
      const validatedData = profileUpdateSchema.parse(req.body);
      
      const fullName = validatedData.firstName && validatedData.lastName 
        ? `${validatedData.firstName} ${validatedData.lastName}`
        : undefined;

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (fullName) updateData.full_name = fullName;
      
      if (userRole === 'student') {
        if (validatedData.programOfStudy) updateData.programme = validatedData.programOfStudy;
        if (validatedData.emergencyContactName) updateData.next_of_kin_name = validatedData.emergencyContactName;
        if (validatedData.emergencyContactPhone) updateData.next_of_kin_phone = validatedData.emergencyContactPhone;
        // The indexNumber is on users table. If we want to update it, we need a separate query.
      }

      if (Object.keys(updateData).length > 1) { // more than just updated_at
        const { data: profile, error } = await supabaseAdmin
          .from(table)
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
      }
      
      if (userRole === 'student' && validatedData.indexNumber) {
        const { error: userError } = await supabaseAdmin
          .from('users')
          .update({ index_number: validatedData.indexNumber })
          .eq('id', userId);
        if (userError) throw userError;
      }

      // Handle Phone Number update on the users table (applies to all roles)
      if (validatedData.phoneNumber) {
        const { error: phoneError } = await supabaseAdmin
          .from('users')
          .update({ phone: validatedData.phoneNumber })
          .eq('id', userId);
        if (phoneError) throw phoneError;
      }

      return res.json({ message: 'Profile updated successfully' });

    } else if (action === 'password') {
      const passwordData = passwordChangeSchema.parse(req.body);
      
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: passwordData.currentPassword,
      });

      if (verifyError) return res.status(400).json({ error: 'Current password is incorrect' });

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: passwordData.newPassword }
      );

      if (updateError) return res.status(500).json({ error: 'Failed to update password' });
      return res.json({ message: 'Password updated successfully' });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
