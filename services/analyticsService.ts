export interface ApplicationAnalytics {
  totalApplications: number;
  successRate: number;
  statusDistribution: {
    status: string;
    count: number;
    color: string;
    icon: string;
  }[];
  monthlyTrends: {
    month: string;
    count: number;
  }[];
  topCompanies: {
    company: string;
    count: number;
  }[];
  recentApplications: any[];
  averageApplicationsPerMonth: number;
}

export class AnalyticsService {
  static calculateAnalytics(applications: any[]): ApplicationAnalytics {
    const totalApplications = applications.length;
    
    // Calculate success rate (offers / total)
    const offers = applications.filter(app => app.status === 'offer').length;
    const successRate = totalApplications > 0 ? (offers / totalApplications) * 100 : 0;
    
    // Status distribution
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const statusDistribution = [
      {
        status: 'applied',
        count: statusCounts.applied || 0,
        color: '#2196F3',
        icon: 'send'
      },
      {
        status: 'assessment',
        count: statusCounts.assessment || 0,
        color: '#9C27B0',
        icon: 'quiz'
      },
      {
        status: 'interview',
        count: statusCounts.interview || 0,
        color: '#FF9800',
        icon: 'event'
      },
      {
        status: 'offer',
        count: statusCounts.offer || 0,
        color: '#4CAF50',
        icon: 'check-circle'
      },
      {
        status: 'rejected',
        count: statusCounts.rejected || 0,
        color: '#F44336',
        icon: 'cancel'
      }
    ];
    
    // Monthly trends (last 6 months)
    const monthlyData = this.getMonthlyTrends(applications);
    
    // Top companies
    const companyCounts = applications.reduce((acc, app) => {
      acc[app.company] = (acc[app.company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCompanies = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Recent applications (last 5)
    const recentApplications = applications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    // Average applications per month
    const months = new Set(monthlyData.map(d => d.month)).size;
    const averageApplicationsPerMonth = months > 0 ? totalApplications / months : 0;
    
    return {
      totalApplications,
      successRate,
      statusDistribution,
      monthlyTrends: monthlyData,
      topCompanies,
      recentApplications,
      averageApplicationsPerMonth
    };
  }
  
  private static getMonthlyTrends(applications: any[]) {
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push(monthStr);
    }
    
    const monthlyCounts = applications.reduce((acc, app) => {
      const appDate = new Date(app.created_at);
      const monthStr = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}`;
      acc[monthStr] = (acc[monthStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return last6Months.map(month => ({
      month,
      count: monthlyCounts[month] || 0
    }));
  }
  
  static getStatusColor(status: string): string {
    switch (status) {
      case 'applied': return '#2196F3';
      case 'assessment': return '#9C27B0';
      case 'interview': return '#FF9800';
      case 'offer': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#666';
    }
  }
  
  static getStatusIcon(status: string): string {
    switch (status) {
      case 'applied': return 'send';
      case 'assessment': return 'quiz';
      case 'interview': return 'event';
      case 'offer': return 'check-circle';
      case 'rejected': return 'cancel';
      default: return 'help';
    }
  }
}
