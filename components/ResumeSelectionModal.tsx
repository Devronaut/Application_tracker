import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ResumeServiceSimple as ResumeService, Resume } from '../services/resumeServiceSimple';

interface ResumeSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectResume: (resume: Resume) => void;
  selectedResumeId?: string;
  title?: string;
}

export default function ResumeSelectionModal({
  visible,
  onClose,
  onSelectResume,
  selectedResumeId,
  title = 'Select Resume'
}: ResumeSelectionModalProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadResumes();
    }
  }, [visible]);

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

  const handleSelectResume = (resume: Resume) => {
    onSelectResume(resume);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Loading resumes...</Text>
            </View>
          ) : resumes.length > 0 ? (
            <ScrollView style={styles.resumesList}>
              {resumes.map((resume) => (
                <TouchableOpacity
                  key={resume.id}
                  style={[
                    styles.resumeItem,
                    selectedResumeId === resume.id && styles.selectedResumeItem
                  ]}
                  onPress={() => handleSelectResume(resume)}
                >
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
                        {selectedResumeId === resume.id && (
                          <MaterialIcons name="check-circle" size={20} color="#2196F3" />
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
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="description" size={48} color="#999" />
              <Text style={styles.emptyTitle}>No Resumes Available</Text>
              <Text style={styles.emptyText}>
                Upload a resume first to attach it to applications.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  resumesList: {
    flex: 1,
    padding: 20,
  },
  resumeItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedResumeItem: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginRight: 8,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
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
    lineHeight: 20,
  },
});
