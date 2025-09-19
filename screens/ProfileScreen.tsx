import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ProfileScreenProps {
  user: any;
  onSignOut: () => void;
  applications: any[];
}

export default function ProfileScreen({ user, onSignOut, applications }: ProfileScreenProps) {

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: onSignOut,
        },
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      'Notification settings will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleBackupSync = () => {
    Alert.alert(
      'Backup & Sync',
      'Your data is automatically synced to the cloud. Manual backup options will be available soon.',
      [{ text: 'OK' }]
    );
  };

  const handleHelpSupport = () => {
    Alert.alert(
      'Help & Support',
      'Need help? Contact us at support@joblin.app or visit our help center.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Support', onPress: () => {
          // TODO: Implement contact support functionality
          Alert.alert('Contact Support', 'Opening support email...');
        }}
      ]
    );
  };

  const getStats = () => {
    const total = applications.length;
    const interviews = applications.filter(app => app.status === 'interview').length;
    const offers = applications.filter(app => app.status === 'offer').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    
    return { total, interviews, offers, rejected };
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialIcons name="person" size={48} color="white" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.memberSince}>
                Member since {new Date(user?.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>


          {/* Statistics */}
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Your Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <MaterialIcons name="work" size={24} color="#2196F3" />
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Applications</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="event" size={24} color="#FF9800" />
                <Text style={styles.statNumber}>{stats.interviews}</Text>
                <Text style={styles.statLabel}>Interviews</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                <Text style={styles.statNumber}>{stats.offers}</Text>
                <Text style={styles.statLabel}>Offers</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="trending-up" size={24} color="#9C27B0" />
                <Text style={styles.statNumber}>
                  {stats.total > 0 ? Math.round((stats.offers / stats.total) * 100) : 0}%
                </Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>
          </View>


          {/* Settings */}
          <View style={styles.settingsCard}>
            <Text style={styles.cardTitle}>Settings</Text>
            <TouchableOpacity style={styles.settingItem} onPress={handleNotifications}>
              <MaterialIcons name="notifications" size={20} color="#666" />
              <Text style={styles.settingText}>Notifications</Text>
              <MaterialIcons name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={handleBackupSync}>
              <MaterialIcons name="backup" size={20} color="#666" />
              <Text style={styles.settingText}>Backup & Sync</Text>
              <MaterialIcons name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={handleHelpSupport}>
              <MaterialIcons name="help" size={20} color="#666" />
              <Text style={styles.settingText}>Help & Support</Text>
              <MaterialIcons name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={20} color="#F44336" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
  },
  statsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
});
