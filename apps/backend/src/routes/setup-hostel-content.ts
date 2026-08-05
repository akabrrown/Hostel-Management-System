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


// SQL to create the hostel_page_content table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS public.hostel_page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_background_image TEXT NOT NULL,
  hero_button_text TEXT NOT NULL,
  features_title TEXT NOT NULL,
  features_subtitle TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_title TEXT NOT NULL,
  cta_subtitle TEXT NOT NULL,
  cta_button_text TEXT NOT NULL,
  cta_secondary_button_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.hostel_page_content ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for admin use)
DROP POLICY IF EXISTS "hostel_page_content_policy" ON public.hostel_page_content;
CREATE POLICY "hostel_page_content_policy" ON public.hostel_page_content
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.hostel_page_content TO authenticated;
GRANT ALL ON public.hostel_page_content TO service_role;
GRANT SELECT ON public.hostel_page_content TO anon;
`

// POST /api/setup-hostel-content - Initialize hostel page content in settings
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data: existing, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'hostel_page_content')
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking table:', error)
      return res.status(500).json({ error: 'Failed to check system_settings table', details: error });
    }

    if (existing) {
      return res.json({ message: 'Content already initialized', data: existing.value });
    }

    // Insert default content
    const defaultContent = {
      hero_title: 'Discover Our Hostels',
      hero_subtitle: 'Experience world-class hostel facilities designed to provide comfort, security, and an environment conducive to academic excellence.',
      hero_background_image: 'https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg',
      hero_button_text: 'Explore Hostels',
      features_title: 'Why Choose UPSA Hostels?',
      features_subtitle: 'We provide quality accommodation with modern amenities to ensure your comfort and academic success.',
      features: [
        {
          id: '1',
          title: '24/7 Security',
          description: 'Round-the-clock security to ensure your safety and peace of mind.',
          icon: 'Shield',
          order: 1
        },
        {
          id: '2',
          title: 'Free WiFi',
          description: 'High-speed internet access throughout all hostel buildings.',
          icon: 'Wifi',
          order: 2
        },
        {
          id: '3',
          title: 'Parking Space',
          description: 'Secure parking facilities available for residents with vehicles.',
          icon: 'Car',
          order: 3
        },
        {
          id: '4',
          title: 'Community',
          description: 'Vibrant community with various social and academic activities.',
          icon: 'Users',
          order: 4
        }
      ],
      cta_title: 'Ready to Join Our Community?',
      cta_subtitle: 'Take the first step towards comfortable and secure hostel living. Apply now and secure your place in our vibrant student community.',
      cta_button_text: 'Apply for Hostel',
      cta_secondary_button_text: 'Contact Us',
      id: '1'
    }

    const { error: insertError } = await supabase
      .from('system_settings')
      .insert([{
        key: 'hostel_page_content',
        value: defaultContent,
        description: 'Hostel Landing Page Content'
      }])

    if (insertError) {
      console.error('Error inserting default content:', insertError)
      return res.status(500).json({ error: 'Failed to insert default content', details: insertError });
    }

    return res.json({ 
      message: 'Hostel page content initialized successfully',
      data: defaultContent
    });

  } catch (error) {
    console.error('Unexpected error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
