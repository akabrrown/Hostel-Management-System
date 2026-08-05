import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();




router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body
    const { studentId, notes } = body
    const porterId = req.user?.id;

    if (!studentId || !porterId) {
      return res.status(400).json({ error: 'Student ID and Porter auth are required' });
    }

    // Process check-in (Update booking status)
    // We assume the student has an 'allocated' or 'paid' booking with a room_id assigned
    const { data: booking, error: checkInError } = await supabase
      .from('bookings')
      .update({ 
        status: 'checked_in',
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .in('status', ['paid', 'allocated']) // Valid states to check in from
      .not('room_id', 'is', null)
      .select(`
        id,
        status,
        room_id,
        student:students (
          full_name,
          user:users (index_number)
        ),
        room:rooms (
          room_number
        )
      `)
      .single()

    if (checkInError || !booking) {
      console.error('Check-in error:', checkInError)
      return res.status(500).json({ error: 'Failed to check in student. Ensure they have a valid allocated room booking.' });
    }

    // Insert into check_ins log table
    await supabase.from('check_ins').insert({
      booking_id: booking.id,
      student_id: studentId,
      room_id: booking.room_id,
      porter_id: porterId,
      notes: notes || null
    });

    // Transform to camelCase for frontend
    const transformed = {
      id: booking.id,
      status: booking.status,
      checkInTime: new Date().toISOString(),
      student: {
        id: studentId,
        firstName: (booking.student as any)?.full_name?.split(' ')[0] || '',
        lastName: (booking.student as any)?.full_name?.split(' ').slice(1).join(' ') || '',
        indexNumber: (booking.student as any)?.user?.index_number
      },
      room: {
        roomNumber: (booking.room as any)?.room_number
      }
    }

    return res.json({ data: transformed });

  } catch (error) {
    console.error('Check-in execution error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query['status'] as string
    const roomId = req.query['roomId'] as string

    let query = supabase
      .from('bookings')
      .select(`
        *,
        student:students (
          full_name,
          user:users (index_number, phone)
        ),
        room:rooms (
          room_number,
          floor_id,
          hostel:hostels (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (roomId) query = query.eq('room_id', roomId)

    const { data: bookings, error } = await query

    if (error) {
      return res.status(500).json({ error: 'Failed' });
    }

    return res.json({ bookings });
  } catch (error) {
    return res.status(500).json({ error: 'Error' });
  }
});

export default router;
