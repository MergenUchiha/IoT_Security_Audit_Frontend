import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  trend?: number;
  color: string;
}

const StatsCard = ({ icon: Icon, label, value, trend, color }: StatsCardProps) => {
  return (
    <div className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-mono uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white mt-2 font-mono">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-red-400 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-400 mr-1" />
              )}
              <span className={trend > 0 ? 'text-red-400' : 'text-green-400'}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;