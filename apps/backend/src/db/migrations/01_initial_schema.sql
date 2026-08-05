-- ==========================================
-- UPSA Hostel Management System
-- Initial Database Schema (Supabase PostgreSQL)
-- Based on v2.1 Documentation
-- ==========================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 0. Cleanup (Drop existing tables/types)
-- ==========================================

-- Drop old redundant tables if they exist
DROP TABLE IF EXISTS accommodations CASCADE;
DROP TABLE IF EXISTS room_bookings CASCADE;
DROP TABLE IF EXISTS booking_periods CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop all active tables
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS check_outs CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS maintenance_updates CASCADE;
DROP TABLE IF EXISTS maintenance_requests CASCADE;
DROP TABLE IF EXISTS visitor_logs CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS room_key_transactions CASCADE;
DROP TABLE IF EXISTS room_keys CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS finance_invoices CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS room_types CASCADE;
DROP TABLE IF EXISTS floors CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS administrators CASCADE;
DROP TABLE IF EXISTS porters CASCADE;
DROP TABLE IF EXISTS hostels CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS academic_sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS notification_status CASCADE;
DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS maintenance_status CASCADE;
DROP TYPE IF EXISTS maintenance_priority CASCADE;
DROP TYPE IF EXISTS maintenance_category CASCADE;
DROP TYPE IF EXISTS visitor_action CASCADE;
DROP TYPE IF EXISTS visitor_status CASCADE;
DROP TYPE IF EXISTS key_transaction_type CASCADE;
DROP TYPE IF EXISTS key_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS booking_type CASCADE;
DROP TYPE IF EXISTS reservation_status CASCADE;
DROP TYPE IF EXISTS room_status CASCADE;
DROP TYPE IF EXISTS hostel_status CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ==========================================
-- 1. Custom Types (Enums)
-- ==========================================

CREATE TYPE user_role AS ENUM ('student', 'porter', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'inactive');
CREATE TYPE hostel_status AS ENUM ('active', 'inactive');
CREATE TYPE room_status AS ENUM ('available', 'reserved', 'pending_payment', 'occupied', 'maintenance', 'locked');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'paid', 'allocated', 'checked_in', 'checked_out', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'failed');
CREATE TYPE key_status AS ENUM ('with_porter', 'with_student', 'lost', 'damaged', 'replacement_required');
CREATE TYPE key_transaction_type AS ENUM ('return_to_porter', 'collect_from_porter', 'lost_report', 'damage_report', 'replacement');
CREATE TYPE visitor_status AS ENUM ('pending', 'approved', 'rejected', 'arrived', 'departed');
CREATE TYPE visitor_action AS ENUM ('approved', 'rejected', 'arrived', 'departed');
CREATE TYPE maintenance_category AS ENUM ('electrical', 'plumbing', 'furniture', 'cleaning', 'security', 'other');
CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE notification_channel AS ENUM ('sms', 'email', 'push', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');

-- ==========================================
-- 2. Core Entities
-- ==========================================

-- 2.1 Users (Root identity record)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    index_number TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    status user_status DEFAULT 'active',
    must_reset_password BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2.2 Academic Sessions & Booking Periods
CREATE TABLE IF NOT EXISTS academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_academic_sessions_modtime BEFORE UPDATE ON academic_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- (booking_periods removed in favor of single academic_session_id)

-- 2.3 Role-Specific Profiles
CREATE TABLE IF NOT EXISTS students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    programme TEXT NOT NULL,
    level TEXT NOT NULL,
    academic_session_id UUID REFERENCES academic_sessions(id) ON DELETE SET NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL,
    next_of_kin_name TEXT NOT NULL,
    next_of_kin_phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS hostels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    capacity INT NOT NULL,
    gender_allowed TEXT CHECK (gender_allowed IN ('Male', 'Female', 'Any')),
    status hostel_status DEFAULT 'active',
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_hostels_modtime BEFORE UPDATE ON hostels FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS porters (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    assigned_hostel_id UUID REFERENCES hostels(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_porters_modtime BEFORE UPDATE ON porters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS administrators (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_administrators_modtime BEFORE UPDATE ON administrators FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 2.4 Physical Infrastructure
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_blocks_modtime BEFORE UPDATE ON blocks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    floor_number INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_floors_modtime BEFORE UPDATE ON floors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_room_types_modtime BEFORE UPDATE ON room_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    room_number TEXT NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    status room_status DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_rooms_modtime BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 3. Operational Entities
-- ==========================================

-- 3.1 Bookings & Reservations
-- 3.1 Bookings (Unified lifecycle replacing reservations and accommodations)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE RESTRICT,
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE RESTRICT,
    room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    academic_session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE RESTRICT,
    status booking_status DEFAULT 'pending_payment',
    amount_paid NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_bookings_modtime BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3.2 Finance Integration
CREATE TABLE IF NOT EXISTS finance_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE RESTRICT,
    invoice_reference TEXT UNIQUE NOT NULL,
    amount NUMERIC NOT NULL,
    status invoice_status DEFAULT 'pending',
    issued_at TIMESTAMPTZ DEFAULT now(),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_finance_invoices_modtime BEFORE UPDATE ON finance_invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES finance_invoices(id) ON DELETE RESTRICT,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    amount NUMERIC NOT NULL,
    payment_reference TEXT UNIQUE NOT NULL,
    status payment_status DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    source TEXT DEFAULT 'school_finance_api',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 3.3 Check-in/Check-out
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    porter_id UUID NOT NULL REFERENCES porters(user_id) ON DELETE RESTRICT,
    checked_in_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS check_outs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    porter_id UUID NOT NULL REFERENCES porters(user_id) ON DELETE RESTRICT,
    checked_out_at TIMESTAMPTZ DEFAULT now(),
    condition_report TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.4 Room Keys
CREATE TABLE IF NOT EXISTS room_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    key_code TEXT UNIQUE NOT NULL,
    status key_status DEFAULT 'with_porter',
    current_holder_student_id UUID REFERENCES students(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_room_keys_modtime BEFORE UPDATE ON room_keys FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS room_key_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_key_id UUID NOT NULL REFERENCES room_keys(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE RESTRICT,
    porter_id UUID NOT NULL REFERENCES porters(user_id) ON DELETE RESTRICT,
    transaction_type key_transaction_type NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    transaction_time TIME DEFAULT CURRENT_TIME,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.5 Visitors
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    visitor_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relationship TEXT NOT NULL,
    visit_purpose TEXT NOT NULL,
    expected_arrival_time TIMESTAMPTZ NOT NULL,
    status visitor_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_visitors_modtime BEFORE UPDATE ON visitors FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    porter_id UUID NOT NULL REFERENCES porters(user_id) ON DELETE RESTRICT,
    action visitor_action NOT NULL,
    action_time TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.6 Maintenance
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
    category maintenance_category NOT NULL,
    description TEXT NOT NULL,
    images TEXT[],
    priority maintenance_priority DEFAULT 'medium',
    status maintenance_status DEFAULT 'open',
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_maintenance_requests_modtime BEFORE UPDATE ON maintenance_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ==========================================
-- 4. Communication & Audit
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel notification_channel NOT NULL,
    status notification_status DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_notifications_modtime BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE, -- Null = all hostels
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES administrators(user_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE OR REPLACE TRIGGER update_announcements_modtime BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

