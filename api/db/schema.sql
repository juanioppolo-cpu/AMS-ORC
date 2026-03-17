-- AMS Schema for Neon PostgreSQL
-- Run this in the Neon SQL Editor or via psql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (all users: Admin, Coach, Athlete)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Coach', 'Athlete')),
    active BOOLEAN DEFAULT TRUE,
    password_hash TEXT NOT NULL,
    photo_url TEXT,
    athlete_id TEXT,
    divisions JSONB DEFAULT '[]'::jsonb,
    permissions JSONB DEFAULT '{}'::jsonb,
    external_ids JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Divisions reference table
CREATE TABLE IF NOT EXISTS divisions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Routines table
CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    scheduled_date DATE,
    assigned_to_type TEXT CHECK (assigned_to_type IN ('division', 'athlete')),
    assigned_to_id TEXT NOT NULL,
    blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wellness submissions table
CREATE TABLE IF NOT EXISTS wellness_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    athlete_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sleep_hours INTEGER,
    sleep_quality INTEGER,
    soreness INTEGER,
    stress INTEGER,
    wellness_score INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial divisions
INSERT INTO divisions (id, name) VALUES
    ('M17', 'M17'),
    ('M19', 'M19'),
    ('div_sub18', 'Sub-18'),
    ('div_first', 'Primera'),
    ('div_reserva', 'Reserva')
ON CONFLICT DO NOTHING;
