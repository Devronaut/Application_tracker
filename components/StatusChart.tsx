import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StatusData {
  status: string;
  count: number;
  color: string;
  icon: string;
}

interface StatusChartProps {
  data: StatusData[];
  total: number;
}

const { width } = Dimensions.get('window');
const chartWidth = width - 32;

export default function StatusChart({ data, total }: StatusChartProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied': return 'Applied';
      case 'assessment': return 'Assessment';
      case 'interview': return 'Interview';
      case 'offer': return 'Offer';
      case 'rejected': return 'Rejected';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Application Status</Text>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const barWidth = (percentage / 100) * chartWidth;
          
          return (
            <View key={item.status} style={styles.barContainer}>
              <View style={styles.barHeader}>
                <View style={styles.barInfo}>
                  <MaterialIcons name={item.icon as any} size={16} color={item.color} />
                  <Text style={styles.statusLabel}>{getStatusLabel(item.status)}</Text>
                </View>
                <Text style={styles.count}>{item.count}</Text>
              </View>
              <View style={styles.barBackground}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      width: barWidth, 
                      backgroundColor: item.color 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.percentage}>{percentage.toFixed(1)}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  chartContainer: {
    gap: 16,
  },
  barContainer: {
    marginBottom: 12,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  count: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  barBackground: {
    height: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 6,
  },
  percentage: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
    fontWeight: '500',
  },
});
