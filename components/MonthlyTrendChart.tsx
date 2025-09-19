import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface MonthlyData {
  month: string;
  count: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyData[];
}

const { width } = Dimensions.get('window');
const chartWidth = width - 64;

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const getBarColor = (index: number, count: number) => {
    if (count === 0) return ['#F5F5F5', '#F5F5F5'];
    if (index === data.length - 1) return ['#4CAF50', '#2E7D32']; // Green gradient for current month
    if (count > maxCount * 0.7) return ['#FF9800', '#F57C00']; // Orange gradient for high values
    if (count > maxCount * 0.4) return ['#2196F3', '#1976D2']; // Blue gradient for medium values
    return ['#9C27B0', '#7B1FA2']; // Purple gradient for low values
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Monthly Applications</Text>
          <Text style={styles.subtitle}>Track your progress over time</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const height = (item.count / maxCount) * 100;
          const isLast = index === data.length - 1;
          const colors = getBarColor(index, item.count);
          const hasData = item.count > 0;
          
          return (
            <View key={item.month} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                {hasData ? (
                  <LinearGradient
                    colors={colors as [string, string]}
                    style={[
                      styles.bar, 
                      { 
                        height: Math.max(height, 8),
                        shadowColor: colors[0],
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  />
                ) : (
                  <View style={[styles.bar, styles.emptyBar]} />
                )}
                {hasData && (
                  <View style={styles.valueBubble}>
                    <Text style={styles.valueText}>{item.count}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.monthLabel, isLast && styles.currentMonthLabel]}>
                {getMonthName(item.month)}
              </Text>
            </View>
          );
        })}
      </View>
      
      {data.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons name="bar-chart" size={48} color="#E0E0E0" />
          </View>
          <Text style={styles.emptyText}>No applications yet</Text>
          <Text style={styles.emptySubtext}>Start tracking your job applications</Text>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: 12,
    position: 'relative',
  },
  bar: {
    width: 28,
    borderRadius: 14,
    minHeight: 8,
    position: 'relative',
  },
  emptyBar: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  valueBubble: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  valueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  monthLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  currentMonthLabel: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    fontWeight: '400',
  },
});
