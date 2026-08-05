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
    const { studentId, notes, conditionReport } = body
    const porterId = req.user?.id;

    if (!studentId || !porterId) {
      return res.status(400).json({ error: 'Student ID and Porter auth are required' });
    }

    // 1. Enforce Key Return (Risk 7.2)
    const { data: heldKeys, error: keyErr } = await supabaseAdmin
      .from('room_keys')
      .select('id')
      .eq('current_holder_student_id', studentId)
      .eq('status', 'With Student');
      
    if (keyErr) {
      console.error('Key check error:', keyErr);
      return res.status(500).json({ error: 'Failed to verify key status.' });
    }
    
    if (heldKeys && heldKeys.length > 0) {
      return res.status(403).json({ error: 'Student must return room key before check-out can be completed.' });
    }

    // 2. Process check-out
    const { data: booking, error: checkOutError } = await supabase
      .from('bookings')
      .update({ 
        status: 'checked_out',
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId)
      .eq('status', 'checked_in')
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

    if (checkOutError || !booking) {
      console.error('Check-out error:', checkOutError)
      return res.status(500).json({ error: 'Failed to check out student. Ensure they are currently checked in.' });
    }

    // Insert into check_outs log table
    await supabase.from('check_outs').insert({
      booking_id: booking.id,
      student_id: studentId,
      room_id: booking.room_id,
      porter_id: porterId,
      condition_report: conditionReport || notes || null
    });

    // Mark room occupancy down
    if (booking.room_id) {
      const { data: room } = await supabase.from('rooms').select('current_occupancy').eq('id', booking.room_id).single();
      if (room && room.current_occupancy > 0) {
        await supabase
          .from('rooms')
          .update({ current_occupancy: room.current_occupancy - 1 })
          .eq('id', booking.room_id)
      }
    }

    // Transform to camelCase
    const transformed = {
      id: booking.id,
      status: booking.status,
      checkOutTime: new Date().toISOString(),
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
    console.error('Check-out execution error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
