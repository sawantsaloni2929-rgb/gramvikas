import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'forest' | 'amber' | 'earth' | 'terracotta' | 'neutral';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'forest',
  onClick,
}) => {
  const variantStyles = {
    forest: 'bg-forest-50/70 text-forest-800 border-forest-200',
    amber: 'bg-amber-50/70 text-amber-900 border-amber-200',
    earth: 'bg-earth-100/60 text-earth-800 border-earth-300',
    terracotta: 'bg-red-50 text-red-800 border-red-200',
    neutral: 'bg-white text-slate-800 border-cream-200',
  };

  const iconBg = {
    forest: 'bg-forest-600 text-white',
    amber: 'bg-amber-600 text-white',
    earth: 'bg-earth-600 text-white',
    terracotta: 'bg-red-600 text-white',
    neutral: 'bg-slate-700 text-white',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 border transition-all duration-150 shadow-sm ${variantStyles[variant]} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.01]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-xl sm:text-2xl font-black mt-1 text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs mt-1 text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl flex-shrink-0 shadow-sm ${iconBg[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
