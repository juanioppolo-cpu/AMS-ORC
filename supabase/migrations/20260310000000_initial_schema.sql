-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Maps to the app's user concepts, separate from Supabase Auth for custom fields if needed, or we can use Supabase Auth directly. For simplicity, we'll create a public 'profiles' table that links to auth.users later)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Coach', 'Athlete')),
    active BOOLEAN DEFAULT TRUE,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Divisions Table
CREATE TABLE divisions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- 3. Division Memberships (Many-to-Many between profiles and divisions)
CREATE TABLE profile_divisions (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    division_id TEXT REFERENCES divisions(id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, division_id)
);

-- 4. Routines Table
CREATE TABLE routines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    scheduled_date DATE,
    assigned_to_type TEXT CHECK (assigned_to_type IN ('division', 'athlete')),
    assigned_to_id TEXT NOT NULL, -- Could be a division_id or profile_id
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Wellness Submissions Table
CREATE TABLE wellness_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sleep_hours INTEGER,
    sleep_quality INTEGER,
    soreness INTEGER,
    stress INTEGER,
    wellness_score INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies - Open for now during migration, can be restricted later
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON divisions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON profile_divisions FOR SELECT USING (true);

CREATE POLICY "Enable all access for all users" ON routines FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON wellness_submissions FOR ALL USING (true);

-- Insert initial divisions
INSERT INTO divisions (id, name) VALUES 
('M17', 'M17'), 
('M19', 'M19'), 
('div_sub18', 'Sub-18'), 
('div_first', 'Primera'), 
('div_reserva', 'Reserva') ON CONFLICT DO NOTHING;
