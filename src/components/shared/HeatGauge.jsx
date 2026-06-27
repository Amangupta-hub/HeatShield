import React from 'react';

export default function HeatGauge({ value, max = 100, label, size = 'md' }) {
  const pct = Math.min((value / max) * 100, 100);
  const radius = size === 'lg' ? 60 : 44;
  const stroke = size === 'lg' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference * 0.75;
  const svgSize = (radius + stroke) * 2;

  const getColor = () => {
    if (pct <= 30) return '#34d399';
    if (pct <= 55) return '#facc15';
    if (pct <= 80) return '#fb923c';
    return '#f87171';
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={svgSize} height={svgSize * 0.65} viewBox={`0 0 ${svgSize} ${svgSize * 0.75}`}>
        <circle
          cx={svgSize / 2} cy={svgSize / 2}
          r={radius} fill="none"
          stroke="hsl(217 33% 17%)" strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform={`rotate(135 ${svgSize / 2} ${svgSize / 2})`}
        />
        <circle
          cx={svgSize / 2} cy={svgSize / 2}
          r={radius} fill="none"
          stroke={getColor()} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(135 ${svgSize / 2} ${svgSize / 2})`}
          className="transition-all duration-1000 ease-out"
        />
        <text
          x={svgSize / 2} y={svgSize / 2 - 4}
          textAnchor="middle" fill="currentColor"
          className="text-foreground font-heading font-bold"
          fontSize={size === 'lg' ? 24 : 18}
        >
          {value}
        </text>
        <text
          x={svgSize / 2} y={svgSize / 2 + 14}
          textAnchor="middle" fill="currentColor"
          className="text-muted-foreground"
          fontSize={10}
        >
          / {max}
        </text>
      </svg>
      {label && <p className="text-xs text-muted-foreground mt-1">{label}</p>}
    </div>
  );
}