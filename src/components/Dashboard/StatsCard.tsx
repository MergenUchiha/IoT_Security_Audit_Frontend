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
    <div 
      className="bg-primary border border-primary rounded-lg p-6 transition-all card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-tertiary text-sm font-mono uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-primary mt-2 font-mono">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 accent-red mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 accent-green mr-1" />
              )}
              <span className={trend > 0 ? 'accent-red' : 'accent-green'}>
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