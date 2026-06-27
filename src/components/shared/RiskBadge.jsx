import React from 'react';
import { RISK_COLORS } from '@/lib/heatUtils';

export default function RiskBadge({ level }) {
  const style = RISK_COLORS[level] || RISK_COLORS.moderate;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>
      {level?.charAt(0).toUpperCase() + level?.slice(1)}
    </span>
  );
}