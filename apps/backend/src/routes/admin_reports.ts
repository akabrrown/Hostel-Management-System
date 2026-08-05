import { Router, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

// GET /api/admin/reports/occupancy
router.get('/occupancy', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { data: hostels, error: hostelErr } = await supabaseAdmin
      .from('hostels')
      .select('id, name');

    if (hostelErr) throw hostelErr;

    // rooms → floors → blocks gives us the hostel link
    const { data: rooms, error: roomErr } = await supabaseAdmin
      .from('rooms')
      .select(`
        capacity,
        current_occupancy,
        status,
        floors!inner (
          blocks!inner (
            hostel_id
          )
        )
      `);

    if (roomErr) throw roomErr;

    const hostelStats = hostels.map(h => {
      const hRooms = (rooms || []).filter((r: any) => {
        const floor = Array.isArray(r.floors) ? r.floors[0] : r.floors;
        const block = floor?.blocks;
        const resolvedBlock = Array.isArray(block) ? block[0] : block;
        return resolvedBlock?.hostel_id === h.id;
      });
      const totalCapacity = hRooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);
      const totalOccupied = hRooms.reduce((sum: number, r: any) => sum + (r.current_occupancy || 0), 0);
      return {
        name: h.name,
        totalCapacity,
        totalOccupied,
        rate: totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0
      };
    });

    return res.json({ data: hostelStats });
  } catch (error: any) {
    console.error('Error fetching occupancy reports:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/reports/payments
router.get('/payments', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    // Generate real chart data for the last 6 months
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('amount, status, created_at')
      .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString())
    
    if (error) throw error

    const monthsData = new Map<string, { name: string, paid: number, pending: number }>()
    
    // Initialize last 6 months (including current)
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStr = d.toLocaleString('en-US', { month: 'short' });
      monthsData.set(monthStr, { name: monthStr, paid: 0, pending: 0 });
    }

    if (payments) {
      payments.forEach(payment => {
        const d = new Date(payment.created_at);
        const monthStr = d.toLocaleString('en-US', { month: 'short' });
        
        if (monthsData.has(monthStr)) {
          const m = monthsData.get(monthStr)!;
          if (payment.status === 'paid' || payment.status === 'Paid') {
            m.paid += Number(payment.amount);
          } else {
            m.pending += Number(payment.amount);
          }
        }
      });
    }

    const data = Array.from(monthsData.values());

    return res.json({ data });
  } catch (error: any) {
    console.error('Error fetching payments reports:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/reports/activities
router.get('/activities', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const daysData = new Map<string, { name: string, visitors: number, keyMovements: number, maintenance: number }>()
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
       const d = new Date();
       d.setDate(d.getDate() - i);
       const dayStr = d.toLocaleString('en-US', { weekday: 'short' });
       daysData.set(dayStr, { name: dayStr, visitors: 0, keyMovements: 0, maintenance: 0 });
    }

    const startDate = new Date(new Date().setDate(new Date().getDate() - 6)).toISOString()

    const [visitorsReq, keysReq, maintenanceReq] = await Promise.all([
      supabaseAdmin.from('visitors').select('created_at').gte('created_at', startDate),
      supabaseAdmin.from('room_key_transactions').select('created_at').gte('created_at', startDate),
      supabaseAdmin.from('maintenance_requests').select('created_at').gte('created_at', startDate)
    ])

    if (visitorsReq.data) {
      visitorsReq.data.forEach(v => {
        const dayStr = new Date(v.created_at).toLocaleString('en-US', { weekday: 'short' })
        if (daysData.has(dayStr)) daysData.get(dayStr)!.visitors += 1
      })
    }

    if (keysReq.data) {
      keysReq.data.forEach(k => {
        const dayStr = new Date(k.created_at).toLocaleString('en-US', { weekday: 'short' })
        if (daysData.has(dayStr)) daysData.get(dayStr)!.keyMovements += 1
      })
    }

    if (maintenanceReq.data) {
      maintenanceReq.data.forEach(m => {
        const dayStr = new Date(m.created_at).toLocaleString('en-US', { weekday: 'short' })
        if (daysData.has(dayStr)) daysData.get(dayStr)!.maintenance += 1
      })
    }

    const data = Array.from(daysData.values());

    return res.json({ data });
  } catch (error: any) {
    console.error('Error fetching activities reports:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
