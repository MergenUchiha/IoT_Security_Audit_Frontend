import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle } from 'lucide-react';
import { complianceData } from '../../data/mockData';

const ComplianceScore = () => {
  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6">
      <h3 className="text-lg font-bold text-white mb-4 font-mono flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-cyan-400" />
        COMPLIANCE SCORE
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={complianceData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="subject" 
            stroke="#9ca3af" 
            style={{ fontSize: '12px', fontFamily: 'monospace' }} 
          />
          <PolarRadiusAxis 
            stroke="#9ca3af" 
            style={{ fontSize: '12px', fontFamily: 'monospace' }} 
          />
          <Radar 
            name="Score" 
            dataKey="score" 
            stroke="#06b6d4" 
            fill="#06b6d4" 
            fillOpacity={0.6} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #06b6d4', 
              borderRadius: '8px', 
              fontFamily: 'monospace' 
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComplianceScore;