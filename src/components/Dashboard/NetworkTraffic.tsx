import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Radio } from 'lucide-react';
import { analyticsApi } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

const NetworkTraffic = () => {
  const { t, theme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const response = await analyticsApi.getTraffic();
        const trafficData = response.data.map((item: any) => ({
          time: item.period || new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          incoming: item.incoming,
          outgoing: item.outgoing,
          suspicious: item.suspicious,
        }));
        setData(trafficData);
      } catch (error) {
        console.error('Failed to fetch traffic:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTraffic();
  }, []);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#374151' : '#d1d5db';
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  if (loading) {
    return (
      <div className="bg-primary border border-primary rounded-lg p-6">
        <h3 className="text-lg font-bold text-primary mb-4 font-mono flex items-center gap-2">
          <Radio className="w-5 h-5 accent-cyan" />
          {t.dashboard.networkTraffic}
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="accent-cyan font-mono">{t.common.loading}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary border border-primary rounded-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4 font-mono flex items-center gap-2">
        <Radio className="w-5 h-5 accent-cyan" />
        {t.dashboard.networkTraffic}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="time" 
            stroke={textColor}
            style={{ fontSize: '12px', fontFamily: 'monospace' }} 
          />
          <YAxis 
            stroke={textColor}
            style={{ fontSize: '12px', fontFamily: 'monospace' }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff', 
              border: `1px solid ${isDark ? '#06b6d4' : '#0891b2'}`, 
              borderRadius: '8px', 
              fontFamily: 'monospace',
              color: isDark ? '#ffffff' : '#111827'
            }}
            labelStyle={{ color: isDark ? '#06b6d4' : '#0891b2' }}
          />
          <Legend 
            wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px', color: textColor }} 
          />
          <Bar dataKey="incoming" fill="#06b6d4" name={t.chart.incoming} />
          <Bar dataKey="outgoing" fill="#10b981" name={t.chart.outgoing} />
          <Bar dataKey="suspicious" fill="#ef4444" name={t.chart.suspicious} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetworkTraffic;