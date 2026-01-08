import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle } from 'lucide-react';
import { complianceData } from '../../data/mockData';
import { useTheme } from '../../contexts/ThemeContext';

const ComplianceScore = () => {
  const { t, theme } = useTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#374151' : '#d1d5db';
  const textColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <div className="bg-primary border border-primary rounded-lg p-6">
      <h3 className="text-lg font-bold text-primary mb-4 font-mono flex items-center gap-2">
        <CheckCircle className="w-5 h-5 accent-cyan" />
        {t.dashboard.complianceScore}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={complianceData}>
          <PolarGrid stroke={gridColor} />
          <PolarAngleAxis 
            dataKey="subject" 
            stroke={textColor}
            style={{ fontSize: '12px', fontFamily: 'monospace' }} 
          />
          <PolarRadiusAxis 
            stroke={textColor}
            style={{ fontSize: '12px', fontFamily: 'monospace' }} 
          />
          <Radar 
            name={t.chart.score}
            dataKey="score" 
            stroke={isDark ? '#06b6d4' : '#0891b2'}
            fill={isDark ? '#06b6d4' : '#0891b2'}
            fillOpacity={0.6} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff', 
              border: `1px solid ${isDark ? '#06b6d4' : '#0891b2'}`, 
              borderRadius: '8px', 
              fontFamily: 'monospace',
              color: isDark ? '#ffffff' : '#111827'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplianceScore;