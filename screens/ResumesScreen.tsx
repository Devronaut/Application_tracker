import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ResumeServiceSimple as ResumeService, Resume } from '../services/resumeServiceSimple';

interface ResumesScreenProps {
  // We'll add resume management functionality later
}

export default function ResumesScreen({}: ResumesScreenProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [resumeDescription, setResumeDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await ResumeService.getUserResumes();
      setResumes(data);
    } catch (error) {
      console.error('Error loading resumes:', error);
      Alert.alert('Error', 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await ResumeService.getUserResumes();
      setResumes(data);
    } catch (error) {
      console.error('Error loading resumes:', error);
      Alert.alert('Error', 'Failed to load resumes');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUploadResume = async () => {
    try {
      const result = await ResumeService.pickDocument();
      if (!result) return;

      const file = result.assets?.[0];
      if (!file) return;

      // Store the selected file
      setSelectedFile(file);
      setShowUploadModal(true);
      setResumeName(file.name.split('.')[0]); // Use filename without extension as default name
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const confirmUpload = async () => {
    if (!resumeName.trim()) {
      Alert.alert('Error', 'Please enter a resume name');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'No file selected');
      return;
    }

    try {
      setUploading(true);
      
      // Use the already selected file instead of picking again
      await ResumeService.uploadResume(
        selectedFile.uri,
        selectedFile.name,
        selectedFile.size || 0,
        selectedFile.mimeType || 'application/pdf',
        resumeName.trim(),
        resumeDescription.trim() || undefined
      );

      Alert.alert('Success', 'Resume uploaded successfully!');
      setShowUploadModal(false);
      setResumeName('');
      setResumeDescription('');
      setSelectedFile(null); // Clear the selected file
      await loadResumes();
    } catch (error) {
      console.error('Error uploading resume:', error);
      Alert.alert('Error', 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadResume = async (resume: Resume) => {
    try {
      // For now, just show an alert that download is not implemented
      Alert.alert('Download', 'Download functionality will be implemented soon');
    } catch (error) {
      console.error('Error downloading resume:', error);
      Alert.alert('Error', 'Failed to download resume');
    }
  };

  const handleDeleteResume = (resume: Resume) => {
    Alert.alert(
      'Delete Resume',
      `Are you sure you want to delete "${resume.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ResumeService.deleteResume(resume.id);
              Alert.alert('Success', 'Resume deleted successfully!');
              await loadResumes();
            } catch (error) {
              console.error('Error deleting resume:', error);
              Alert.alert('Error', 'Failed to delete resume');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (resume: Resume) => {
    try {
      await ResumeService.setDefaultResume(resume.id);
      Alert.alert('Success', 'Default resume updated!');
      await loadResumes();
    } catch (error) {
      console.error('Error setting default resume:', error);
      Alert.alert('Error', 'Failed to set default resume');
    }
  };

  const handleRenameResume = (resume: Resume) => {
    Alert.prompt(
      'Rename Resume',
      'Enter new name for the resume:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: async (newName?: string) => {
            if (!newName?.trim()) return;
            try {
              await ResumeService.updateResume(resume.id, { name: newName.trim() });
              Alert.alert('Success', 'Resume renamed successfully!');
              await loadResumes();
            } catch (error) {
              console.error('Error renaming resume:', error);
              Alert.alert('Error', 'Failed to rename resume');
            }
          },
        },
      ],
      'plain-text',
      resume.name
    );
  };


  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Resume Management</Text>
          </View>

          {/* Simple Info Line */}
          <Text style={styles.infoLine}>
            Upload and manage multiple versions of your resume
          </Text>

          {/* Loading State */}
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Loading resumes...</Text>
            </View>
          ) : resumes.length > 0 ? (
            <View style={styles.resumesList}>
              <Text style={styles.sectionTitle}>Your Resumes ({resumes.length})</Text>
              {resumes.map((resume) => (
                <View key={resume.id} style={styles.resumeCard}>
                  <View style={styles.resumeInfo}>
                    <Text style={styles.resumeIcon}>
                      {ResumeService.getFileTypeIcon(resume.file_type)}
                    </Text>
                    <View style={styles.resumeDetails}>
                      <View style={styles.resumeHeader}>
                        <Text style={styles.resumeName}>{resume.name}</Text>
                        {resume.is_default && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.resumeMeta}>
                        {ResumeService.formatFileSize(resume.file_size)} • 
                        {resume.version} • 
                        {new Date(resume.created_at).toLocaleDateString()}
                      </Text>
                      {resume.description && (
                        <Text style={styles.resumeDescription}>{resume.description}</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.resumeActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDownloadResume(resume)}
                    >
                      <MaterialIcons name="download" size={16} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleRenameResume(resume)}
                    >
                      <MaterialIcons name="edit" size={16} color="#FF9800" />
                    </TouchableOpacity>
                    {!resume.is_default && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(resume)}
                      >
                        <MaterialIcons name="star" size={16} color="#4CAF50" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDeleteResume(resume)}
                    >
                      <MaterialIcons name="delete" size={16} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="description" size={48} color="#999" />
              <Text style={styles.emptyTitle}>No Resumes Yet</Text>
              <Text style={styles.emptyText}>
                Upload your first resume to start tracking different versions for different applications.
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleUploadResume}>
                <Text style={styles.emptyButtonText}>Upload Resume</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showUploadModal}
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Resume</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Resume Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter resume name"
                value={resumeName}
                onChangeText={setResumeName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter description"
                value={resumeDescription}
                onChangeText={setResumeDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setShowUploadModal(false);
                  setResumeName('');
                  setResumeDescription('');
                  setSelectedFile(null); // Clear the selected file when canceling
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.uploadConfirmButton, uploading && styles.uploadConfirmButtonDisabled]} 
                onPress={confirmUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.uploadConfirmButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload FAB */}
      <TouchableOpacity style={styles.uploadFab} onPress={handleUploadResume}>
        <MaterialIcons name="cloud-upload" size={24} color="white" />
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
    padding: 16,
  },
  header: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
  },
  uploadFab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  infoLine: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  resumesList: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resumeCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resumeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  resumeDetails: {
    flex: 1,
  },
  resumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resumeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  resumeMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  resumeDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginBottom: 20,
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
    lineHeight: 20,
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
  loadingState: {
    alignItems: 'center',
    paddingVertical: 48,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
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
  uploadConfirmButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  uploadConfirmButtonDisabled: {
    backgroundColor: '#BBDEFB',
  },
  uploadConfirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});