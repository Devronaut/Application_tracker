-- Add missing columns to resumes table if they don't exist
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_name VARCHAR;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS file_type VARCHAR;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS version VARCHAR DEFAULT '1.0';
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Make file_url nullable since we're using file_path now
ALTER TABLE resumes ALTER COLUMN file_url DROP NOT NULL;

-- Add updated_at trigger for resumes
CREATE TRIGGER handle_updated_at_resumes
  BEFORE UPDATE ON resumes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
