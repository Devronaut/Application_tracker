import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold } from '@expo-google-fonts/poppins';
import { supabase } from './lib/supabase';
import ResumeSelectionModal from './components/ResumeSelectionModal';
import EnhancedApplicationForm from './components/EnhancedApplicationForm';
import NotificationCenter from './components/NotificationCenter';
import { JobApplicationService } from './services/jobApplicationService';
import { NotificationService } from './services/notificationService';
import { Resume } from './services/resumeServiceSimple';

// Import screen components
import DashboardScreen from './screens/DashboardScreen';
import ApplicationsScreen from './screens/ApplicationsScreen';
import ResumesScreen from './screens/ResumesScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import TabNavigator from './components/TabNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showEnhancedForm, setShowEnhancedForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    checkAuth();
  }, []);

  // Load applications when user is authenticated
  useEffect(() => {
    if (!showAuth && user) {
      loadApplications();
    }
  }, [showAuth, user]);

  // Initialize push notifications when user is authenticated

  const checkAuth = async () => {
    try {
      console.log('🔐 Checking authentication...');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('✅ User authenticated:', user.id);
        setUser(user);
        setActiveTab('dashboard'); // Ensure dashboard is active on app start
        loadApplications();
      } else {
        console.log('❌ No user found, showing auth screen');
        setLoading(false);
        setShowAuth(true);
      }
    } catch (error) {
      console.error('❌ Error checking auth:', error);
      setLoading(false);
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = async (user: any) => {
    try {
      // Refresh user data to get complete metadata
      const { data: { user: refreshedUser } } = await supabase.auth.getUser();
      setUser(refreshedUser || user);
      setShowAuth(false);
      setActiveTab('dashboard'); // Ensure we start on dashboard
      loadApplications();
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Fallback to original user data
      setUser(user);
      setShowAuth(false);
      setActiveTab('dashboard'); // Ensure we start on dashboard
      loadApplications();
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setApplications([]);
      setActiveTab('dashboard'); // Reset to dashboard for next login
      setShowAuth(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const loadApplications = async () => {
    try {
      console.log('🔄 Starting to load applications...');
      setLoading(true);
      if (!user) {
        console.log('❌ No user found, skipping load');
        return;
      }
      
      console.log('👤 Loading applications for user:', user.id);
      
      const { data, error } = await supabase
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading applications:', error);
        Alert.alert('Error', 'Failed to load applications');
        return;
      }

      console.log('📊 Raw data from database:', data);

      const applicationsWithResumes = data?.map((app: any) => ({
        ...app,
        attached_resumes: app.application_resumes?.map((ar: any) => ar.resumes).filter(Boolean) || []
      })) || [];

      console.log('✅ Loaded applications from database:', applicationsWithResumes.length, applicationsWithResumes);
      setApplications(applicationsWithResumes);
    } catch (error) {
      console.error('❌ Error loading applications:', error);
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };



  const deleteApplication = async (applicationId: string) => {
    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this application?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('job_applications')
                .delete()
                .eq('id', applicationId);

              if (error) {
                console.error('Error deleting application:', error);
                Alert.alert('Error', 'Failed to delete application');
                return;
              }

              // Update local state
              setApplications(applications.filter(app => app.id !== applicationId));
              Alert.alert('Success', 'Application deleted successfully!');
            } catch (error) {
              console.error('Error deleting application:', error);
              Alert.alert('Error', 'Failed to delete application');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return '#2196F3';
      case 'interview': return '#FF9800';
      case 'offer': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#666';
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            applications={applications}
            onAddApplication={() => setShowEnhancedForm(true)}
            onEditApplication={handleEditApplication}
            onDeleteApplication={deleteApplication}
            user={user}
            onOpenNotifications={() => setShowNotificationCenter(true)}
          />
        );
      case 'applications':
        return (
          <ApplicationsScreen
            applications={applications}
            onEditApplication={handleEditApplication}
            onDeleteApplication={deleteApplication}
            onAddApplication={() => setShowEnhancedForm(true)}
            onRefreshApplications={loadApplications}
          />
        );
      case 'resumes':
        return <ResumesScreen />;
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            applications={applications}
            onSignOut={signOut}
          />
        );
      default:
        return (
          <DashboardScreen
            applications={applications}
            onAddApplication={() => setShowEnhancedForm(true)}
            onEditApplication={handleEditApplication}
            onDeleteApplication={deleteApplication}
            user={user}
          />
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return 'send';
      case 'interview': return 'event';
      case 'offer': return 'check-circle';
      case 'rejected': return 'cancel';
      default: return 'help';
    }
  };

  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setShowResumeModal(false);
  };

  const handleEnhancedFormSubmit = async (data: any) => {
    try {
      setSaving(true);
      
      if (editingApplication) {
        // Update existing application
        await JobApplicationService.updateApplication(editingApplication.id, data);
        await loadApplications();
        Alert.alert('Success', 'Application updated successfully!');
      } else {
        // Create new application
        const newApplication = await JobApplicationService.createApplication({
          ...data,
          user_id: user?.id,
        });
        
        // Attach resume if selected
        if (selectedResume) {
          await JobApplicationService.attachResumeToApplication(newApplication.id, selectedResume.id);
        }
        
        // Create auto-reminders for new application
        if (data.application_date && user?.id) {
          await NotificationService.createAutoReminders(user.id, newApplication.id, data.application_date);
        }
        
        await loadApplications();
        Alert.alert('Success', 'Application added successfully!');
      }
      
      setShowEnhancedForm(false);
      setEditingApplication(null);
      setSelectedResume(null);
    } catch (error) {
      console.error('Error saving application:', error);
      Alert.alert('Error', 'Failed to save application');
    } finally {
      setSaving(false);
    }
  };

  const handleEditApplication = (application: any) => {
    console.log('🔍 Editing application:', application.company, application.role);
    setEditingApplication(application);
    setShowEnhancedForm(true);
  };


  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }


  if (showAuth) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <View style={styles.container}>
      {renderScreen()}
      
      <TabNavigator 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />



      {/* Resume Selection Modal */}
      <ResumeSelectionModal
        visible={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onSelectResume={handleSelectResume}
        title="Select Resume for Application"
      />

      <EnhancedApplicationForm
        key={`${showEnhancedForm ? 'visible' : 'hidden'}-${editingApplication?.id || 'new'}`}
        visible={showEnhancedForm}
        onClose={() => {
          setShowEnhancedForm(false);
          setEditingApplication(null);
        }}
        onSubmit={handleEnhancedFormSubmit}
        initialData={editingApplication}
        title={editingApplication ? 'Edit Application' : 'Add New Application'}
      />

      <NotificationCenter
        visible={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        userId={user?.id}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  applicationsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  applicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  applicationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  applicationInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  roleName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  applicationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  statusSelector: {
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  statusButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  statusButtonTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  addButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  authTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  authCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  authButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  authButtonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  authButtonSecondaryText: {
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 16,
  },
  signOutButton: {
    padding: 8,
  },
  // Resume Selection Styles
  resumeSelector: {
    marginBottom: 20,
  },
  resumeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  resumeButtonText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  removeResumeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FFEBEE',
  },
  // Resume Details Modal Styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  resumeDetailsContent: {
    flex: 1,
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  resumeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  resumeDetails: {
    flex: 1,
  },
  resumeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resumeMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resumeDescription: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    marginTop: 8,
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  // Attached Resumes Section Styles
  attachedResumesSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachedResumesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resumeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});