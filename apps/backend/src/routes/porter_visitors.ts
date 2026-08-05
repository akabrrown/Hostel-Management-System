import { Router, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

// List visitors scoped to the porter's hostel
router.get('/', requireAuth, requireRole(['porter']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: porter } = await supabaseAdmin
      .from('porters')
      .select('assigned_hostel_id')
      .eq('user_id', userId)
      .single();

    let hostelId = porter?.assigned_hostel_id;

    if (!hostelId) {
      const { data: fallback } = await supabaseAdmin.from('hostels').select('id').limit(1).maybeSingle();
      hostelId = fallback?.id;
    }

    if (!hostelId) {
      return res.json({ data: [] });
    }

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
        student:student_id (
          full_name
        ),
        room:room_id (
          room_number,
          floor:floors(hostel_id)
        )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status as string);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Porter visitors fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch visitors' });
    }

    // Filter to only show visitors for rooms in the porter's hostel
    const filtered = (data || []).filter((v: any) => {
      return v.room?.floor?.hostel_id === hostelId;
    });

    const transformed = filtered.map((v: any) => ({
      id: v.id,
      visitorName: v.visitor_name,
      phone: v.phone,
      relationship: v.relationship,
      purpose: v.visit_purpose,
      expectedArrival: v.expected_arrival_time,
      status: v.status,
      createdAt: v.created_at,
      studentName: v.student?.full_name || 'Unknown',
      roomNumber: v.room?.room_number || 'Unknown'
    }));

    return res.json({ data: transformed });
  } catch (error) {
    console.error('Porter visitors error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update visitor status (approve, reject, record arrival, record departure)
router.put('/:id/status', requireAuth, requireRole(['porter']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const porterId = req.user?.id;

    if (!porterId) return res.status(401).json({ error: 'Unauthorized' });

    const validStatuses = ['approved', 'rejected', 'arrived', 'departed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: approved, rejected, arrived, departed' });
    }

    const updateFields: any = { status };
    if (status === 'arrived') updateFields.actual_arrival_time = new Date().toISOString();
    if (status === 'departed') updateFields.departure_time = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('visitors')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Visitor status update error:', error);
      return res.status(500).json({ error: 'Failed to update visitor status' });
    }

    // Log the action
    try {
      await supabaseAdmin.from('visitor_logs').insert({
        visitor_id: id,
        porter_id: porterId,
        action: status,
        notes: notes || null
      });
    } catch (e) {
      // visitor_logs table might not exist yet, don't block the update
    }

    return res.json({ message: 'Visitor status updated', data });
  } catch (error) {
    console.error('Visitor status update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
