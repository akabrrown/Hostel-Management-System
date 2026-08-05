-- Add complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Maintenance', 'Noise', 'Security', 'Cleanliness', 'Other')),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved', 'Rejected')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can do everything on complaints" 
ON public.complaints 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Students can read their own complaints
CREATE POLICY "Students can view their own complaints" 
ON public.complaints 
FOR SELECT USING (
    auth.uid() = student_id
);

-- Students can insert their own complaints
CREATE POLICY "Students can insert their own complaints" 
ON public.complaints 
FOR INSERT WITH CHECK (
    auth.uid() = student_id
);

-- Porters can view complaints in their assigned hostel
CREATE POLICY "Porters can view complaints in their hostel" 
ON public.complaints 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.porters p 
        WHERE p.user_id = auth.uid() AND p.assigned_hostel_id = complaints.hostel_id
    )
);

-- Porters can update status of complaints in their hostel
CREATE POLICY "Porters can update complaints in their hostel" 
ON public.complaints 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.porters p 
        WHERE p.user_id = auth.uid() AND p.assigned_hostel_id = complaints.hostel_id
    )
);

-- Updated at trigger
CREATE TRIGGER update_complaints_updated_at
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
