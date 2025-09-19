import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export interface Resume {
  id: string;
  user_id: string;
  name: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  version: string;
  is_default: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationResume {
  id: string;
  application_id: string;
  resume_id: string;
  created_at: string;
}

export class ResumeService {
  // Upload a new resume
  static async uploadResume(
    fileUri: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    name: string,
    description?: string
  ): Promise<Resume> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Generate unique file name
      const uniqueFileName = `${user.id}/${Date.now()}_${fileName}`;

      // Read file as base64
      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // Convert base64 to blob for Supabase
      const response = await fetch(`data:${fileType};base64,${fileData}`);
      const blob = await response.blob();

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(uniqueFileName, blob, {
          contentType: fileType,
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(uniqueFileName);

      // Save resume metadata to database
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          name,
          file_name: fileName,
          file_path: urlData.publicUrl,
          file_size: fileSize,
          file_type: fileType,
          description,
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }

  // Get all resumes for a user
  static async getUserResumes(): Promise<Resume[]> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw error;
    }
  }

  // Update resume metadata
  static async updateResume(
    resumeId: string,
    updates: {
      name?: string;
      description?: string;
      is_default?: boolean;
    }
  ): Promise<Resume> {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .update(updates)
        .eq('id', resumeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  // Delete resume
  static async deleteResume(resumeId: string): Promise<void> {
    try {
      // Get resume info first
      const { data: resume, error: fetchError } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('id', resumeId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const fileName = resume.file_path.split('/').pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('resumes')
          .remove([fileName]);

        if (storageError) {
          console.warn('Error deleting file from storage:', storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  // Set default resume
  static async setDefaultResume(resumeId: string): Promise<void> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // First, unset all other default resumes
      await supabase
        .from('resumes')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set the selected resume as default
      const { error } = await supabase
        .from('resumes')
        .update({ is_default: true })
        .eq('id', resumeId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting default resume:', error);
      throw error;
    }
  }

  // Attach resume to application
  static async attachResumeToApplication(
    applicationId: string,
    resumeId: string
  ): Promise<ApplicationResume> {
    try {
      const { data, error } = await supabase
        .from('application_resumes')
        .insert({
          application_id: applicationId,
          resume_id: resumeId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error attaching resume to application:', error);
      throw error;
    }
  }

  // Get resumes for a specific application
  static async getApplicationResumes(applicationId: string): Promise<Resume[]> {
    try {
      const { data, error } = await supabase
        .from('application_resumes')
        .select(`
          resumes (
            id,
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
    } catch (error) {
      console.error('Error fetching application resumes:', error);
      throw error;
    }
  }

  // Download resume file
  static async downloadResume(resume: Resume): Promise<void> {
    try {
      const fileName = resume.file_name;
      const fileUri = (FileSystem.documentDirectory as string || '') + fileName;
      
      const downloadResult = await FileSystem.downloadAsync(
        resume.file_path,
        fileUri
      );

      if (downloadResult.status === 200) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: resume.file_type,
            dialogTitle: `Share ${resume.name}`,
          });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      } else {
        throw new Error('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      throw error;
    }
  }

  // Pick document from device
  static async pickDocument(): Promise<DocumentPicker.DocumentPickerResult | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return null;
      return result;
    } catch (error) {
      console.error('Error picking document:', error);
      throw error;
    }
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file type icon
  static getFileTypeIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📄';
  }
}