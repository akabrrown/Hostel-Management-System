-- Add floor_gender_config to hostels
ALTER TABLE hostels
ADD COLUMN IF NOT EXISTS floor_gender_config JSONB DEFAULT '{}';
