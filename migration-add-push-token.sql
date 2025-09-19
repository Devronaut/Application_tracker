-- Migration: Add expo_push_token to profiles table
-- Run this in your Supabase SQL editor

-- Add expo_push_token column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.expo_push_token IS 'Expo push token for sending push notifications to the user';

-- Update the updated_at trigger to include the new column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
