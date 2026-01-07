import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield } from 'lucide-react';
import { riskDistribution } from '../../data/mockData';

const RiskDistribution = () => {
  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
        <Shield className="w-5 h-5 text-cyan-400" />
        RISK DISTRIBUTION
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={riskDistribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {riskDistribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #06b6d4', 
              borderRadius: '8px', 
              fontFamily: 'monospace' 
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistribution;