-- Resume Tracker Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  portal_url TEXT,
  status TEXT CHECK (status IN ('applied', 'interview', 'offer', 'rejected')) DEFAULT 'applied',
  deadline DATE,
  notes TEXT,
  -- Enhanced fields
  salary TEXT,
  location TEXT,
  application_date DATE,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')) DEFAULT 'full-time',
  source TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create application_resumes junction table
CREATE TABLE IF NOT EXISTS application_resumes (
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  PRIMARY KEY (application_id, resume_id)
);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_resumes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Job applications policies
CREATE POLICY "Users can view own applications" ON job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own applications" ON job_applications FOR DELETE USING (auth.uid() = user_id);

-- Resumes policies
CREATE POLICY "Users can view own resumes" ON resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON resumes FOR DELETE USING (auth.uid() = user_id);

-- Application resumes policies
CREATE POLICY "Users can view own application resumes" ON application_resumes FOR SELECT 
  USING (auth.uid() IN (
    SELECT user_id FROM job_applications WHERE id = application_id
  ));
CREATE POLICY "Users can insert own application resumes" ON application_resumes FOR INSERT 
  WITH CHECK (auth.uid() IN (
    SELECT user_id FROM job_applications WHERE id = application_id
  ));
CREATE POLICY "Users can delete own application resumes" ON application_resumes FOR DELETE 
  USING (auth.uid() IN (
    SELECT user_id FROM job_applications WHERE id = application_id
  ));

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('follow_up', 'interview', 'deadline', 'general')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_schedules table
CREATE TABLE IF NOT EXISTS interview_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
  interview_type TEXT CHECK (interview_type IN ('phone', 'video', 'in_person', 'technical', 'hr', 'final')) NOT NULL,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  interviewer_name TEXT,
  interviewer_email TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create follow_up_reminders table
CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
  reminder_type TEXT CHECK (reminder_type IN ('initial', 'follow_up', 'thank_you', 'status_check')) NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for interview_schedules table
ALTER TABLE interview_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview schedules" ON interview_schedules FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview schedules" ON interview_schedules FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview schedules" ON interview_schedules FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interview schedules" ON interview_schedules FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for follow_up_reminders table
ALTER TABLE follow_up_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follow up reminders" ON follow_up_reminders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own follow up reminders" ON follow_up_reminders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own follow up reminders" ON follow_up_reminders FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own follow up reminders" ON follow_up_reminders FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_job_applications
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_is_default ON resumes(is_default);
