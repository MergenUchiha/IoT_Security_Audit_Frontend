import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Radio } from 'lucide-react';
import { analyticsApi } from '../../services/api';

const NetworkTraffic = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const response = await analyticsApi.getTraffic();
        // Transform data to match chart format
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

  if (loading) {
    return (
      <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
          <Radio className="w-5 h-5 text-cyan-400" />
          NETWORK TRAFFIC ANALYSIS
        </h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-cyan-400 font-mono">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
        <Radio className="w-5 h-5 text-cyan-400" />
        NETWORK TRAFFIC ANALYSIS
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            style={{ fontSize: '12px', fontFamily: 'monospace' }} 
          />
          <YAxis 
            stroke="#9ca3af" 
            style={{ fontSize: '12px', fontFamily: 'monospace' }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #06b6d4', 
              borderRadius: '8px', 
              fontFamily: 'monospace' 
            }}
            labelStyle={{ color: '#06b6d4' }}
          />
          <Legend 
            wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} 
          />
          <Bar dataKey="incoming" fill="#06b6d4" />
          <Bar dataKey="outgoing" fill="#10b981" />
          <Bar dataKey="suspicious" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NetworkTraffic;