import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  explanation?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  explanation,
  badge,
  icon
}) => {
  return (
    <div className="card-panel p-5 flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <div className="text-2xl font-bold text-slate-100 tracking-tight">{value}</div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || badge || explanation) && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-1">
          {badge && <div className="mb-1">{badge}</div>}
          {subtitle && <p className="text-xs text-slate-300 font-medium">{subtitle}</p>}
          {explanation && <p className="text-[11px] text-slate-400 leading-normal">{explanation}</p>}
        </div>
      )}
    </div>
  );
};
