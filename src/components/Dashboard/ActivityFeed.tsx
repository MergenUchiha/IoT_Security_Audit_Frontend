import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { analyticsApi } from '../../services/api';
import type { ActivityType } from '../../types';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await analyticsApi.getActivity();
        setActivities(response.data || []);
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'scan':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'update':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          ACTIVITY FEED
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-cyan-400 font-mono">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
        <Activity className="w-5 h-5 text-cyan-400" />
        ACTIVITY FEED
      </h3>
      <div className="space-y-3">
        {activities.map((activity: any) => (
          <div 
            key={activity.id} 
            className={`border rounded p-3 ${getSeverityColor(activity.severity)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-gray-400 font-mono">{activity.device}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-500 font-mono">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;