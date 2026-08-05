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




// GET /api/settings - Fetch public system settings
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('key, value')
      .in('key', ['booking_enabled', 'reservation_enabled', 'current_academic_year', 'current_semester'])

    if (error) {
      console.warn('[Settings Route] Error fetching settings, returning mock:', error);
      return res.json({
        data: {
          booking_enabled: true,
          reservation_enabled: true,
          current_academic_year: '2026/2027',
          current_semester: '1'
        }
      });
    }

    // Transform array to object for easier consumption
    const settingsObject = settings?.reduce((acc: any, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {})

    return res.json({
      data: settingsObject
    });
  } catch (error) {
    console.error('Error fetching settings:', error)
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;
