export interface JobApplication {
  id: string;
  user_id: string;
  company: string;
  role: string;
  portal_url?: string;
  status: 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected';
  deadline?: string;
  notes?: string;
  // Enhanced fields
  salary?: string;
  location?: string;
  application_date?: string;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  source?: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  attached_resumes?: any[];
}

export interface CreateJobApplicationData {
  company: string;
  role: string;
  portal_url?: string | null;
  status: 'applied' | 'assessment' | 'interview' | 'offer' | 'rejected';
  deadline?: string | null;
  notes?: string | null;
  salary?: string | null;
  location?: string | null;
  application_date?: string | null;
  job_type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  source?: string | null;
  priority: 'high' | 'medium' | 'low';
}

export interface UpdateJobApplicationData extends Partial<CreateJobApplicationData> {
  id: string;
}
