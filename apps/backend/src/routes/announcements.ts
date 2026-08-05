import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const router = Router();

const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  category: z.enum(['general', 'payment', 'maintenance', 'academic', 'urgent', 'emergency']),
  targetAudience: z.string().min(1, 'Target audience is required'),
  isActive: z.boolean().default(true),
  priority: z.enum(['low', 'medium', 'high', 'emergency']).default('medium'),
  scheduledFor: z.string().datetime().optional().nullable(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = Math.min(parseInt((req.query.limit as string) || '10'), 50);
    const category = req.query.category as string;
    const targetAudience = req.query.targetAudience as string;
    const isActive = req.query.isActive as string;

    let query = supabaseAdmin
      .from('announcements')
      .select(`
        *
      `)
      .order('created_at', { ascending: false });

    // Schema does not support category, target_audience, is_published yet
    // we just ignore these filters for now since the table lacks them

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: announcements, error, count } = await query;

    if (error) {
      console.warn('[Announcements Route] Error fetching announcements, returning empty:', error);
      // Table or relationship missing - return empty data gracefully
      return res.json({
        data: [],
        pagination: { page, limit, total: 0, pages: 0 },
      });
    }

    const processedData = announcements?.map((a: any) => {
      const profilesMeta = {
        first_name: a.author?.full_name?.split(' ')[0] || 'System',
        last_name: a.author?.full_name?.split(' ').slice(1).join(' ') || 'Admin',
        email: a.author?.user?.email || 'admin@upsa.edu.gh'
      };

      return {
        ...a,
        status: 'published',
        scheduled_for: a.created_at,
        category: 'General',
        priority: 'Medium',
        target_audience: 'All',
        author: `${profilesMeta.first_name} ${profilesMeta.last_name}`,
        creator: profilesMeta,
        date: a.created_at
      };
    });

    res.json({
      data: processedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (!['admin', 'director', 'porter'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validatedData = announcementSchema.parse(req.body);
    const userId = req.user?.id || req.user?.userId;

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .insert({
        title: validatedData.title,
        content: validatedData.content,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Announcement created successfully', data: announcement });
  } catch (error) {
    console.error('Error creating announcement:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// UPDATE announcement
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (!['admin', 'director', 'porter'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;
    const validatedData = announcementSchema.parse(req.body);

    const { data: announcement, error } = await supabaseAdmin
      .from('announcements')
      .update({
        title: validatedData.title,
        content: validatedData.content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Announcement updated successfully', data: announcement });
  } catch (error) {
    console.error('Error updating announcement:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// DELETE announcement
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (!['admin', 'director', 'porter'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

export default router;
