import { Router, Response } from 'express';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const maintenanceSchema = z.object({
      room_id: z.string().uuid(),
      category: z.enum(['electrical', 'plumbing', 'furniture', 'cleaning', 'other']),
      description: z.string().min(10),
      images: z.array(z.string().url()).optional().default([]),
      priority: z.enum(['low', 'medium', 'high', 'emergency']).optional().default('medium'),
    }).strict();

    const result = maintenanceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }
    
    const { room_id, category, description, images, priority } = result.data;
    const reporter_id = req.user?.id;

    if (!reporter_id) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabase
      .from('maintenance_requests')
      .insert({
        reporter_id,
        room_id,
        category,
        description,
        images: images || [],
        priority: priority || 'medium',
        status: 'open'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Maintenance report submitted', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/status', requireAuth, requireRole(['admin', 'porter', 'director']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const statusSchema = z.object({
      status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
    }).strict();

    const result = statusSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
    }
    
    const { status } = result.data;
    
    const { data, error } = await supabase
      .from('maintenance_requests')
      .update({ 
        status, 
        resolved_at: status === 'resolved' ? new Date().toISOString() : null 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Maintenance status updated', data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;
    let query = supabase.from('maintenance_requests').select('*, rooms(room_number)');
    
    if (role === 'student') {
      query = query.eq('reporter_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
