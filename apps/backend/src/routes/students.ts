import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
// Assuming security utils are ported
// import { roomBookingSchema } from '../lib/security/validation';
// import { bookingRateLimiter, getClientId } from '../lib/security/rateLimiting';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();

// Sub-routes for bookings
router.post('/bookings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body;
    const { hostelId, roomTypeId, roomId, academicSessionId } = body;

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Prevent Multiple Active Bookings (Risk 2.3)
    const { data: existingBookings, error: existingError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('student_id', userId)
      .eq('academic_session_id', academicSessionId)
      .in('status', ['pending_payment', 'paid', 'allocated', 'checked_in']);

    if (existingError) {
      return res.status(500).json({ error: 'Failed to verify existing bookings' });
    }

    if (existingBookings && existingBookings.length > 0) {
      return res.status(409).json({ error: 'You already have an active or pending booking for this academic session.' });
    }

    // 2. Use the secure RPC to prevent overbooking race conditions
    const { data: booking, error } = await supabase.rpc('book_room_safely', {
      p_student_id: userId,
      p_hostel_id: hostelId,
      p_room_type_id: roomTypeId,
      p_room_id: roomId || null,
      p_academic_session_id: academicSessionId
    });

    if (error) {
      if (error.message.includes('Room is fully occupied')) {
        return res.status(409).json({ error: 'Room is fully occupied' });
      }
      if (error.message.includes('Room not found')) {
        return res.status(404).json({ error: 'Room not found' });
      }
      return res.status(500).json({ error: 'Failed to create booking', details: error.message });
    }

    const { data: bookingDetails } = await supabase
      .from('bookings')
      .select('*, hostel:hostels(name), room_type:room_types(name), room:rooms(room_number)')
      .eq('id', booking.id)
      .single();

    res.json({ message: 'Room booked successfully', booking: bookingDetails });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bookings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.query.userId as string || req.user?.id;

    if (!userId) return res.status(400).json({ error: 'User ID required' });

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, hostel:hostels(name), room_type:room_types(name), room:rooms(room_number), academic_session:academic_sessions(name)')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: 'Failed to fetch bookings' });

    res.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/students - Main students route if needed
router.get('/', requireAuth, async (req, res) => {
  res.json({ message: 'GET /api/students not implemented' });
});

export default router;
