import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NotificationService } from '../services/notificationService';
import { JobApplicationService } from '../services/jobApplicationService';
import { Notification, InterviewSchedule, FollowUpReminder, CreateInterviewScheduleData, CreateNotificationData } from '../types/Notification';
import { JobApplication } from '../lib/types';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export default function NotificationCenter({ visible, onClose, userId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'interviews' | 'assessments' | 'deadlines'>('interviews');
  
  // Modal states
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  
  // Form states
  const [interviewForm, setInterviewForm] = useState<Partial<CreateInterviewScheduleData>>({});
  const [assessmentForm, setAssessmentForm] = useState<Partial<CreateNotificationData>>({});
  const [deadlineForm, setDeadlineForm] = useState<Partial<CreateNotificationData>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Date/Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [pickerType, setPickerType] = useState<'interview' | 'assessment' | 'deadline'>('interview');

  useEffect(() => {
    if (visible && userId) {
      loadData();
    }
  }, [visible, userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notificationsData, interviewsData, applicationsData] = await Promise.all([
        NotificationService.getNotifications(userId),
        NotificationService.getInterviewSchedules(userId),
        JobApplicationService.getApplications(userId)
      ]);
      
      setNotifications(notificationsData);
      setInterviews(interviewsData);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading notification data:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  // Interview functions
  const handleCreateInterview = async () => {
    if (!interviewForm.application_id || !interviewForm.interview_type || !interviewForm.scheduled_date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await NotificationService.createInterviewSchedule(userId, interviewForm as CreateInterviewScheduleData);
      Alert.alert('Success', 'Interview scheduled successfully!');
      setShowInterviewModal(false);
      setInterviewForm({});
      await loadData();
    } catch (error) {
      console.error('Error creating interview:', error);
      Alert.alert('Error', 'Failed to create interview');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateInterview = async (interviewId: string, status: string) => {
    try {
      await NotificationService.updateInterviewSchedule(interviewId, { status: status as any });
      Alert.alert('Success', 'Interview updated successfully!');
      await loadData();
    } catch (error) {
      console.error('Error updating interview:', error);
      Alert.alert('Error', 'Failed to update interview');
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    Alert.alert(
      'Delete Interview',
      'Are you sure you want to delete this interview?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.deleteInterviewSchedule(interviewId);
              Alert.alert('Success', 'Interview deleted successfully!');
              await loadData();
            } catch (error) {
              console.error('Error deleting interview:', error);
              Alert.alert('Error', 'Failed to delete interview');
            }
          },
        },
      ]
    );
  };

  // Assessment functions
  const handleCreateAssessment = async () => {
    if (!assessmentForm.application_id || !assessmentForm.title || !assessmentForm.scheduled_for) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const notification = await NotificationService.createNotification(userId, {
        ...assessmentForm,
        type: 'general'
      } as CreateNotificationData);
      
      
      Alert.alert('Success', 'Assessment reminder created successfully!');
      setShowAssessmentModal(false);
      setAssessmentForm({});
      await loadData();
    } catch (error) {
      console.error('Error creating assessment:', error);
      Alert.alert('Error', 'Failed to create assessment reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAssessment = async (notificationId: string) => {
    Alert.alert(
      'Delete Assessment',
      'Are you sure you want to delete this assessment reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.deleteNotification(notificationId);
              Alert.alert('Success', 'Assessment reminder deleted successfully!');
              await loadData();
            } catch (error) {
              console.error('Error deleting assessment:', error);
              Alert.alert('Error', 'Failed to delete assessment reminder');
            }
          },
        },
      ]
    );
  };

  // Deadline functions
  const handleCreateDeadline = async () => {
    if (!deadlineForm.application_id || !deadlineForm.title || !deadlineForm.scheduled_for) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const notification = await NotificationService.createNotification(userId, {
        ...deadlineForm,
        type: 'deadline'
      } as CreateNotificationData);
      
      
      Alert.alert('Success', 'Deadline reminder created successfully!');
      setShowDeadlineModal(false);
      setDeadlineForm({});
      await loadData();
    } catch (error) {
      console.error('Error creating deadline:', error);
      Alert.alert('Error', 'Failed to create deadline reminder');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDeadline = async (notificationId: string) => {
    Alert.alert(
      'Delete Deadline',
      'Are you sure you want to delete this deadline reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await NotificationService.deleteNotification(notificationId);
              Alert.alert('Success', 'Deadline reminder deleted successfully!');
              await loadData();
            } catch (error) {
              console.error('Error deleting deadline:', error);
              Alert.alert('Error', 'Failed to delete deadline reminder');
            }
          },
        },
      ]
    );
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString();
  };

  const formatTimeForDisplay = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTimeForAPI = (date: Date, time: Date) => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    return combined.toISOString();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const time = pickerType === 'interview' ? selectedTime : selectedTime;
      const dateTimeString = formatDateTimeForAPI(selectedDate, time);
      
      if (pickerType === 'interview') {
        setInterviewForm({...interviewForm, scheduled_date: dateTimeString});
      } else if (pickerType === 'assessment') {
        setAssessmentForm({...assessmentForm, scheduled_for: dateTimeString});
      } else if (pickerType === 'deadline') {
        setDeadlineForm({...deadlineForm, scheduled_for: dateTimeString});
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedTime(selectedTime);
      const date = pickerType === 'interview' ? selectedDate : selectedDate;
      const dateTimeString = formatDateTimeForAPI(date, selectedTime);
      
      if (pickerType === 'interview') {
        setInterviewForm({...interviewForm, scheduled_date: dateTimeString});
      } else if (pickerType === 'assessment') {
        setAssessmentForm({...assessmentForm, scheduled_for: dateTimeString});
      } else if (pickerType === 'deadline') {
        setDeadlineForm({...deadlineForm, scheduled_for: dateTimeString});
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow_up': return 'follow-the-signs';
      case 'interview': return 'event';
      case 'deadline': return 'schedule';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'follow_up': return '#FF9800';
      case 'interview': return '#2196F3';
      case 'deadline': return '#F44336';
      default: return '#666';
    }
  };

  const renderNotifications = () => (
    <ScrollView style={styles.content}>
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="notifications-none" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          </View>
          {notifications.map((notification) => (
            <View key={notification.id} style={[
              styles.notificationItem,
              !notification.is_read && styles.unreadNotification
            ]}>
              <View style={styles.notificationHeader}>
                <MaterialIcons 
                  name={getNotificationIcon(notification.type)} 
                  size={20} 
                  color={getNotificationColor(notification.type)} 
                />
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                {!notification.is_read && (
                  <View style={styles.unreadDot} />
                )}
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              {notification.application && (
                <Text style={styles.applicationInfo}>
                  {notification.application.company} - {notification.application.role}
                </Text>
              )}
              <Text style={styles.notificationDate}>
                {formatDate(notification.scheduled_for)}
              </Text>
              {!notification.is_read && (
                <TouchableOpacity 
                  style={styles.markReadButton}
                  onPress={() => handleMarkAsRead(notification.id)}
                >
                  <Text style={styles.markReadText}>Mark as Read</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderInterviews = () => (
    <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interviews ({interviews.length})</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowInterviewModal(true)}
          >
            <MaterialIcons name="add" size={20} color="#2196F3" />
            <Text style={styles.addButtonText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      
      {interviews.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No interviews scheduled</Text>
          <Text style={styles.emptySubtext}>Schedule your first interview to get started</Text>
        </View>
      ) : (
        interviews.map((interview) => (
          <View key={interview.id} style={styles.interviewItem}>
            <View style={styles.interviewHeader}>
              <MaterialIcons name="event" size={20} color="#2196F3" />
              <Text style={styles.interviewType}>
                {interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1).replace('_', ' ')}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: interview.status === 'scheduled' ? '#4CAF50' : '#FF9800' }
              ]}>
                <Text style={styles.statusText}>
                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                </Text>
              </View>
            </View>
            {interview.application && (
              <Text style={styles.applicationInfo}>
                {interview.application.company} - {interview.application.role}
              </Text>
            )}
            <Text style={styles.interviewDate}>
              {formatDate(interview.scheduled_date)}
            </Text>
            {interview.location && (
              <Text style={styles.interviewLocation}>📍 {interview.location}</Text>
            )}
            {interview.interviewer_name && (
              <Text style={styles.interviewerInfo}>👤 {interview.interviewer_name}</Text>
            )}
            
            <View style={styles.itemActions}>
              {interview.status === 'scheduled' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleUpdateInterview(interview.id, 'completed')}
                >
                  <MaterialIcons name="check" size={16} color="#4CAF50" />
                  <Text style={styles.actionText}>Complete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteInterview(interview.id)}
              >
                <MaterialIcons name="delete" size={16} color="#F44336" />
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderAssessments = () => {
    const assessmentNotifications = notifications.filter(n => n.type === 'general');
    
    return (
      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assessments ({assessmentNotifications.length})</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAssessmentModal(true)}
          >
            <MaterialIcons name="add" size={20} color="#2196F3" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {assessmentNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="quiz" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No assessments scheduled</Text>
            <Text style={styles.emptySubtext}>Add assessment reminders to track your progress</Text>
          </View>
        ) : (
          assessmentNotifications.map((notification) => (
            <View key={notification.id} style={styles.notificationItem}>
              <View style={styles.notificationHeader}>
                <MaterialIcons name="quiz" size={20} color="#FF9800" />
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                {!notification.is_read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              {notification.application && (
                <Text style={styles.applicationInfo}>
                  {notification.application.company} - {notification.application.role}
                </Text>
              )}
              <Text style={styles.notificationDate}>
                {formatDate(notification.scheduled_for)}
              </Text>
              
              <View style={styles.itemActions}>
                {!notification.is_read && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleMarkAsRead(notification.id)}
                  >
                    <MaterialIcons name="check" size={16} color="#4CAF50" />
                    <Text style={styles.actionText}>Mark Read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteAssessment(notification.id)}
                >
                  <MaterialIcons name="delete" size={16} color="#F44336" />
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderDeadlines = () => {
    const deadlineNotifications = notifications.filter(n => n.type === 'deadline');
    
    return (
      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Deadlines ({deadlineNotifications.length})</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowDeadlineModal(true)}
          >
            <MaterialIcons name="add" size={20} color="#2196F3" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {deadlineNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="schedule" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No deadlines set</Text>
            <Text style={styles.emptySubtext}>Add application deadlines to stay on track</Text>
          </View>
        ) : (
          deadlineNotifications.map((notification) => (
            <View key={notification.id} style={styles.notificationItem}>
              <View style={styles.notificationHeader}>
                <MaterialIcons name="schedule" size={20} color="#F44336" />
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                {!notification.is_read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              {notification.application && (
                <Text style={styles.applicationInfo}>
                  {notification.application.company} - {notification.application.role}
                </Text>
              )}
              <Text style={styles.notificationDate}>
                {formatDate(notification.scheduled_for)}
              </Text>
              
              <View style={styles.itemActions}>
                {!notification.is_read && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleMarkAsRead(notification.id)}
                  >
                    <MaterialIcons name="check" size={16} color="#4CAF50" />
                    <Text style={styles.actionText}>Mark Read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteDeadline(notification.id)}
                >
                  <MaterialIcons name="delete" size={16} color="#F44336" />
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };


  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications & Reminders</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'interviews' && styles.activeTab]}
            onPress={() => setActiveTab('interviews')}
          >
            <Text style={[styles.tabText, activeTab === 'interviews' && styles.activeTabText]}>
              Interviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'assessments' && styles.activeTab]}
            onPress={() => setActiveTab('assessments')}
          >
            <Text style={[styles.tabText, activeTab === 'assessments' && styles.activeTabText]}>
              Assessments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'deadlines' && styles.activeTab]}
            onPress={() => setActiveTab('deadlines')}
          >
            <Text style={[styles.tabText, activeTab === 'deadlines' && styles.activeTabText]}>
              Deadlines
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'interviews' && renderInterviews()}
            {activeTab === 'assessments' && renderAssessments()}
            {activeTab === 'deadlines' && renderDeadlines()}
          </>
        )}
      </View>

      {/* Interview Modal */}
      <Modal
        visible={showInterviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInterviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Interview</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowInterviewModal(false);
                  setInterviewForm({});
                }}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Application *</Text>
              <ScrollView style={styles.pickerContainer}>
                {applications.map((app) => (
                  <TouchableOpacity
                    key={app.id}
                    style={[
                      styles.pickerOption,
                      interviewForm.application_id === app.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => setInterviewForm({...interviewForm, application_id: app.id})}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      interviewForm.application_id === app.id && styles.pickerOptionTextSelected
                    ]}>
                      {app.company} - {app.role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Interview Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['phone', 'video', 'in_person', 'technical', 'hr', 'final'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      interviewForm.interview_type === type && styles.typeButtonSelected
                    ]}
                    onPress={() => setInterviewForm({...interviewForm, interview_type: type as any})}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      interviewForm.interview_type === type && styles.typeButtonTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => {
                  setPickerType('interview');
                  setShowDatePicker(true);
                }}
              >
                <MaterialIcons name="calendar-today" size={20} color="#2196F3" />
                <Text style={styles.dateTimeButtonText}>
                  {interviewForm.scheduled_date ? 
                    formatDateForDisplay(new Date(interviewForm.scheduled_date)) : 
                    'Select Date'
                  }
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time *</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => {
                  setPickerType('interview');
                  setShowTimePicker(true);
                }}
              >
                <MaterialIcons name="access-time" size={20} color="#2196F3" />
                <Text style={styles.dateTimeButtonText}>
                  {interviewForm.scheduled_date ? 
                    formatTimeForDisplay(new Date(interviewForm.scheduled_date)) : 
                    'Select Time'
                  }
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="60"
                value={interviewForm.duration_minutes?.toString()}
                onChangeText={(text) => setInterviewForm({...interviewForm, duration_minutes: parseInt(text) || undefined})}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Office address or meeting room"
                value={interviewForm.location}
                onChangeText={(text) => setInterviewForm({...interviewForm, location: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Interviewer Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Interviewer's name"
                value={interviewForm.interviewer_name}
                onChangeText={(text) => setInterviewForm({...interviewForm, interviewer_name: text})}
              />
            </View>

            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowInterviewModal(false);
                  setInterviewForm({});
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                onPress={handleCreateInterview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Schedule</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Assessment Modal */}
      <Modal
        visible={showAssessmentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAssessmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Assessment Reminder</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowAssessmentModal(false);
                  setAssessmentForm({});
                }}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Application *</Text>
              <ScrollView style={styles.pickerContainer}>
                {applications.map((app) => (
                  <TouchableOpacity
                    key={app.id}
                    style={[
                      styles.pickerOption,
                      assessmentForm.application_id === app.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => setAssessmentForm({...assessmentForm, application_id: app.id})}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      assessmentForm.application_id === app.id && styles.pickerOptionTextSelected
                    ]}>
                      {app.company} - {app.role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Technical Assessment"
                value={assessmentForm.title}
                onChangeText={(text) => setAssessmentForm({...assessmentForm, title: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Assessment details and instructions"
                value={assessmentForm.message}
                onChangeText={(text) => setAssessmentForm({...assessmentForm, message: text})}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => {
                  setPickerType('assessment');
                  setShowDatePicker(true);
                }}
              >
                <MaterialIcons name="calendar-today" size={20} color="#2196F3" />
                <Text style={styles.dateTimeButtonText}>
                  {assessmentForm.scheduled_for ? 
                    formatDateForDisplay(new Date(assessmentForm.scheduled_for)) : 
                    'Select Date'
                  }
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time *</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => {
                  setPickerType('assessment');
                  setShowTimePicker(true);
                }}
              >
                <MaterialIcons name="access-time" size={20} color="#2196F3" />
                <Text style={styles.dateTimeButtonText}>
                  {assessmentForm.scheduled_for ? 
                    formatTimeForDisplay(new Date(assessmentForm.scheduled_for)) : 
                    'Select Time'
                  }
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowAssessmentModal(false);
                  setAssessmentForm({});
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                onPress={handleCreateAssessment}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Reminder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Deadline Modal */}
      <Modal
        visible={showDeadlineModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDeadlineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Deadline Reminder</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowDeadlineModal(false);
                  setDeadlineForm({});
                }}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Application *</Text>
              <ScrollView style={styles.pickerContainer}>
                {applications.map((app) => (
                  <TouchableOpacity
                    key={app.id}
                    style={[
                      styles.pickerOption,
                      deadlineForm.application_id === app.id && styles.pickerOptionSelected
                    ]}
                    onPress={() => setDeadlineForm({...deadlineForm, application_id: app.id})}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      deadlineForm.application_id === app.id && styles.pickerOptionTextSelected
                    ]}>
                      {app.company} - {app.role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Application Deadline"
                value={deadlineForm.title}
                onChangeText={(text) => setDeadlineForm({...deadlineForm, title: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Deadline details and requirements"
                value={deadlineForm.message}
                onChangeText={(text) => setDeadlineForm({...deadlineForm, message: text})}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date *</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => {
                  setPickerType('deadline');
                  setShowDatePicker(true);
                }}
              >
                <MaterialIcons name="calendar-today" size={20} color="#2196F3" />
                <Text style={styles.dateTimeButtonText}>
                  {deadlineForm.scheduled_for ? 
                    formatDateForDisplay(new Date(deadlineForm.scheduled_for)) : 
                    'Select Date'
                  }
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Time *</Text>
              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={() => {
                  setPickerType('deadline');
                  setShowTimePicker(true);
                }}
              >
                <MaterialIcons name="access-time" size={20} color="#2196F3" />
                <Text style={styles.dateTimeButtonText}>
                  {deadlineForm.scheduled_for ? 
                    formatTimeForDisplay(new Date(deadlineForm.scheduled_for)) : 
                    'Select Time'
                  }
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowDeadlineModal(false);
                  setDeadlineForm({});
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
                onPress={handleCreateDeadline}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Deadline</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  markAllButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#2196F3',
    borderRadius: 20,
  },
  markAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  applicationInfo: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
  },
  markReadButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E3F2FD',
    borderRadius: 15,
  },
  markReadText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
  },
  interviewItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  interviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  interviewType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  interviewDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  interviewLocation: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  interviewerInfo: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 5,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  addButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
    width: '100%',
    maxWidth: 400,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  typeButtonTextSelected: {
    color: 'white',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTimeButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});
