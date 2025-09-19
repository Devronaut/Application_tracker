import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface TabNavigatorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'applications', label: 'Applications', icon: 'work' },
  { id: 'resumes', label: 'Resumes', icon: 'description' },
  { id: 'profile', label: 'Profile', icon: 'person' },
];

export default function TabNavigator({ activeTab, onTabChange }: TabNavigatorProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <MaterialIcons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.id ? '#2196F3' : '#757575'}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === tab.id && styles.activeTabLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: '#F5F5F5',
  },
  tabLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
