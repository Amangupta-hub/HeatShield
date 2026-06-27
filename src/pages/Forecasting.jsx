import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';

const MODEL_COLORS = { lstm: '#ef4444', tft: '#f97316', xgboost: '#facc15', prophet: '#34d399', ensemble: '#38bdf8' };
const HORIZON_LABELS = { '1d': '1 Day', '7d': '7 Days', '30d': '30 Days', '90d': '90 Days', '1y': '1 Year' };

const TIME_SERIES = Array.from({ length: 30 }, (_, i) => {
  const base = 38 + Math.sin(i * 0.3) * 5 + Math.random() * 2;
  return {
    day: `Jul ${i + 1}`,
    actual: +(base + Math.random()).toFixed(1),
    lstm: +(base + 0.5 + Math.random() * 0.5).toFixed(1),
    tft: +(base + 0.3 + Math.random() * 0.4).toFixed(1),
    xgboost: +(base + 0.8 + Math.random() * 0.6).toFixed(1),
    ensemble: +(base + 0.2 + Math.random() * 0.3).toFixed(1),
    upper: +(base + 3).toFixed(1),
    lower: +(base - 2).toFixed(1),
  };
});

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-mono" style={{ color: p.color }}>{p.name}: {p.value}°C</p>
      ))}
    </div>
  );
};

export default function Forecasting() {
  const [forecasts, setForecasts] = useState([]);
  const [activeModel, setActiveModel] = useState('ensemble');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.HeatForecast.list().then(data => {
      setForecasts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={BarChart3} title="Heat Forecasting Engine" subtitle="Multi-model temperature prediction: LSTM, TFT, XGBoost, Prophet, Ensemble" />

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {forecasts.map(f => (
          <div key={f.id} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">{HORIZON_LABELS[f.horizon] || f.horizon} Forecast</p>
            <p className="text-2xl font-bold font-heading text-foreground">{f.predicted_temp}°C</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                {f.confidence_lower}–{f.confidence_upper}°C
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${f.heatwave_probability > 0.7 ? 'bg-red-400' : f.heatwave_probability > 0.4 ? 'bg-orange-400' : 'bg-emerald-400'}`} />
              <span className="text-[10px] text-muted-foreground">Heatwave: {(f.heatwave_probability * 100).toFixed(0)}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{f.model}</p>
          </div>
        ))}
      </div>

      {/* Multi-Model Time Series */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-heading font-semibold text-foreground">Multi-Model Temperature Forecast</h3>
            <p className="text-xs text-muted-foreground mt-0.5">30-day forecast comparison with confidence intervals</p>
          </div>
          <div className="flex gap-1">
            {Object.entries(MODEL_COLORS).map(([model, color]) => (
              <button
                key={model}
                onClick={() => setActiveModel(model)}
                className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-colors ${
                  activeModel === model ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                style={activeModel === model ? { backgroundColor: color + '20', color } : {}}
              >
                {model}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={TIME_SERIES}>
            <defs>
              <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={MODEL_COLORS[activeModel]} stopOpacity={0.15} />
                <stop offset="100%" stopColor={MODEL_COLORS[activeModel]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={35} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={45} stroke="#f87171" strokeDasharray="4 4" label={{ value: 'Heatwave Threshold', fill: '#f87171', fontSize: 10, position: 'right' }} />
            <Area type="monotone" dataKey="upper" stroke="none" fill={MODEL_COLORS[activeModel]} fillOpacity={0.08} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" />
            <Line type="monotone" dataKey="actual" stroke="#6b7280" strokeWidth={1.5} dot={false} name="Actual" strokeDasharray="3 3" />
            <Line type="monotone" dataKey={activeModel} stroke={MODEL_COLORS[activeModel]} strokeWidth={2.5} dot={false} name={activeModel.toUpperCase()} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Model Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Model Accuracy Comparison</h3>
          <div className="space-y-3">
            {[
              { model: 'LSTM', r2: 0.92, rmse: 1.45, mae: 1.12, color: '#ef4444' },
              { model: 'TFT', r2: 0.94, rmse: 1.28, mae: 0.98, color: '#f97316' },
              { model: 'XGBoost', r2: 0.91, rmse: 1.52, mae: 1.18, color: '#facc15' },
              { model: 'Prophet', r2: 0.88, rmse: 1.78, mae: 1.42, color: '#34d399' },
              { model: 'Ensemble', r2: 0.96, rmse: 1.05, mae: 0.82, color: '#38bdf8' },
            ].map(m => (
              <div key={m.model} className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-xs text-foreground w-16 font-mono">{m.model}</span>
                <div className="flex-1 grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-[10px] text-muted-foreground">R²</p><p className="text-xs font-bold font-mono">{m.r2}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">RMSE</p><p className="text-xs font-bold font-mono">{m.rmse}</p></div>
                  <div><p className="text-[10px] text-muted-foreground">MAE</p><p className="text-xs font-bold font-mono">{m.mae}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Heatwave Probability Timeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TIME_SERIES.map((d, i) => ({
              ...d,
              prob: Math.min(0.95, Math.max(0.1, 0.5 + Math.sin(i * 0.2) * 0.3 + Math.random() * 0.1)),
            }))}>
              <defs>
                <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} domain={[0, 1]} width={35} />
              <ReferenceLine y={0.7} stroke="#f87171" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="prob" stroke="#ef4444" fill="url(#probGrad)" strokeWidth={2} name="Probability" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}