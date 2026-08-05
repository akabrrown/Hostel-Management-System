import { Router, Response } from 'express';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();

// Student creates a visitor request
router.post('/request', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const visitorSchema = z.object({
      room_id: z.string().uuid(),
      visitor_name: z.string().min(2),
      phone: z.string().min(10),
      relationship: z.string().min(2),
      visit_purpose: z.string().min(5),
      expected_arrival_time: z.string().datetime(),
    }).strict();

    const result = visitorSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }

    const { room_id, visitor_name, phone, relationship, visit_purpose, expected_arrival_time } = result.data;
    const student_id = req.user?.id;

    if (!student_id) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('visitors')
      .insert({
        student_id,
        room_id,
        visitor_name,
        phone,
        relationship,
        visit_purpose,
        expected_arrival_time,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Visitor request submitted', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Porter updates visitor status
router.put('/:id/status', requireAuth, requireRole(['admin', 'porter', 'director']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const statusSchema = z.object({
      status: z.enum(['approved', 'rejected', 'arrived', 'departed']),
      notes: z.string().optional(),
    }).strict();

    const result = statusSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }

    const { status, notes } = result.data;
    const porter_id = req.user?.id;

    if (!porter_id) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('visitors')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    await supabase.from('visitor_logs').insert({
      visitor_id: id,
      porter_id,
      action: status,
      notes
    });

    res.json({ message: 'Visitor status updated', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get visitors (scoped by user role conceptually, here just basic fetch for demo)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;
    let query = supabase.from('visitors').select('*, students(full_name), rooms(room_number)');
    
    if (role === 'student') {
      query = query.eq('student_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
