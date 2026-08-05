-- Migration to add new columns to hostels
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE hostels ADD COLUMN IF NOT EXISTS images TEXT[];

-- Update existing hostels with placeholder data
UPDATE hostels SET 
  description = 'Experience premium living with modern amenities, 24/7 security, and a vibrant student community just steps away from campus.',
  images = ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop']
WHERE id = '22222222-2222-2222-2222-222222222221';

UPDATE hostels SET 
  description = 'A quiet, serene environment perfect for focused studies, featuring spacious rooms and high-speed internet.',
  images = ARRAY['https://images.unsplash.com/photo-1595526114101-237947c6691c?q=80&w=2070&auto=format&fit=crop']
WHERE id = '22222222-2222-2222-2222-222222222222';
