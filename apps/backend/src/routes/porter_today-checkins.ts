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
    const today = new Date().toISOString().split('T')[0]

    const [checkInsResult, checkOutsResult] = await Promise.all([
      supabaseAdmin
        .from('check_ins')
        .select(`
          id,
          checked_in_at,
          notes,
          student:students!check_ins_student_id_fkey (
            full_name,
            user:users!students_user_id_fkey (index_number)
          ),
          room:rooms (
            room_number,
            floors (
              blocks (
                hostels (name)
              )
            )
          )
        `)
        .gte('checked_in_at', `${today}T00:00:00Z`),
      supabaseAdmin
        .from('check_outs')
        .select(`
          id,
          checked_out_at,
          condition_report,
          student:students!check_outs_student_id_fkey (
            full_name,
            user:users!students_user_id_fkey (index_number)
          ),
          room:rooms (
            room_number,
            floors (
              blocks (
                hostels (name)
              )
            )
          )
        `)
        .gte('checked_out_at', `${today}T00:00:00Z`)
    ]);

    if (checkInsResult.error || checkOutsResult.error) {
      console.error('Fetch today checkins/checkouts error:', checkInsResult.error || checkOutsResult.error);
      return res.status(500).json({ error: 'Failed to fetch check-ins and check-outs' });
    }

    const transformedCheckIns = (checkInsResult.data || []).map((r: any) => ({
      id: r.id,
      action: 'checkin',
      timestamp: r.checked_in_at,
      studentName: r.student?.full_name || 'Unknown Student',
      indexNumber: r.student?.user?.index_number,
      room: r.room?.room_number,
      hostel: r.room?.floors?.blocks?.hostels?.name || 'Unknown Hostel'
    }));

    const transformedCheckOuts = (checkOutsResult.data || []).map((r: any) => ({
      id: r.id,
      action: 'checkout',
      timestamp: r.checked_out_at,
      studentName: r.student?.full_name || 'Unknown Student',
      indexNumber: r.student?.user?.index_number,
      room: r.room?.room_number,
      hostel: r.room?.floors?.blocks?.hostels?.name || 'Unknown Hostel'
    }));

    const combined = [...transformedCheckIns, ...transformedCheckOuts].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return res.json({ data: combined });

  } catch (error) {
    console.error('Today checkins error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
