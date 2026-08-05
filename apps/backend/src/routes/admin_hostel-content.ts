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




// Initialize Supabase client


// Interface for hostel page content
interface HostelPageContent {
  id?: string
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  hero_button_text: string
  features_title: string
  features_subtitle: string
  features: {
    id: string
    title: string
    description: string
    icon: string
    order: number
  }[]
  cta_title: string
  cta_subtitle: string
  cta_button_text: string
  cta_secondary_button_text: string
  created_at?: string
  updated_at?: string
}
// GET /api/admin/hostel-content - Fetch hostel page content
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'hostel_page_content')
      .single()

    if (error && error.code !== 'PGRST116') { // Ignore row not found
      console.warn('[Admin Hostel Content] Error fetching hostel content from settings:', error);
      return res.json({ data: null });
    }

    if (data) {
      return res.json({ data: data.value });
    } else {
      return res.json({ data: null });
    }
  } catch (error) {
    console.warn('[Admin Hostel Content] Unexpected error, returning null:', error);
    return res.json({ data: null });
  }
});

// POST /api/admin/hostel-content - Create new hostel page content
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const content = req.body

    // Validate required fields
    if (!content.hero_title || !content.hero_subtitle || !content.features_title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Add dummy ID so frontend thinks it's a real row
    const contentToSave = { ...content, id: content.id || '1' };

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'hostel_page_content',
        value: contentToSave,
        description: 'Hostel Landing Page Content',
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      .select()
      .single()

    if (error) {
      console.error('Error saving hostel content:', error)
      return res.status(500).json({ error: 'Failed to save hostel content' });
    }

    return res.status(201).json({ data: data.value });
  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/hostel-content - Update hostel page content
router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const content = req.body
    
    // Add dummy ID so frontend thinks it's a real row
    const contentToSave = { ...content, id: content.id || '1' };

    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'hostel_page_content',
        value: contentToSave,
        description: 'Hostel Landing Page Content',
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })
      .select()
      .single()

    if (error) {
      console.error('Error updating hostel content:', error)
      return res.status(500).json({ error: 'Failed to update hostel content' });
    }

    return res.json({ data: data.value });
  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/hostel-content - Delete hostel page content
router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('key', 'hostel_page_content')

    if (error) {
      console.error('Error deleting hostel content:', error)
      return res.status(500).json({ error: 'Failed to delete hostel content' });
    }

    return res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
