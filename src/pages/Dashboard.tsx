import { useState, useEffect } from 'react';
import { Terminal, Wifi, AlertTriangle, Shield, Activity } from 'lucide-react';
import StatsCard from '../components/Dashboard/StatsCard';
import VulnerabilityTrends from '../components/Dashboard/VulnerabilityTrends';
import NetworkTraffic from '../components/Dashboard/NetworkTraffic';
import RiskDistribution from '../components/Dashboard/RiskDistribution';
import ComplianceScore from '../components/Dashboard/ComplianceScore';
import RecentAlerts from '../components/Dashboard/RecentAlerts';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import { analyticsApi } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import type { LiveMetrics } from '../types';

const Dashboard = () => {
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    devicesOnline: 0,
    totalVulnerabilities: 0,
    criticalIssues: 0,
    scanningNow: 0,
  });
  const [loading, setLoading] = useState(true);
  const { connected } = useWebSocket();

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await analyticsApi.getDashboard();
        const data = response.data;
        
        setLiveMetrics({
          devicesOnline: data.devicesOnline || 0,
          totalVulnerabilities: data.totalVulnerabilities || 0,
          criticalIssues: data.criticalIssues || 0,
          scanningNow: data.activeScans || 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
            <Terminal className="w-8 h-8 text-cyan-400" />
            SECURITY COMMAND CENTER
          </h1>
          <p className="text-gray-400 mt-1 font-mono text-sm">Real-time IoT device monitoring and threat analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-sm font-mono ${connected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            {connected ? 'WEBSOCKET CONNECTED' : 'WEBSOCKET DISCONNECTED'}
          </div>
          <div className="w-px h-6 bg-cyan-500/30"></div>
          <div className="flex items-center gap-2 text-green-400 font-mono text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            API CONNECTED
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400 font-mono">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              icon={Wifi} 
              label="Devices Online" 
              value={liveMetrics.devicesOnline} 
              color="from-cyan-600 to-blue-600"
            />
            <StatsCard 
              icon={AlertTriangle} 
              label="Total Vulnerabilities" 
              value={liveMetrics.totalVulnerabilities} 
              color="from-orange-600 to-red-600"
            />
            <StatsCard 
              icon={Shield} 
              label="Critical Issues" 
              value={liveMetrics.criticalIssues} 
              color="from-red-600 to-pink-600"
            />
            <StatsCard 
              icon={Activity} 
              label="Active Scans" 
              value={liveMetrics.scanningNow} 
              color="from-green-600 to-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VulnerabilityTrends />
            <NetworkTraffic />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskDistribution />
            <ComplianceScore />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentAlerts />
            </div>
            <ActivityFeed />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;