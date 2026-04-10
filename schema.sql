-- 1. Profiles (linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Intern',
  status TEXT DEFAULT 'Pending',
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (description, reference_number)
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

-- 7. Donors/Partners/Volunteers
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  organization TEXT,
  status TEXT DEFAULT 'Active',
  category TEXT DEFAULT 'Donor', -- Donor, Volunteer
  city TEXT,
  state TEXT,
  country TEXT,
  last_active TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorize existing data based on organization Presence
UPDATE public.donors SET category = 'Volunteer' WHERE organization IS NULL OR organization = 'Individual';
UPDATE public.donors SET category = 'Donor' WHERE organization IS NOT NULL AND organization != 'Individual';

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


-- Extend inventory and shipments with missing fields found in UI
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS shelf_life TEXT;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS lot_number TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS market_value DECIMAL(10,2);
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS valuation_source TEXT;
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS acquisition_method TEXT;

-- Add documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  reason TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated all" ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Item Request Details (which items in a request)
CREATE TABLE IF NOT EXISTS public.request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT REFERENCES public.requests(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Organization Settings
CREATE TABLE IF NOT EXISTS public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT 'Mending Kids',
  support_email TEXT DEFAULT 'support@mendingkids.org',
  base_url TEXT DEFAULT 'https://inventory.mendingkids.org',
  timezone TEXT DEFAULT 'pt',
  language TEXT DEFAULT 'en-US',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Categories/Tags
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT, -- Facility, Sub-location
  parent_id UUID REFERENCES public.locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Groups & Permissions (Extended)
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT DEFAULT 'Custom group',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_groups (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, group_id)
);

-- Enable RLS & Policies
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated all" ON public.request_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.organization_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated all" ON public.user_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 13. Mission People (team members assigned to a mission)
CREATE TABLE IF NOT EXISTS public.mission_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT DEFAULT '',
  email TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mission_people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated all" ON public.mission_people FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Initial Data
INSERT INTO public.organization_settings (name) VALUES ('Mending Kids') ON CONFLICT DO NOTHING;

INSERT INTO public.categories (name, color) VALUES 
('Cardiac', '#1561cc'),
('Infections', '#d63c8a'),
('ENT', '#1a7f37'),
('General', '#cf4f27')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.locations (name, type) VALUES 
('Main Warehouse Los Angeles', 'Facility'),
('Cabinet 3B', 'Sub-location'),
('Storage A', 'Sub-location')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.groups (name, type) VALUES 
('site-admins', 'System defined'),
('inventory-managers', 'Custom group'),
('external-partners', 'Custom group'),
('interns', 'Limited access')
ON CONFLICT (name) DO NOTHING;
