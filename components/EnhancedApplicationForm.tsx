import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { JobApplication, CreateJobApplicationData } from '../types/JobApplication';

interface EnhancedApplicationFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobApplicationData) => void;
  initialData?: Partial<JobApplication>;
  title: string;
}

export default function EnhancedApplicationForm({
  visible,
  onClose,
  onSubmit,
  initialData,
  title
}: EnhancedApplicationFormProps) {
  const [formData, setFormData] = useState<CreateJobApplicationData>({
    company: '',
    role: '',
    portal_url: '',
    status: 'applied',
    deadline: '',
    notes: '',
    salary: '',
    location: '',
    application_date: new Date().toISOString().split('T')[0],
    job_type: 'full-time',
    source: '',
    priority: 'medium',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form data when initialData changes (for editing different applications)
  useEffect(() => {
    if (initialData) {
      console.log('📝 Editing application:', initialData.company, initialData.role);
      setFormData({
        company: initialData.company || '',
        role: initialData.role || '',
        portal_url: initialData.portal_url || '',
        status: initialData.status || 'applied',
        deadline: initialData.deadline ? 
          (typeof initialData.deadline === 'string' ? 
            initialData.deadline.split('T')[0] : 
            new Date(initialData.deadline).toISOString().split('T')[0]
          ) : '',
        notes: initialData.notes || '',
        salary: initialData.salary || '',
        location: initialData.location || '',
        application_date: initialData.application_date ? 
          (typeof initialData.application_date === 'string' ? 
            initialData.application_date.split('T')[0] : 
            new Date(initialData.application_date).toISOString().split('T')[0]
          ) : new Date().toISOString().split('T')[0],
        job_type: initialData.job_type || 'full-time',
        source: initialData.source || '',
        priority: initialData.priority || 'medium',
      });
    } else {
      // Reset to default values for new application
      setFormData({
        company: '',
        role: '',
        portal_url: '',
        status: 'applied',
        deadline: '',
        notes: '',
        salary: '',
        location: '',
        application_date: new Date().toISOString().split('T')[0],
        job_type: 'full-time',
        source: '',
        priority: 'medium',
      });
    }
    // Clear any existing errors
    setErrors({});
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Job role is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    // Clean up form data - convert empty strings to null for optional fields
    const cleanedData = {
      ...formData,
      application_date: formData.application_date && formData.application_date.trim() !== '' 
        ? formData.application_date 
        : null,
      deadline: formData.deadline && formData.deadline.trim() !== '' 
        ? formData.deadline 
        : null,
      salary: formData.salary && formData.salary.trim() !== '' 
        ? formData.salary 
        : null,
      location: formData.location && formData.location.trim() !== '' 
        ? formData.location 
        : null,
      source: formData.source && formData.source.trim() !== '' 
        ? formData.source 
        : null,
      portal_url: formData.portal_url && formData.portal_url.trim() !== '' 
        ? formData.portal_url 
        : null,
      notes: formData.notes && formData.notes.trim() !== '' 
        ? formData.notes 
        : null,
    };

    onSubmit(cleanedData);
  };

  const handleInputChange = (field: keyof CreateJobApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company *</Text>
              <TextInput
                style={[styles.input, errors.company && styles.inputError]}
                value={formData.company || ''}
                onChangeText={(value) => handleInputChange('company', value)}
                placeholder="Enter company name"
              />
              {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Role *</Text>
              <TextInput
                style={[styles.input, errors.role && styles.inputError]}
                value={formData.role || ''}
                onChangeText={(value) => handleInputChange('role', value)}
                placeholder="Enter job role/title"
              />
              {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location || ''}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Salary</Text>
              <TextInput
                style={styles.input}
                value={formData.salary || ''}
                onChangeText={(value) => handleInputChange('salary', value)}
                placeholder="e.g., $80,000 - $100,000"
              />
            </View>
          </View>

          {/* Application Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Application Date</Text>
              <TextInput
                style={styles.input}
                value={formData.application_date || ''}
                onChangeText={(value) => handleInputChange('application_date', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Type</Text>
              <View style={styles.radioGroup}>
                {['full-time', 'part-time', 'contract', 'internship', 'freelance'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.radioOption,
                      formData.job_type === type && styles.radioOptionSelected
                    ]}
                    onPress={() => handleInputChange('job_type', type)}
                  >
                    <Text style={[
                      styles.radioText,
                      formData.job_type === type && styles.radioTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.radioGroup}>
                {['high', 'medium', 'low'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.radioOption,
                      formData.priority === priority && styles.radioOptionSelected
                    ]}
                    onPress={() => handleInputChange('priority', priority)}
                  >
                    <Text style={[
                      styles.radioText,
                      formData.priority === priority && styles.radioTextSelected
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Source</Text>
              <TextInput
                style={styles.input}
                value={formData.source || ''}
                onChangeText={(value) => handleInputChange('source', value)}
                placeholder="e.g., LinkedIn, Indeed, Company Website"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Portal URL</Text>
              <TextInput
                style={styles.input}
                value={formData.portal_url || ''}
                onChangeText={(value) => handleInputChange('portal_url', value)}
                placeholder="https://company.com/careers"
                keyboardType="url"
              />
            </View>

          </View>

          {/* Status and Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status & Notes</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.radioGroup}>
                {['applied', 'assessment', 'interview', 'offer', 'rejected'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.radioOption,
                      formData.status === status && styles.radioOptionSelected
                    ]}
                    onPress={() => handleInputChange('status', status)}
                  >
                    <Text style={[
                      styles.radioText,
                      formData.status === status && styles.radioTextSelected
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes || ''}
                onChangeText={(value) => handleInputChange('notes', value)}
                placeholder="Additional notes about this application..."
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {initialData ? 'Update Application' : 'Add Application'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '85%',
    minHeight: '60%',
    width: '90%',
    maxWidth: 500,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
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
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  radioOptionSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  radioTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
