import { Router, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

// GET all reservations with filtering
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
    query = query.is('room_id', null);

    const { data, error, count } = await query;

    if (error) throw error;

    return res.json({ 
      data,
      meta: { count: count || (data ? data.length : 0) }
    });
  } catch (error: any) {
    console.error('Fetch reservations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single reservation details
router.get('/:id', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        students ( full_name, user:users ( index_number, email, phone ) ),
        hostel:hostels ( name ),
        rooms ( room_number )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT update reservation status (Approve, Cancel, Convert)
router.put('/:id/status', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // 'cancelled', 'converted_to_booking', etc.

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
    
    // Log action if needed
    // ...

    return res.json({ message: `Reservation status updated to ${status}`, data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST extend payment deadline
router.post('/:id/extend', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { daysToAdd = 2 } = req.body;

    // First fetch current reservation
    const { data: resData, error: fetchErr } = await supabaseAdmin
      .from('bookings')
      .select('created_at') // bookings table doesn't have expires_at, using created_at for now
      .eq('id', id)
      .single();

    if (fetchErr || !resData) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Since expires_at is removed, we'll just return success for now
    // as bookings don't expire in the same way in the new schema.
    return res.json({ message: 'Reservation extended successfully (No-op in new schema)', data: resData });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /expire-overdue - Job to auto-expire reservations past their deadline
router.post('/expire-overdue', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    now.setDate(now.getDate() - 3); // 3 days ago as threshold
    const thresholdDate = now.toISOString();
    
    // Find reservations that are pending_payment and older than 3 days
    const { data: expired, error: fetchErr } = await supabaseAdmin
      .from('bookings')
      .select('id, room_id')
      .eq('status', 'pending_payment')
      .lt('created_at', thresholdDate);

    if (fetchErr) throw fetchErr;

    if (!expired || expired.length === 0) {
      return res.json({ message: 'No overdue reservations found', expiredCount: 0 });
    }

    // Update status to expired (using cancelled since expired doesn't exist)
    const expiredIds = expired.map((r: any) => r.id);
    const { error: updateErr } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .in('id', expiredIds);

    if (updateErr) throw updateErr;

    // Release rooms hold by resetting occupancy (if reservations hold occupancy - depending on schema)
    // Assuming reservations don't hold physical room_keys, just room status.

    return res.json({ message: `Successfully expired ${expired.length} reservations`, expiredCount: expired.length });
  } catch (error: any) {
    console.error('Expire overdue error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
