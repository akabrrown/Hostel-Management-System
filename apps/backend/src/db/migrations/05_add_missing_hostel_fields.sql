-- Add missing fields to hostels
ALTER TABLE hostels
ADD COLUMN IF NOT EXISTS total_floors INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS warden_name TEXT,
ADD COLUMN IF NOT EXISTS warden_email TEXT,
ADD COLUMN IF NOT EXISTS warden_phone TEXT,
ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS room_pricing JSONB DEFAULT '{"single": 0, "double": 0, "quadruple": 0}';

-- Add missing fields to rooms
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gender_allowed TEXT CHECK (gender_allowed IN ('Male', 'Female', 'Any'));
