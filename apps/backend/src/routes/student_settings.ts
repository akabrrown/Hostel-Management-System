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





const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Admin client for bypass RLS if needed, but we'll try to use user auth when possible


async function getUserId(request: Request) {
  // Simple check for auth session - in a real app this would use a more robust helper
  // For this implementation, we'll rely on the user passing their ID in some way or 
  // extract it from the session if available.
  // Since we are in Next.js App Router, we should ideally use supabase server client.
  return null; // Placeholder
}
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch settings
    const { data: initialSettings, error } = await supabaseAdmin
      .from('student_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let settings = initialSettings

    // If no settings exist, create defaults
    if (error && error.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabaseAdmin
        .from('student_settings')
        .insert({
          user_id: user.id,
          email_notifications: true,
          sms_notifications: true,
          push_notifications: false,
          theme: 'light'
        })
        .select()
        .single()

      if (createError) {
        if (createError.code === 'PGRST205' || createError.code === '42P01') {
          // Table doesn't exist yet, return mock data
          settings = {
            user_id: user.id,
            email_notifications: true,
            sms_notifications: true,
            push_notifications: false,
            theme: 'light'
          };
        } else {
          throw createError;
        }
      } else {
        settings = newSettings;
      }
    } else if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        settings = {
          user_id: user.id,
          email_notifications: true,
          sms_notifications: true,
          push_notifications: false,
          theme: 'light'
        };
      } else {
        throw error;
      }
    }

    return res.json({ data: settings });
  } catch (error) {
    console.error('Error in settings API:', error)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.patch('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const body = req.body
    const { email_notifications, sms_notifications, push_notifications, theme } = body

    const { data: settings, error } = await supabaseAdmin
      .from('student_settings')
      .update({
        email_notifications,
        sms_notifications,
        push_notifications,
        theme,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        return res.json({ 
          data: {
            user_id: user.id,
            email_notifications,
            sms_notifications,
            push_notifications,
            theme
          } 
        });
      }
      throw error;
    }

    return res.json({ data: settings });
  } catch (error) {
    console.error('Error updating settings:', error)
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
