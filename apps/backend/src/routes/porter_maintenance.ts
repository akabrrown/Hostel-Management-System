import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

// GET maintenance reports for porter's assigned hostel
router.get('/', requireAuth, requireRole(['porter']), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Get Porter's Assigned Hostel
    const { data: porter, error: porterError } = await supabaseAdmin
      .from('porters')
      .select('assigned_hostel_id')
      .eq('user_id', userId)
      .single();

    if (porterError || !porter?.assigned_hostel_id) {
       return res.json({ data: [] });
    }

    // 2. Fetch Maintenance Reports for rooms in that hostel
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
        room:rooms!inner (
          room_number,
          hostel_id
        )
      `)
      .eq('room.hostel_id', porter.assigned_hostel_id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch porter maintenance error:', error);
      return res.status(500).json({ error: 'Failed to fetch maintenance reports' });
    }

    return res.json({ data });
  } catch (error) {
    console.error('Porter maintenance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH update status or priority of a maintenance request
router.patch('/:id/status', requireAuth, requireRole(['porter']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Ensure the porter is assigned to the hostel of the room this maintenance request belongs to
    const { data: request, error: reqError } = await supabaseAdmin
      .from('maintenance_requests')
      .select('room:rooms(hostel_id)')
      .eq('id', id)
      .single();

    if (reqError || !request) return res.status(404).json({ error: 'Request not found' });

    const { data: porter } = await supabaseAdmin
      .from('porters')
      .select('assigned_hostel_id')
      .eq('user_id', userId)
      .single();

    if ((request.room as any)?.hostel_id !== porter?.assigned_hostel_id) {
      return res.status(403).json({ error: 'Forbidden. You do not manage this hostel.' });
    }

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
