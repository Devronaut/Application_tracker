-- Temporary fix: Disable RLS for testing
-- Run this in your Supabase SQL editor

-- Disable RLS on job_applications table temporarily
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- This will allow the app to work immediately
-- You can re-enable RLS later with: ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
