import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield } from 'lucide-react';
import { riskDistribution } from '../../data/mockData';
import { useTheme } from '../../contexts/ThemeContext';

const RiskDistribution = () => {
  const { t, theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="bg-primary border border-primary rounded-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4 font-mono flex items-center gap-2">
        <Shield className="w-5 h-5 accent-cyan" />
        {t.dashboard.riskDistribution}
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
              backgroundColor: isDark ? '#1f2937' : '#ffffff', 
              border: `1px solid ${isDark ? '#06b6d4' : '#0891b2'}`, 
              borderRadius: '8px', 
              fontFamily: 'monospace',
              color: isDark ? '#ffffff' : '#111827'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskDistribution;