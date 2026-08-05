-- Migration to add booking_category to rooms

ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS booking_category VARCHAR(255) DEFAULT 'Student';

-- Add default setting for room categories if not exists
INSERT INTO public.system_settings (key, value, description)
VALUES (
    'room_categories',
    '["Student", "Staff", "Guest", "Reserved"]',
    'List of available room categories for assignment'
)
ON CONFLICT (key) DO NOTHING;
