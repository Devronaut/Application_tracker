export interface Notification {
  id: string;
  user_id: string;
  application_id?: string;
  type: 'follow_up' | 'interview' | 'deadline' | 'general';
  title: string;
  message: string;
  scheduled_for: string;
  is_read: boolean;
  is_sent: boolean;
  created_at: string;
  updated_at: string;
  application?: {
    company: string;
    role: string;
  };
}

export interface InterviewSchedule {
  id: string;
  user_id: string;
  application_id: string;
  interview_type: 'phone' | 'video' | 'in_person' | 'technical' | 'hr' | 'final';
  scheduled_date: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  created_at: string;
  updated_at: string;
  application?: {
    company: string;
    role: string;
  };
}

export interface FollowUpReminder {
  id: string;
  user_id: string;
  application_id: string;
  reminder_type: 'initial' | 'follow_up' | 'thank_you' | 'status_check';
  scheduled_for: string;
  is_completed: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  application?: {
    company: string;
    role: string;
  };
}

export interface CreateNotificationData {
  application_id?: string;
  type: 'follow_up' | 'interview' | 'deadline' | 'general';
  title: string;
  message: string;
  scheduled_for: string;
}

export interface CreateInterviewScheduleData {
  application_id: string;
  interview_type: 'phone' | 'video' | 'in_person' | 'technical' | 'hr' | 'final';
  scheduled_date: string;
  duration_minutes?: number;
  location?: string;
  meeting_link?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  notes?: string;
}

export interface CreateFollowUpReminderData {
  application_id: string;
  reminder_type: 'initial' | 'follow_up' | 'thank_you' | 'status_check';
  scheduled_for: string;
  notes?: string;
}
