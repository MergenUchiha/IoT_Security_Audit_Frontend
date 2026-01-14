import { useNavigate } from 'react-router-dom';
import { Server, Wifi, AlertTriangle, Activity } from 'lucide-react';
import { DashboardStats } from '../../types';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

export default function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        onClick={() => navigate('/devices')}
        className="bg-gray-800 border border-gray-700 hover:border-cyan-500 rounded-lg p-6 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400 text-sm font-medium">Total Devices</div>
          <Server className="w-8 h-8 text-cyan-500" />
        </div>
        <div className="text-3xl font-bold text-white">{stats.totalDevices}</div>
        <div className="text-sm text-gray-500 mt-1">
          {stats.onlineDevices} online
        </div>
      </div>

      <div 
        onClick={() => navigate('/devices')}
        className="bg-gray-800 border border-gray-700 hover:border-green-500 rounded-lg p-6 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400 text-sm font-medium">Online Devices</div>
          <Wifi className="w-8 h-8 text-green-500" />
        </div>
        <div className="text-3xl font-bold text-white">{stats.onlineDevices}</div>
        <div className="text-sm text-gray-500 mt-1">
          {stats.totalDevices > 0 ? Math.round((stats.onlineDevices / stats.totalDevices) * 100) : 0}% uptime
        </div>
      </div>

      <div 
        onClick={() => navigate('/vulnerabilities')}
        className="bg-gray-800 border border-gray-700 hover:border-red-500 rounded-lg p-6 cursor-pointer transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400 text-sm font-medium">Critical Issues</div>
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-3xl font-bold text-red-500">{stats.criticalVulnerabilities}</div>
        <div className="text-sm text-gray-500 mt-1">
          Requires immediate attention
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-gray-400 text-sm font-medium">Active Scans</div>
          <Activity className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <div className="text-3xl font-bold text-white">{stats.activeScans}</div>
        <div className="text-sm text-gray-500 mt-1">
          Currently running
        </div>
      </div>
    </div>
  );
}
