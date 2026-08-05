import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getIO } from '../socket';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();

const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  type: z.enum(['info', 'success', 'warning', 'error', 'payment', 'booking']),
  userId: z.string().uuid('Invalid user ID'),
  isRead: z.boolean().default(false),
  actionUrl: z.string().url().optional(),
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const userId = user.id || user.userId;

    const page = parseInt((req.query.page as string) || '1');
    const limit = Math.min(parseInt((req.query.limit as string) || '10'), 50);
    const type = req.query.type as string;
    const isRead = req.query.isRead as string;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (isRead !== undefined) query = query.eq('is_read', isRead === 'true');

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: notifications, error, count } = await query;

    if (error) throw error;

    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    res.json({
      data: notifications,
      unreadCount: unreadCount || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (!['admin', 'director', 'porter'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const validatedData = notificationSchema.parse(req.body);

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Emit real-time push notification via Socket.io
    try {
      getIO().to(`user_${notification.user_id}`).emit('new_notification', notification);
    } catch (socketErr) {
      console.error('Failed to emit socket event:', socketErr);
    }

    res.json({ message: 'Notification created successfully', data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { notificationIds, isRead } = req.body;

    if (!notificationIds || typeof isRead !== 'boolean') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    const { data: notifications, error } = await supabase
      .from('notifications')
      .update({ is_read: isRead })
      .in('id', ids)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    res.json({ message: 'Notifications updated successfully', data: notifications });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notificationIds = req.query.ids as string;

    if (!notificationIds) {
      return res.status(400).json({ error: 'Notification IDs are required' });
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .in('id', notificationIds.split(','))
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Notifications deleted successfully' });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

export default router;
