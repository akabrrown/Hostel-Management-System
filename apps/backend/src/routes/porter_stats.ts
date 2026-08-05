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




router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Get Porter's Assigned Hostel
    const { data: porter } = await supabaseAdmin
      .from('porters')
      .select('assigned_hostel_id')
      .eq('user_id', userId)
      .single()

    let hostelId = porter?.assigned_hostel_id

    if (!hostelId) {
      // Fallback for testing
      const { data: firstHostel } = await supabaseAdmin.from('hostels').select('id').limit(1).maybeSingle()
      hostelId = firstHostel?.id
    }

    if (!hostelId) {
      return res.json({
        occupancy: 0,
        totalCapacity: 0,
        checkedIn: 0,
        availableBeds: 0,
        todayActivity: 0
      });
    }

    // 2. Get Stats for this Hostel
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('capacity, current_occupancy, floors!inner(blocks!inner(hostel_id))')
      .eq('floors.blocks.hostel_id', hostelId)

    let totalCapacity = 0
    let currentOccupancy = 0
    rooms?.forEach(r => {
      totalCapacity += r.capacity
      currentOccupancy += (r.current_occupancy || 0)
    })

    // 3. Today's Activity
    const today = new Date().toISOString().split('T')[0]
    
    // Count check-ins and check-outs today by this porter
    const [{ count: todayCheckIns }, { count: todayCheckOuts }] = await Promise.all([
      supabaseAdmin
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('porter_id', userId)
        .gte('checked_in_at', `${today}T00:00:00Z`),
      supabaseAdmin
        .from('check_outs')
        .select('*', { count: 'exact', head: true })
        .eq('porter_id', userId)
        .gte('checked_out_at', `${today}T00:00:00Z`)
    ]);

    const todayActivity = (todayCheckIns || 0) + (todayCheckOuts || 0);

    return res.json({
      occupancy: currentOccupancy,
      totalCapacity,
      checkedIn: currentOccupancy,
      availableBeds: totalCapacity - currentOccupancy,
      todayActivity
    });

  } catch (error) {
    console.error('Porter stats error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
