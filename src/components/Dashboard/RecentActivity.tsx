import { Activity, Shield, Server, AlertTriangle } from 'lucide-react';
import { DashboardStats } from '../../pages/Dashboard';

interface RecentActivityProps {
  activities: DashboardStats['recentActivity'];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vulnerability': return AlertTriangle;
      case 'scan': return Activity;
      case 'device': return Server;
      default: return Shield;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-500" />
        Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No recent activity
          </div>
        ) : (
          activities.map(activity => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Icon className={`w-5 h-5 mt-0.5 ${getSeverityColor(activity.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{activity.message}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
