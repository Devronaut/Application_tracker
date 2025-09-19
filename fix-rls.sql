-- Quick fix: Allow anonymous inserts for testing
-- Run this in your Supabase SQL editor

-- Temporarily disable RLS for job_applications table
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- Or create a policy that allows anonymous inserts
-- CREATE POLICY "Allow anonymous inserts" ON job_applications FOR INSERT WITH CHECK (true);

-- This will allow the app to work without authentication for now
