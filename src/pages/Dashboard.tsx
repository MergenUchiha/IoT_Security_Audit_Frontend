import { useState, useEffect, useCallback, memo } from 'react';
import { Shield, Activity, AlertTriangle, Wifi } from 'lucide-react';
import { analyticsApi, handleApiError } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTheme } from '../contexts/ThemeContext';
import StatsCard from '../components/Dashboard/StatsCard';
import VulnerabilityTrends from '../components/Dashboard/VulnerabilityTrends';
import NetworkTraffic from '../components/Dashboard/NetworkTraffic';
import RiskDistribution from '../components/Dashboard/RiskDistribution';
import ComplianceScore from '../components/Dashboard/ComplianceScore';
import RecentAlerts from '../components/Dashboard/RecentAlerts';
import ActivityFeed from '../components/Dashboard/ActivityFeed';

interface DashboardMetrics {
  devicesOnline: number;
  totalDevices: number;
  totalVulnerabilities: number;
  criticalIssues: number;
  metrics?: any;
}

// Memoize components to prevent unnecessary re-renders
const MemoizedStatsCard = memo(StatsCard);
const MemoizedVulnerabilityTrends = memo(VulnerabilityTrends);
const MemoizedNetworkTraffic = memo(NetworkTraffic);
const MemoizedRiskDistribution = memo(RiskDistribution);
const MemoizedComplianceScore = memo(ComplianceScore);
const MemoizedRecentAlerts = memo(RecentAlerts);
const MemoizedActivityFeed = memo(ActivityFeed);

export default function Dashboard() {
  const { t } = useTheme();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, on, off } = useWebSocket();

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await analyticsApi.getDashboard();
      setMetrics(response.data);
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      console.error('Error fetching dashboard data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch only
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const handleAnalyticsUpdate = (data: any) => {
      setMetrics((prev) => prev ? { ...prev, ...data } : null);
    };

    on('analyticsUpdate', handleAnalyticsUpdate);
    on('dashboardMetrics', handleAnalyticsUpdate);

    return () => {
      off('analyticsUpdate', handleAnalyticsUpdate);
      off('dashboardMetrics', handleAnalyticsUpdate);
    };
  }, [isConnected, on, off]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="accent-cyan font-mono">{t.dashboard.loadingData}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-primary mb-2">{t.common.error}</h2>
          <p className="text-tertiary mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition font-mono"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary font-mono flex items-center gap-3">
            <Shield className="w-8 h-8 accent-cyan" />
            {t.dashboard.title}
          </h1>
          <p className="text-tertiary text-sm mt-1 font-mono">{t.dashboard.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Wifi className={`w-5 h-5 ${isConnected ? 'accent-green' : 'accent-red'}`} />
            <span className={`text-sm font-mono ${isConnected ? 'accent-green' : 'accent-red'}`}>
              {isConnected ? t.common.connected : t.common.disconnected}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MemoizedStatsCard
          icon={Wifi}
          label={t.dashboard.devicesOnline}
          value={`${metrics?.devicesOnline || 0}/${metrics?.totalDevices || 0}`}
          color="from-cyan-600 to-cyan-500"
        />
        <MemoizedStatsCard
          icon={Shield}
          label={t.dashboard.totalVulnerabilities}
          value={metrics?.totalVulnerabilities || 0}
          trend={12}
          color="from-orange-600 to-orange-500"
        />
        <MemoizedStatsCard
          icon={AlertTriangle}
          label={t.dashboard.criticalIssues}
          value={metrics?.criticalIssues || 0}
          trend={5}
          color="from-red-600 to-red-500"
        />
        <MemoizedStatsCard
          icon={Activity}
          label={t.dashboard.activeScans}
          value={0}
          color="from-green-600 to-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoizedVulnerabilityTrends />
        <MemoizedNetworkTraffic />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoizedRiskDistribution />
        <MemoizedComplianceScore />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemoizedRecentAlerts />
        <MemoizedActivityFeed />
      </div>
    </div>
  );
}