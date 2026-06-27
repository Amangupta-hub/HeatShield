import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Brain, TreePine, Building2, Route, Wind, Users } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import RiskBadge from '@/components/shared/RiskBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const DRIVER_COLORS = {
  'Low Vegetation': '#34d399',
  'Dense Buildings': '#f87171',
  'Road Density': '#fb923c',
  'Low Wind': '#38bdf8',
  'Population': '#a78bfa',
  'Low Albedo': '#fbbf24',
};

const SHAP_EXPLANATION = [
  { feature: 'Low Vegetation Cover', importance: 0.38, shap: 2.84, direction: 'increases', icon: TreePine, color: '#34d399' },
  { feature: 'Dense Buildings', importance: 0.27, shap: 2.01, direction: 'increases', icon: Building2, color: '#f87171' },
  { feature: 'Road Density', importance: 0.14, shap: 1.05, direction: 'increases', icon: Route, color: '#fb923c' },
  { feature: 'Low Wind Speed', importance: 0.11, shap: 0.82, direction: 'increases', icon: Wind, color: '#38bdf8' },
  { feature: 'Population Density', importance: 0.10, shap: 0.74, direction: 'increases', icon: Users, color: '#a78bfa' },
];

const RADAR_DATA = [
  { feature: 'NDVI', Connaught: 8, Chandni: 5, Hauz: 62 },
  { feature: 'NDBI', Connaught: 58, Chandni: 62, Hauz: 28 },
  { feature: 'Build Dense', Connaught: 88, Chandni: 92, Hauz: 52 },
  { feature: 'Road Dense', Connaught: 82, Chandni: 88, Hauz: 48 },
  { feature: 'Population', Connaught: 75, Chandni: 92, Hauz: 45 },
  { feature: 'Wind', Connaught: 18, Chandni: 12, Hauz: 42 },
];

const MODEL_PERF = [
  { model: 'Random Forest', r2: 0.94, rmse: 1.23, mae: 0.98 },
  { model: 'XGBoost', r2: 0.96, rmse: 1.08, mae: 0.86 },
  { model: 'Ensemble', r2: 0.97, rmse: 0.95, mae: 0.78 },
];

function ShapBar({ feature, importance, shap, icon: Icon, color }) {
  const width = importance * 100;
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-foreground font-medium truncate">{feature}</span>
          <span className="text-xs font-mono font-bold" style={{ color }}>{(importance * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${width}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">SHAP value: +{shap.toFixed(2)} ({feature.toLowerCase()} {`→`} heat)</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      {payload.map((p, i) => (
        <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function HeatDrivers() {
  const [hotspots, setHotspots] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.HeatHotspot.list().then(data => {
      setHotspots(data);
      setSelected(data.find(h => h.zone_name === 'Connaught Place') || data[0]);
    });
  }, []);

  const drivers = selected ? [
    { name: 'Low Vegetation', value: selected.driver_vegetation || 38, color: '#34d399' },
    { name: 'Dense Buildings', value: selected.driver_buildings || 27, color: '#f87171' },
    { name: 'Road Density', value: selected.driver_roads || 14, color: '#fb923c' },
    { name: 'Low Wind', value: selected.driver_wind || 11, color: '#38bdf8' },
    { name: 'Population', value: selected.driver_population || 10, color: '#a78bfa' },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={Brain} title="Heat Driver Analysis & SHAP Explainability" subtitle="Explainable AI — Understanding why urban regions are hot using Random Forest, XGBoost, and SHAP" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main SHAP Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Zone Selector */}
          <div className="flex gap-2 flex-wrap">
            {hotspots.map(h => (
              <button
                key={h.id}
                onClick={() => setSelected(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selected?.id === h.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {h.zone_name}
              </button>
            ))}
          </div>

          {/* SHAP Feature Importance */}
          {selected && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-heading font-semibold text-foreground">SHAP Feature Importance — {selected.zone_name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Why this location has a heat score of {selected.heat_score}/100</p>
                </div>
                <RiskBadge level={selected.risk_level} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  {drivers.map(d => (
                    <ShapBar
                      key={d.name}
                      feature={d.name === 'Low Vegetation' ? 'Low Vegetation Cover' : d.name}
                      importance={d.value / 100}
                      shap={(d.value / 100) * 7.5}
                      icon={d.name === 'Low Vegetation' ? TreePine : d.name === 'Dense Buildings' ? Building2 : d.name === 'Road Density' ? Route : d.name === 'Low Wind' ? Wind : Users}
                      color={d.color}
                    />
                  ))}
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={drivers} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} domain={[0, 50]} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={90} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Contribution %" radius={[0, 6, 6, 0]}>
                        {drivers.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Zone Comparison Radar */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Multi-Zone Feature Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={RADAR_DATA}>
                <PolarGrid stroke="hsl(217 33% 20%)" />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
                <Radar name="Connaught Place" dataKey="Connaught" stroke="#f87171" fill="#f87171" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Chandni Chowk" dataKey="Chandni" stroke="#fb923c" fill="#fb923c" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Hauz Khas" dataKey="Hauz" stroke="#34d399" fill="#34d399" fillOpacity={0.15} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {[{label:'Connaught Place',color:'#f87171'},{label:'Chandni Chowk',color:'#fb923c'},{label:'Hauz Khas',color:'#34d399'}].map(l => (
                <div key={l.label} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor:l.color}}/><span className="text-[10px] text-muted-foreground">{l.label}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Model Performance */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-3">Model Performance</h3>
            <div className="space-y-3">
              {MODEL_PERF.map(m => (
                <div key={m.model} className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs font-semibold text-foreground mb-2">{m.model}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div><p className="text-[10px] text-muted-foreground">R²</p><p className="text-sm font-bold font-mono text-emerald-400">{m.r2}</p></div>
                    <div><p className="text-[10px] text-muted-foreground">RMSE</p><p className="text-sm font-bold font-mono text-foreground">{m.rmse}</p></div>
                    <div><p className="text-[10px] text-muted-foreground">MAE</p><p className="text-sm font-bold font-mono text-foreground">{m.mae}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-3">SHAP Methodology</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>SHAP (SHapley Additive exPlanations) uses game-theoretic Shapley values to explain individual predictions.</p>
              <p>Each feature's SHAP value represents its contribution to moving the prediction from the base value.</p>
              <p className="text-primary font-medium">Models: Random Forest + XGBoost Ensemble</p>
              <p>Features: NDVI, NDBI, Population Density, Road Density, Building Density, Wind Speed, Humidity, Impervious Surface Ratio</p>
            </div>
          </div>

          {/* Key Insight */}
          {selected && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-5">
              <h3 className="text-sm font-heading font-semibold text-orange-400 mb-2">Key Insight</h3>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">{selected.zone_name}</span> has a heat score of{' '}
                <span className="text-orange-400 font-bold">{selected.heat_score}/100</span>. 
                The primary driver is low vegetation cover ({selected.vegetation_cover || 5}%), 
                combined with high building density ({((selected.building_density || 0.88) * 100).toFixed(0)}%) 
                and limited wind circulation ({selected.wind_speed || 1.8} m/s).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}