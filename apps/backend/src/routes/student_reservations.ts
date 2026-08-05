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




export const dynamic = 'force-dynamic'

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Fetch Unified Bookings History
    try {
      const { data: bookings, error: bookError } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          hostel:hostels(name),
          room_type:room_types(name, price),
          room:rooms(room_number),
          academic_session:academic_sessions(name)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      if (bookError) {
        console.error('Bookings fetch error:', bookError)
        return res.status(500).json({ error: 'Failed to fetch reservations history' })
      }

      const formattedHistory = (bookings || []).map((b: any) => ({
        id: b.id,
        type: b.status === 'pending_payment' ? 'reservation' : 'booking',
        status: b.status,
        createdAt: b.created_at,
        academicYear: b.academic_session?.name || 'N/A',
        semester: 'N/A',
        details: {
          hostel: b.hostel?.name || 'Pending',
          roomType: b.room_type?.name || 'Standard',
          room: b.room?.room_number,
          price: b.room_type?.price || b.amount_paid || 0
        },
        allocation: b.room ? {
          hostel: b.hostel?.name,
          roomNumber: b.room?.room_number,
          allocatedAt: b.updated_at
        } : undefined
      }))

      return res.json(formattedHistory)
    } catch (err) {
      console.error('Bookings exception:', err)
      return res.status(500).json({ error: 'Failed to fetch reservations history' })
    }
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return res.status(500).json({ error: 'Failed to fetch reservations history' });
  }
});

export default router;
