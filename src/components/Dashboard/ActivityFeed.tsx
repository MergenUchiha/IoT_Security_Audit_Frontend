import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { analyticsApi } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import type { ActivityType } from '../../types';

const ActivityFeed = () => {
  const { t } = useTheme();
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
        return <Activity className="w-4 h-4 accent-cyan" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4 accent-red" />;
      case 'update':
        return <CheckCircle className="w-4 h-4 accent-green" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'accent-red bg-red-500/10 border-red-500/30';
      case 'high':
        return 'accent-orange bg-orange-500/10 border-orange-500/30';
      case 'medium':
        return 'accent-yellow bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'accent-cyan bg-cyan-500/10 border-cyan-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-primary border border-primary rounded-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-mono flex items-center gap-2">
          <Activity className="w-5 h-5 accent-cyan" />
          {t.dashboard.activityFeed}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="accent-cyan font-mono">{t.common.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary border border-primary rounded-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4 font-mono flex items-center gap-2">
        <Activity className="w-5 h-5 accent-cyan" />
        {t.dashboard.activityFeed}
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
                <p className="text-primary text-sm font-medium">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-tertiary font-mono">{activity.device}</span>
                  <span className="text-quaternary">•</span>
                  <span className="text-quaternary font-mono">{activity.timestamp}</span>
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