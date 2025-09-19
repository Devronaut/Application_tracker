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

export class ResumeServiceSimple {
  // Upload a new resume with file to Supabase storage
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

      // Read the file as array buffer for upload
      const fileData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      // Convert base64 to blob
      const byteCharacters = atob(fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileType });

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`${user.id}/${fileName}`, blob, {
          contentType: fileType,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded to storage:', uploadData);

      // Save metadata to database
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          name,
          file_name: fileName,
          file_path: fileUri, // Keep local URI for fallback
          file_url: uploadData.path, // Store storage path
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
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

      if (error) throw error;
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
