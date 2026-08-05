-- Seed Data for Hostels
INSERT INTO hostels (id, name, description, location, capacity, gender_allowed, status, images) VALUES
  (
    '22222222-2222-2222-2222-222222222221', 
    'Pentagon Hostel', 
    'Experience premium living with modern amenities, 24/7 security, and a vibrant student community just steps away from campus.',
    'Main Campus North', 
    200, 
    'Any', 
    'active',
    ARRAY['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop']
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    'Hostel B', 
    'A quiet, serene environment perfect for focused studies, featuring spacious rooms and high-speed internet.',
    'South Campus', 
    200, 
    'Female', 
    'active',
    ARRAY['https://images.unsplash.com/photo-1595526114101-237947c6691c?q=80&w=2070&auto=format&fit=crop']
  )
ON CONFLICT (id) DO UPDATE SET 
  description = EXCLUDED.description,
  images = EXCLUDED.images;
