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
    <div className="bg-[#0f1929] border border-[#1a2a3a] rounded-xl p-6 hover:border-[#00d4c8]/30 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#00d4c8]/10 flex items-center justify-center text-[#00d4c8]">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-[#556677] text-xs uppercase tracking-wide">{label}</div>
    </div>
  );
};

export default StatsCard;
