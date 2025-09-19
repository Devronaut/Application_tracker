-- Remove expo_push_token column from profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE profiles
DROP COLUMN IF EXISTS expo_push_token;
