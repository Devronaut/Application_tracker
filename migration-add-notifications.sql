-- Migration: Add notification system tables
-- Run this in your Supabase SQL editor

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
