import React from 'react';

export default function MetricCard({ icon: Icon, label, value, unit, trend, trendLabel, color = 'primary', className = '' }) {
  const colorMap = {
    primary: 'from-sky-500/20 to-sky-600/5 border-sky-500/20',
    danger: 'from-red-500/20 to-red-600/5 border-red-500/20',
    warning: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
    success: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  };

  const iconColorMap = {
    primary: 'text-sky-400',
    danger: 'text-red-400',
    warning: 'text-orange-400',
    success: 'text-emerald-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${colorMap[color]} p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-heading text-foreground">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {trendLabel && (
            <p className={`text-xs ${trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-background/40 ${iconColorMap[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}