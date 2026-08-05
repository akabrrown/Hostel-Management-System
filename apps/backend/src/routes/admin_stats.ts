import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

export const dynamic = 'force-dynamic'

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // 1. Total Students
    const { count: totalStudents, error: studentError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student')

    if (studentError) throw studentError

    // 2. Occupancy Rate
    const { data: roomStats, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('capacity, current_occupancy')

    if (roomError) throw roomError

    let totalCapacity = 0
    let totalOccupied = 0

    if (roomStats) {
      roomStats.forEach(room => {
        totalCapacity += room.capacity
        totalOccupied += room.current_occupancy || 0
      })
    }

    const occupancyRate = totalCapacity > 0 
      ? Math.round((totalOccupied / totalCapacity) * 100) 
      : 0

    // 3. Pending Payments
    const { count: pendingPayments, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (paymentError) throw paymentError

    // 4. Pending Applications
    const { count: pendingBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_payment')

    if (bookingError) throw bookingError

    const pendingApplications = pendingBookings || 0

    // 5. Recent Activity (Latest 5 students)
    const { data: recentStudents, error: recentError } = await supabaseAdmin
      .from('students')
      .select(`
        user_id, 
        created_at,
        full_name,
        user:users!inner (
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (recentError) throw recentError

    const recentActivities = recentStudents?.map(s => {
       const name = s.full_name || 'New Student'
       
       return {
          id: s.user_id,
          type: 'student_added' as const,
          description: `New student ${name} registered`,
          timestamp: s.created_at,
       }
    }) || []

    return res.json({
      totalStudents: totalStudents || 0,
      occupancyRate,
      pendingPayments: pendingPayments || 0,
      pendingApplications,
      recentActivities,
    });

  } catch (error) {
    console.warn('[Admin Stats Route] Error fetching stats, returning defaults:', error)
    return res.json({
      totalStudents: 0,
      occupancyRate: 0,
      pendingPayments: 0,
      pendingApplications: 0,
      recentActivities: [],
    });
  }
});

export default router;
