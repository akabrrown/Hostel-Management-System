import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

// GET all visitors for admin oversight
router.get('/', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('visitors')
      .select(`
        id,
        visitor_name,
        phone,
        relationship,
        visit_purpose,
        expected_arrival_time,
        status,
        created_at,
        student:students!visitors_student_id_fkey (
          full_name,
          user:users!students_user_id_fkey(index_number)
        ),
        room:rooms (
          room_number,
          hostel:hostels (name)
        )
      `)
      .order('expected_arrival_time', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch visitors error:', error);
      return res.status(500).json({ error: 'Failed to fetch visitors' });
    }

    return res.json({ data });
  } catch (error) {
    console.error('Admin visitors error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET logs for a specific visitor
router.get('/:id/logs', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('visitor_logs')
      .select(`
        id,
        action,
        action_time,
        notes,
        porter:porters!visitor_logs_porter_id_fkey(full_name)
      `)
      .eq('visitor_id', id)
      .order('action_time', { ascending: true });

    if (error) {
      console.error('Fetch visitor logs error:', error);
      return res.status(500).json({ error: 'Failed to fetch visitor logs' });
    }

    return res.json({ data });
  } catch (error) {
    console.error('Admin visitor logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
