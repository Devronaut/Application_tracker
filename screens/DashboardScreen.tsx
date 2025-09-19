import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AnalyticsCard from '../components/AnalyticsCard';
import StatusChart from '../components/StatusChart';
import MonthlyTrendChart from '../components/MonthlyTrendChart';
import { AnalyticsService, ApplicationAnalytics } from '../services/analyticsService';
import { 
  normalize, 
  responsiveWidth, 
  responsiveHeight, 
  responsivePadding, 
  responsiveMargin,
  isSmallScreen, 
  isLargeScreen,
  isTablet 
} from '../utils/responsive';

interface DashboardScreenProps {
  applications: any[];
  onAddApplication: () => void;
  onEditApplication: (application: any) => void;
  onDeleteApplication: (id: string) => void;
  user: any;
  onOpenNotifications?: () => void;
}

export default function DashboardScreen({ 
  applications, 
  onAddApplication, 
  onEditApplication, 
  onDeleteApplication,
  user,
  onOpenNotifications
}: DashboardScreenProps) {
  const analytics: ApplicationAnalytics = AnalyticsService.calculateAnalytics(applications);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Navbar */}
          <View style={styles.navbar}>
            <View style={styles.navbarContent}>
              <View style={styles.brandSection}>
                <Text style={styles.brandName}>JOBLIN</Text>
                <Text style={styles.brandTagline}>Centralize Your Applications</Text>
              </View>
              <View style={styles.navbarActions}>
                {onOpenNotifications && (
                  <TouchableOpacity 
                    style={styles.notificationButton} 
                    onPress={onOpenNotifications}
                  >
                    <MaterialIcons name="notifications" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Analytics Cards */}
          <View style={styles.analyticsGrid}>
            <View style={styles.cardRow}>
              <AnalyticsCard
                title="Total Applications"
                value={analytics.totalApplications}
                icon="work"
                color="#2196F3"
                backgroundColor="#E3F2FD"
              />
              <AnalyticsCard
                title="Success Rate"
                value={`${analytics.successRate.toFixed(1)}%`}
                subtitle="Offers received"
                icon="trending-up"
                color="#4CAF50"
                backgroundColor="#E8F5E8"
              />
            </View>
            <View style={styles.cardRow}>
              <AnalyticsCard
                title="This Month"
                value={analytics.monthlyTrends[analytics.monthlyTrends.length - 1]?.count || 0}
                subtitle="Applications"
                icon="calendar-today"
                color="#FF9800"
                backgroundColor="#FFF3E0"
              />
              <AnalyticsCard
                title="Avg/Month"
                value={analytics.averageApplicationsPerMonth.toFixed(1)}
                subtitle="Applications"
                icon="timeline"
                color="#9C27B0"
                backgroundColor="#F3E5F5"
              />
            </View>
          </View>

          {/* Status Distribution Chart */}
          {analytics.totalApplications > 0 && (
            <StatusChart 
              data={analytics.statusDistribution} 
              total={analytics.totalApplications} 
            />
          )}

          {/* Monthly Trend Chart */}
          {analytics.monthlyTrends.length > 0 && (
            <MonthlyTrendChart data={analytics.monthlyTrends} />
          )}

          {/* Top Companies */}
          {analytics.topCompanies.length > 0 && (
            <View style={styles.companiesCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="business" size={20} color="#2196F3" />
                <Text style={styles.cardTitle}>Top Companies</Text>
              </View>
              {analytics.topCompanies.map((company, index) => (
                <View key={company.company} style={styles.companyItem}>
                  <View style={styles.companyInfo}>
                    <Text style={styles.companyRank}>#{index + 1}</Text>
                    <Text style={styles.companyName}>{company.company}</Text>
                  </View>
                  <Text style={styles.companyCount}>{company.count} applications</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recent Applications */}
          {analytics.recentApplications.length > 0 && (
            <View style={styles.applicationsCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="history" size={20} color="#2196F3" />
                <Text style={styles.cardTitle}>Recent Applications</Text>
              </View>
              {analytics.recentApplications.map((app) => (
                <TouchableOpacity 
                  key={app.id} 
                  style={styles.applicationItem}
                  onPress={() => onEditApplication(app)}
                >
                  <View style={styles.applicationInfo}>
                    <Text style={styles.companyName}>{app.company}</Text>
                    <Text style={styles.roleName}>{app.role}</Text>
                    <Text style={styles.applicationDate}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <MaterialIcons 
                      name={AnalyticsService.getStatusIcon(app.status) as any} 
                      size={20} 
                      color={AnalyticsService.getStatusColor(app.status)} 
                    />
                    <Text style={[styles.statusText, { color: AnalyticsService.getStatusColor(app.status) }]}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Welcome Message for New Users */}
          {applications.length === 0 && (
            <View style={styles.welcomeCard}>
              <MaterialIcons name="work-outline" size={48} color="#2196F3" />
              <Text style={styles.welcomeTitle}>Welcome to Resume Tracker!</Text>
              <Text style={styles.welcomeText}>
                Start tracking your job applications by tapping the + button below.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      
      {/* Add Application Button */}
      <TouchableOpacity style={styles.fab} onPress={onAddApplication}>
        <MaterialIcons name="add" size={24} color="white" />
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
    paddingHorizontal: responsivePadding(16),
    paddingBottom: responsivePadding(16),
  },
  navbar: {
    backgroundColor: '#2196F3',
    paddingHorizontal: responsivePadding(20),
    paddingVertical: responsivePadding(16),
    marginBottom: responsiveMargin(20),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  navbarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandSection: {
    flex: 1,
  },
  brandName: {
    fontSize: normalize(28),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: responsiveMargin(2),
    letterSpacing: -0.5,
    fontFamily: 'Poppins-Bold',
    lineHeight: normalize(34),
  },
  brandTagline: {
    fontSize: normalize(14),
    color: '#E3F2FD',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
    lineHeight: normalize(18),
  },
  navbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsGrid: {
    marginBottom: responsiveMargin(16),
  },
  cardRow: {
    flexDirection: isSmallScreen() ? 'column' : 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveMargin(12),
    gap: responsivePadding(12),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveMargin(20),
  },
  cardTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: responsiveMargin(12),
    lineHeight: normalize(24),
  },
  companiesCard: {
    backgroundColor: 'white',
    padding: responsivePadding(24),
    borderRadius: normalize(20),
    marginBottom: responsiveMargin(16),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  companyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsivePadding(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyRank: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: responsiveMargin(12),
    minWidth: normalize(24),
    lineHeight: normalize(18),
  },
  companyName: {
    fontSize: normalize(16),
    fontWeight: '600',
    color: '#333',
    lineHeight: normalize(20),
  },
  companyCount: {
    fontSize: normalize(14),
    color: '#666',
    lineHeight: normalize(18),
  },
  applicationsCard: {
    backgroundColor: 'white',
    padding: responsivePadding(24),
    borderRadius: normalize(20),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  applicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: responsivePadding(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  applicationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 4,
    backgroundColor: '#F5F5F5',
  },
  applicationInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: normalize(14),
    color: '#666',
    marginTop: responsiveMargin(2),
    lineHeight: normalize(18),
  },
  applicationDate: {
    fontSize: normalize(12),
    color: '#999',
    marginTop: responsiveMargin(2),
    lineHeight: normalize(16),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: normalize(12),
    fontWeight: '500',
    marginLeft: responsiveMargin(4),
    lineHeight: normalize(16),
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: responsivePadding(40),
    borderRadius: normalize(20),
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  welcomeTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#333',
    marginTop: responsiveMargin(16),
    marginBottom: responsiveMargin(8),
    lineHeight: normalize(24),
  },
  welcomeText: {
    fontSize: normalize(14),
    color: '#666',
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  fab: {
    position: 'absolute',
    right: responsivePadding(16),
    bottom: responsivePadding(16),
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
