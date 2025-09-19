import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ResumeSelectionModal from '../components/ResumeSelectionModal';
import { JobApplicationService } from '../services/jobApplicationService';
import { Resume } from '../services/resumeServiceSimple';
import { 
  normalize, 
  responsiveWidth, 
  responsiveHeight, 
  responsivePadding, 
  responsiveMargin,
  isSmallScreen, 
  isLargeScreen 
} from '../utils/responsive';

interface ApplicationsScreenProps {
  applications: (any & { attached_resumes?: Resume[] })[];
  onEditApplication: (application: any) => void;
  onDeleteApplication: (id: string) => void;
  onAddApplication: () => void;
  onRefreshApplications: () => void;
}

export default function ApplicationsScreen({ 
  applications, 
  onEditApplication, 
  onDeleteApplication,
  onAddApplication,
  onRefreshApplications
}: ApplicationsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return 'send';
      case 'assessment': return 'quiz';
      case 'interview': return 'event';
      case 'offer': return 'check-circle';
      case 'rejected': return 'cancel';
      default: return 'help';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return '#2196F3';
      case 'assessment': return '#9C27B0';
      case 'interview': return '#FF9800';
      case 'offer': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#757575';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      applied: applications.filter(app => app.status === 'applied').length,
      assessment: applications.filter(app => app.status === 'assessment').length,
      interview: applications.filter(app => app.status === 'interview').length,
      offer: applications.filter(app => app.status === 'offer').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleAttachResume = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setShowResumeModal(true);
  };

  const handleSelectResume = async (resume: Resume) => {
    if (!selectedApplicationId) return;

    try {
      await JobApplicationService.attachResumeToApplication(selectedApplicationId, resume.id);
      Alert.alert('Success', `Resume "${resume.name}" attached successfully!`);
      onRefreshApplications();
    } catch (error) {
      console.error('Error attaching resume:', error);
      Alert.alert('Error', 'Failed to attach resume');
    }
  };

  const handleDetachResume = async (applicationId: string, resumeId: string, resumeName: string) => {
    Alert.alert(
      'Detach Resume',
      `Are you sure you want to detach "${resumeName}" from this application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Detach',
          style: 'destructive',
          onPress: async () => {
            try {
              await JobApplicationService.detachResumeFromApplication(applicationId, resumeId);
              Alert.alert('Success', 'Resume detached successfully!');
              onRefreshApplications();
            } catch (error) {
              console.error('Error detaching resume:', error);
              Alert.alert('Error', 'Failed to detach resume');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Job Applications</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search applications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'applied', label: 'Applied', count: statusCounts.applied },
              { key: 'assessment', label: 'Assessment', count: statusCounts.assessment },
              { key: 'interview', label: 'Interview', count: statusCounts.interview },
              { key: 'offer', label: 'Offer', count: statusCounts.offer },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                   filterStatus === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setFilterStatus(filter.key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterStatus === filter.key && styles.filterButtonTextActive
                ]}>
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            <View style={styles.applicationsList}>
              {filteredApplications.map((app) => (
                <View key={app.id} style={styles.applicationCard}>
                  <TouchableOpacity 
                    style={styles.applicationContent}
                    onPress={() => onEditApplication(app)}
                  >
                    <View style={styles.applicationInfo}>
                      <Text style={styles.companyName}>{app.company}</Text>
                      <Text style={styles.roleName}>{app.role}</Text>
                      <Text style={styles.applicationDate}>
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.statusContainer}>
                      <MaterialIcons 
                        name={getStatusIcon(app.status)} 
                        size={20} 
                        color={getStatusColor(app.status)} 
                      />
                      <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Attached Resumes */}
                  {app.attached_resumes && app.attached_resumes.length > 0 && (
                    <View style={styles.attachedResumes}>
                      <Text style={styles.attachedResumesTitle}>Attached Resumes:</Text>
                      {app.attached_resumes.map((resume: any) => (
                        <View 
                          key={resume.id} 
                          style={styles.resumeItem}
                        >
                          <Text style={styles.resumeIcon}>📄</Text>
                          <View style={styles.resumeInfo}>
                            <Text style={styles.resumeName}>{resume.name}</Text>
                            <Text style={styles.resumeMeta}>
                              {resume.version} • {new Date(resume.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                          <View style={styles.resumeActions}>
                            <TouchableOpacity 
                              style={styles.detachButton}
                              onPress={() => handleDetachResume(app.id, resume.id, resume.name)}
                            >
                              <MaterialIcons name="close" size={16} color="#F44336" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.applicationActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleAttachResume(app.id)}
                    >
                      <MaterialIcons name="attach-file" size={16} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => onEditApplication(app)}
                    >
                      <MaterialIcons name="edit" size={16} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => onDeleteApplication(app.id)}
                    >
                      <MaterialIcons name="delete" size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="work-outline" size={48} color="#999" />
              <Text style={styles.emptyTitle}>
                {searchQuery || filterStatus !== 'all' ? 'No matching applications' : 'No applications yet'}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter' 
                  : 'Start tracking your job applications'
                }
              </Text>
              {!searchQuery && filterStatus === 'all' && (
                <TouchableOpacity style={styles.emptyButton} onPress={onAddApplication}>
                  <Text style={styles.emptyButtonText}>Add Your First Application</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Resume Selection Modal */}
      <ResumeSelectionModal
        visible={showResumeModal}
        onClose={() => {
          setShowResumeModal(false);
          setSelectedApplicationId(null);
        }}
        onSelectResume={handleSelectResume}
        title="Attach Resume to Application"
      />

      {/* Add Application FAB */}
      <TouchableOpacity style={styles.addFab} onPress={onAddApplication}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: responsivePadding(16),
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: responsivePadding(20),
    paddingVertical: responsivePadding(16),
    marginBottom: responsiveMargin(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    lineHeight: normalize(28),
  },
  addFab: {
    position: 'absolute',
    right: responsivePadding(16),
    bottom: responsivePadding(16),
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: responsivePadding(12),
    paddingVertical: responsivePadding(8),
    borderRadius: normalize(8),
    marginBottom: responsiveMargin(16),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: responsiveMargin(8),
    fontSize: normalize(16),
    color: '#333',
    lineHeight: normalize(20),
  },
  filterContainer: {
    marginBottom: responsiveMargin(16),
  },
  filterButton: {
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(8),
    backgroundColor: 'white',
    borderRadius: normalize(20),
    marginRight: responsiveMargin(8),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: normalize(14),
    color: '#666',
    fontWeight: '500',
    lineHeight: normalize(18),
  },
  filterButtonTextActive: {
    color: 'white',
  },
  applicationsList: {
    gap: responsivePadding(12),
  },
  applicationCard: {
    backgroundColor: 'white',
    borderRadius: normalize(8),
    padding: responsivePadding(16),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  applicationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveMargin(12),
  },
  applicationInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: responsiveMargin(4),
    lineHeight: normalize(22),
  },
  roleName: {
    fontSize: normalize(16),
    color: '#666',
    marginBottom: responsiveMargin(4),
    lineHeight: normalize(20),
  },
  applicationDate: {
    fontSize: normalize(12),
    color: '#999',
    lineHeight: normalize(16),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: normalize(14),
    fontWeight: '500',
    marginLeft: responsiveMargin(4),
    lineHeight: normalize(18),
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  attachedResumes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachedResumesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  resumeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  resumeMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detachButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FFEBEE',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
