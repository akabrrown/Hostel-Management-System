import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

router.get('/', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { status, priority, category } = req.query;

    let query = supabaseAdmin
      .from('maintenance_requests')
      .select(`
        id,
        category,
        description,
        priority,
        status,
        created_at,
        reporter:users!maintenance_requests_reporter_id_fkey(role, email),
        room:rooms (
          room_number,
          hostel:hostels (name)
        )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;

    if (error) {
      console.error('Fetch admin maintenance error:', error);
      return res.status(500).json({ error: 'Failed to fetch reports' });
    }

    return res.json({ data });
  } catch (error) {
    console.error('Admin maintenance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/status', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const updates: any = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to update maintenance request' });
    }

    return res.json({ message: 'Updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
