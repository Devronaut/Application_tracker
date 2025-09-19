-- Disable email confirmation for development/testing
-- This should be run in your Supabase SQL editor

-- Update auth settings to disable email confirmation
UPDATE auth.config 
SET 
  enable_signup = true,
  enable_email_confirmations = false,
  enable_phone_confirmations = false
WHERE id = 1;

-- Alternative approach: Update the auth.users table to auto-confirm new users
-- This creates a trigger to automatically confirm users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Auto-confirm the user
  UPDATE auth.users 
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
