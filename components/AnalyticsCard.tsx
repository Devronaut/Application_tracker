import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { normalize, responsiveWidth, responsivePadding, isSmallScreen, isLargeScreen } from '../utils/responsive';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

export default function AnalyticsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color, 
  backgroundColor 
}: AnalyticsCardProps) {
  const iconSize = isSmallScreen() ? 20 : isLargeScreen() ? 28 : 24;
  
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.header}>
        <MaterialIcons name={icon as any} size={iconSize} color={color} />
        <Text style={[styles.title, { color }]}>{title}</Text>
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: color + '80' }]}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: responsivePadding(20),
    borderRadius: normalize(20),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minHeight: isSmallScreen() ? 100 : 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsivePadding(12),
  },
  title: {
    fontSize: normalize(16),
    fontWeight: '700',
    marginLeft: responsivePadding(12),
    flex: 1,
    lineHeight: normalize(20),
  },
  value: {
    fontSize: normalize(28),
    fontWeight: '800',
    marginBottom: responsivePadding(6),
    lineHeight: normalize(34),
  },
  subtitle: {
    fontSize: normalize(13),
    fontWeight: '500',
    opacity: 0.8,
    lineHeight: normalize(16),
  },
});
