-- Add hostel_id to rooms for direct relationship
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE;

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger function (in case it is missing)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for system_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_system_settings_modtime') THEN
        EXECUTE 'CREATE TRIGGER update_system_settings_modtime 
        BEFORE UPDATE ON system_settings 
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column()';
    END IF;
END
$$;
