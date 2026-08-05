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




// GET /api/admin/settings - Fetch all system settings
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')

    if (error) {
      console.warn('[Admin Settings Route] Error fetching settings, returning empty array:', error);
      return res.json({ settings: [] });
    }

    return res.json({ settings });
  } catch (error) {
    console.warn('[Admin Settings Route] API Error, returning empty array:', error)
    return res.json({ settings: [] });
  }
});
// POST /api/admin/settings - Update system settings
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body
    const { key, value, description } = body

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and Value are required' });
    }

    const { data: setting, error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        key,
        value,
        description,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return res.json({ message: 'Setting updated successfully', setting });
  } catch (error) {
    console.error('Error updating setting:', error)
    return res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
