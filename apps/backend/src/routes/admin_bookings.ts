import { Router, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

// GET all bookings with filtering
router.get('/', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        id,
        status,
        created_at,
        amount_paid,
        students (
          full_name,
          user:users ( index_number )
        ),
        hostel:hostels ( name ),
        rooms (
          room_number
        )
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status as string);
    }
    query = query.not('room_id', 'is', null);

    const { data, error, count } = await query;

    if (error) throw error;

    return res.json({ 
      data,
      meta: { count: count || (data ? data.length : 0) }
    });
  } catch (error: any) {
    console.error('Fetch bookings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single booking details
router.get('/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        students ( full_name, user:users ( index_number, email, phone ) ),
        hostel:hostels ( id, name ),
        rooms ( id, room_number )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update booking status
router.put('/:id/status', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; 

    // 'pending', 'awaiting_payment', 'paid', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled', 'completed'
    const validStatuses = ['pending_payment', 'paid', 'allocated', 'checked_in', 'checked_out', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ message: `Booking status updated to ${status}`, data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST re-allocate booking to different room
router.post('/:id/reallocate', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newRoomId } = req.body;

    if (!newRoomId) {
      return res.status(400).json({ error: 'newRoomId is required' });
    }

    // This is a simplified reallocation. In production, we'd wrap this in a transaction:
    // 1. Decrease occupancy of old room
    // 2. Increase occupancy of new room
    // 3. Update booking

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ room_id: newRoomId, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ message: 'Room reallocated successfully', data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
