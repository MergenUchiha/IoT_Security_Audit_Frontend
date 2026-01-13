import { useState, useEffect, useCallback } from 'react';
import { analyticsApi, handleApiError } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

interface DashboardMetrics {
  devicesOnline: number;
  totalDevices: number;
  totalVulnerabilities: number;
  criticalIssues: number;
  metrics?: any;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, on, off } = useWebSocket();

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const response = await analyticsApi.getDashboard();
      setMetrics(response.data);
    } catch (err: any) {
      const errorMessage = handleApiError(err);
      console.error('Failed to fetch dashboard data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const handleAnalyticsUpdate = (data: any) => {
      console.log('📊 Analytics update received:', data);
      setMetrics((prev) => ({
        ...prev,
        ...data,
      }));
    };

    const handleDeviceUpdate = () => {
      // Refetch on device changes
      fetchDashboard();
    };

    on('analyticsUpdate', handleAnalyticsUpdate);
    on('deviceUpdate', handleDeviceUpdate);
    on('deviceStatusUpdate', handleDeviceUpdate);

    return () => {
      off('analyticsUpdate', handleAnalyticsUpdate);
      off('deviceUpdate', handleDeviceUpdate);
      off('deviceStatusUpdate', handleDeviceUpdate);
    };
  }, [isConnected, on, off, fetchDashboard]);

  // Auto-refresh every 30 seconds (instead of continuous polling)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchDashboard();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboard, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-2 bg-cyber-primary text-white rounded-lg hover:bg-opacity-80 transition"
          >
            Retry
          </button>
          <div className="mt-6 text-sm text-gray-500">
            <p>Make sure backend is running on:</p>
            <code className="bg-gray-800 px-2 py-1 rounded">http://localhost:3001</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></span>
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-4 py-2 bg-cyber-primary text-white rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-cyber-dark border border-gray-700 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Devices</h3>
          <p className="text-3xl font-bold text-white">{metrics?.totalDevices || 0}</p>
        </div>

        <div className="bg-cyber-dark border border-gray-700 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Devices Online</h3>
          <p className="text-3xl font-bold text-green-500">{metrics?.devicesOnline || 0}</p>
        </div>

        <div className="bg-cyber-dark border border-gray-700 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Vulnerabilities</h3>
          <p className="text-3xl font-bold text-yellow-500">
            {metrics?.totalVulnerabilities || 0}
          </p>
        </div>

        <div className="bg-cyber-dark border border-gray-700 rounded-lg p-6">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Critical Issues</h3>
          <p className="text-3xl font-bold text-red-500">{metrics?.criticalIssues || 0}</p>
        </div>
      </div>

      <div className="bg-cyber-dark border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Backend Connection</span>
            <span className="text-green-500 font-medium">✓ Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">WebSocket</span>
            <span
              className={`font-medium ${
                isConnected ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isConnected ? '✓ Connected' : '✗ Disconnected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Last Updated</span>
            <span className="text-gray-400 text-sm">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}