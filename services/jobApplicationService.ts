import { supabase } from '../lib/supabase';
import { JobApplication, DashboardStats } from '../lib/types';
import { Resume } from './resumeServiceSimple';

export class JobApplicationService {
  static async getApplications(userId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createApplication(application: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteApplication(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    const totalApplications = applications?.length || 0;
    const interviewsScheduled = applications?.filter(app => app.status === 'interview').length || 0;
    const offersReceived = applications?.filter(app => app.status === 'offer').length || 0;
    const rejectedCount = applications?.filter(app => app.status === 'rejected').length || 0;
    const rejectionRate = totalApplications > 0 ? (rejectedCount / totalApplications) * 100 : 0;

    const recentApplications = applications
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5) || [];

    return {
      total_applications: totalApplications,
      interviews_scheduled: interviewsScheduled,
      offers_received: offersReceived,
      rejection_rate: rejectionRate,
      recent_applications: recentApplications,
    };
  }

  // Resume attachment methods
  static async attachResumeToApplication(applicationId: string, resumeId: string): Promise<void> {
    const { error } = await supabase
      .from('application_resumes')
      .insert({
        application_id: applicationId,
        resume_id: resumeId,
      });

    if (error) throw error;
  }

  static async detachResumeFromApplication(applicationId: string, resumeId: string): Promise<void> {
    const { error } = await supabase
      .from('application_resumes')
      .delete()
      .eq('application_id', applicationId)
      .eq('resume_id', resumeId);

    if (error) throw error;
  }

  static async getApplicationResumes(applicationId: string): Promise<Resume[]> {
    const { data, error } = await supabase
      .from('application_resumes')
      .select(`
        resumes (
          id,
          user_id,
          name,
          file_name,
          file_path,
          file_size,
          file_type,
          version,
          is_default,
          description,
          created_at,
          updated_at
        )
      `)
      .eq('application_id', applicationId);

    if (error) throw error;
    return data?.map(item => item.resumes).filter(Boolean) || [];
  }

  static async getApplicationsWithResumes(userId: string): Promise<(JobApplication & { attached_resumes: Resume[] })[]> {
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        application_resumes (
          resumes (
            id,
            user_id,
            name,
            file_name,
            file_path,
            file_size,
            file_type,
            version,
            is_default,
            description,
            created_at,
            updated_at
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return applications?.map(app => ({
      ...app,
      attached_resumes: app.application_resumes?.map(ar => ar.resumes).filter(Boolean) || []
    })) || [];
  }
}
