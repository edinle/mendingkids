-- 1. Profiles (linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Intern',
  initials TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Missions
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  specialty TEXT,
  dates TEXT,
  status TEXT DEFAULT 'PENDING',
  coordinator_id UUID REFERENCES public.profiles(id),
  budget DECIMAL(12,2),
  doctor_name TEXT,
  doctor_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Inventory Common Data (Base Items)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  company TEXT,
  reference_number TEXT,
  unit_of_measure TEXT DEFAULT 'units',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Inventory Entries (Shipments/Quantity batches)
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  expiration_date DATE,
  status TEXT DEFAULT 'available',
  mission_id UUID REFERENCES public.missions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Item Requests
CREATE TABLE IF NOT EXISTS public.requests (
  id TEXT PRIMARY KEY, -- Using REQ-101 format as seen in UI
  requester_id UUID REFERENCES public.profiles(id),
  mission_id UUID REFERENCES public.missions(id),
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  date_created TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Activity Log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id),
  action_text TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Donors/Partners
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  organization TEXT,
  status TEXT DEFAULT 'Active',
  last_active TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policy: Allow all authenticated users to read and write (for prototype phase)
-- Simple RLS Policy: Allow all authenticated users to read and write (for prototype phase)
CREATE POLICY "Allow authenticated all" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.missions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.inventory FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.shipments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.donors FOR ALL TO authenticated USING (true) WITH CHECK (true);

