-- Migration: Add enhanced fields to job_applications table
-- Run this in your Supabase SQL editor

-- Add new columns to existing job_applications table
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS salary TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS application_date DATE,
ADD COLUMN IF NOT EXISTS job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')) DEFAULT 'full-time',
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium';

-- Update existing records to have default values
UPDATE job_applications 
SET 
  job_type = 'full-time',
  priority = 'medium',
  application_date = created_at::date
WHERE job_type IS NULL OR priority IS NULL OR application_date IS NULL;
