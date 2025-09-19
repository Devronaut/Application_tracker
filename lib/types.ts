export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  role: string;
  portal_url?: string;
  status: 'applied' | 'interview' | 'offer' | 'rejected';
  deadline?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  file_url: string;
  is_default: boolean;
  created_at: string;
}

export interface ApplicationResume {
  application_id: string;
  resume_id: string;
}

export interface DashboardStats {
  total_applications: number;
  interviews_scheduled: number;
  offers_received: number;
  rejection_rate: number;
  recent_applications: JobApplication[];
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
