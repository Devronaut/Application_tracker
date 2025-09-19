import { supabase } from '../lib/supabase';
import { 
  Notification, 
  InterviewSchedule, 
  FollowUpReminder,
  CreateNotificationData,
  CreateInterviewScheduleData,
  CreateFollowUpReminderData
} from '../types/Notification';

export class NotificationService {
  // Notifications
  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getUnreadNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createNotification(userId: string, data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        ...data,
        user_id: userId,
      })
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .single();

    if (error) throw error;
    return notification;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Interview Schedules
  static async getInterviewSchedules(userId: string): Promise<InterviewSchedule[]> {
    const { data, error } = await supabase
      .from('interview_schedules')
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getUpcomingInterviews(userId: string): Promise<InterviewSchedule[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('interview_schedules')
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('scheduled_date', now)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createInterviewSchedule(userId: string, data: CreateInterviewScheduleData): Promise<InterviewSchedule> {
    const { data: interview, error } = await supabase
      .from('interview_schedules')
      .insert({
        ...data,
        user_id: userId,
      })
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .single();

    if (error) throw error;
    return interview;
  }

  static async updateInterviewSchedule(interviewId: string, updates: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    const { data, error } = await supabase
      .from('interview_schedules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', interviewId)
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteInterviewSchedule(interviewId: string): Promise<void> {
    const { error } = await supabase
      .from('interview_schedules')
      .delete()
      .eq('id', interviewId);

    if (error) throw error;
  }

  // Follow-up Reminders
  static async getFollowUpReminders(userId: string): Promise<FollowUpReminder[]> {
    const { data, error } = await supabase
      .from('follow_up_reminders')
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .eq('user_id', userId)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getPendingReminders(userId: string): Promise<FollowUpReminder[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('follow_up_reminders')
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createFollowUpReminder(userId: string, data: CreateFollowUpReminderData): Promise<FollowUpReminder> {
    const { data: reminder, error } = await supabase
      .from('follow_up_reminders')
      .insert({
        ...data,
        user_id: userId,
      })
      .select(`
        *,
        application:job_applications(company, role)
      `)
      .single();

    if (error) throw error;
    return reminder;
  }

  static async markReminderCompleted(reminderId: string): Promise<void> {
    const { error } = await supabase
      .from('follow_up_reminders')
      .update({ is_completed: true, updated_at: new Date().toISOString() })
      .eq('id', reminderId);

    if (error) throw error;
  }

  static async deleteFollowUpReminder(reminderId: string): Promise<void> {
    const { error } = await supabase
      .from('follow_up_reminders')
      .delete()
      .eq('id', reminderId);

    if (error) throw error;
  }

  // Auto-reminder creation for new applications
  static async createAutoReminders(userId: string, applicationId: string, applicationDate: string): Promise<void> {
    const appDate = new Date(applicationDate);
    
    // Follow-up reminder after 1 week
    const followUpDate = new Date(appDate);
    followUpDate.setDate(followUpDate.getDate() + 7);
    
    // Status check reminder after 2 weeks
    const statusCheckDate = new Date(appDate);
    statusCheckDate.setDate(statusCheckDate.getDate() + 14);

    // Create follow-up reminder
    await this.createFollowUpReminder(userId, {
      application_id: applicationId,
      reminder_type: 'follow_up',
      scheduled_for: followUpDate.toISOString(),
      notes: 'Follow up on application status'
    });

    // Create status check reminder
    await this.createFollowUpReminder(userId, {
      application_id: applicationId,
      reminder_type: 'status_check',
      scheduled_for: statusCheckDate.toISOString(),
      notes: 'Check application status and consider next steps'
    });

    // Create notification for follow-up
    await this.createNotification(userId, {
      application_id: applicationId,
      type: 'follow_up',
      title: 'Follow-up Reminder',
      message: 'Time to follow up on your application',
      scheduled_for: followUpDate.toISOString()
    });
  }
}
