-- Fix RLS policies to allow authenticated users to insert data
-- Run this in your Supabase SQL editor

-- First, let's check if the policies exist and drop them if needed
DROP POLICY IF EXISTS "Users can insert own applications" ON job_applications;

-- Create a new policy that allows authenticated users to insert
CREATE POLICY "Allow authenticated users to insert applications" 
ON job_applications FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Also ensure the select policy works
DROP POLICY IF EXISTS "Users can view own applications" ON job_applications;

CREATE POLICY "Allow authenticated users to view applications" 
ON job_applications FOR SELECT 
TO authenticated 
USING (true);

-- Update policy for updates
DROP POLICY IF EXISTS "Users can update own applications" ON job_applications;

CREATE POLICY "Allow authenticated users to update applications" 
ON job_applications FOR UPDATE 
TO authenticated 
USING (true);

-- Update policy for deletes
DROP POLICY IF EXISTS "Users can delete own applications" ON job_applications;

CREATE POLICY "Allow authenticated users to delete applications" 
ON job_applications FOR DELETE 
TO authenticated 
USING (true);
