import React from 'react';

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, value, label, trend, trendUp }) => {
  return (
    <div className="bg-bv-surface border border-bv-border rounded-2xl p-5 hover:border-bv-accent/20 transition-all duration-150">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-bv-accent-muted flex items-center justify-center text-bv-accent">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trendUp ? '+' : '-'}{trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-bv-ink mb-0.5 tracking-tight">{value}</div>
      <div className="text-bv-ink-muted text-xs font-medium">{label}</div>
    </div>
  );
};

export default StatsCard;
