export const RISK_COLORS = {
  low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#34d399' },
  moderate: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', hex: '#facc15' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', hex: '#fb923c' },
  extreme: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', hex: '#f87171' },
};

export const ALERT_COLORS = {
  green: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/40', hex: '#34d399', label: 'Normal' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/40', hex: '#facc15', label: 'Watch' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/40', hex: '#fb923c', label: 'Advisory' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40', hex: '#f87171', label: 'Warning' },
};

export const HEAT_GRADIENT = [
  { temp: 25, color: '#3b82f6' },
  { temp: 30, color: '#22c55e' },
  { temp: 35, color: '#eab308' },
  { temp: 40, color: '#f97316' },
  { temp: 45, color: '#ef4444' },
  { temp: 50, color: '#dc2626' },
  { temp: 55, color: '#7f1d1d' },
];

export function getTempColor(temp) {
  if (temp <= 25) return '#3b82f6';
  if (temp <= 30) return '#22c55e';
  if (temp <= 35) return '#eab308';
  if (temp <= 40) return '#f97316';
  if (temp <= 45) return '#ef4444';
  if (temp <= 50) return '#dc2626';
  return '#7f1d1d';
}

export function getRiskLabel(score) {
  if (score <= 30) return 'low';
  if (score <= 55) return 'moderate';
  if (score <= 80) return 'high';
  return 'extreme';
}

export function formatNumber(num) {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(1) + ' L';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num?.toString() || '0';
}