import React, { useState, useMemo } from 'react';
import { Sliders, Thermometer, Leaf, Zap, DollarSign, TrendingDown } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Slider } from '@/components/ui/slider';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const INTERVENTIONS = [
  { key: 'tree_cover', label: 'Tree Cover Increase', unit: '%', max: 50, default: 0, cooling_factor: 0.12, cost_per_unit: 2.4, carbon_factor: 0.8, icon: '🌳' },
  { key: 'urban_forests', label: 'Urban Forests', unit: 'ha', max: 200, default: 0, cooling_factor: 0.08, cost_per_unit: 5.2, carbon_factor: 1.2, icon: '🌲' },
  { key: 'green_roofs', label: 'Green Roofs', unit: '%', max: 60, default: 0, cooling_factor: 0.06, cost_per_unit: 8.5, carbon_factor: 0.4, icon: '🏢' },
  { key: 'cool_roofs', label: 'Cool Roofs (High Albedo)', unit: '%', max: 80, default: 0, cooling_factor: 0.05, cost_per_unit: 3.2, carbon_factor: 0.2, icon: '🏠' },
  { key: 'reflective_pavements', label: 'Reflective Pavements', unit: '%', max: 50, default: 0, cooling_factor: 0.04, cost_per_unit: 6.8, carbon_factor: 0.3, icon: '🛤️' },
  { key: 'water_bodies', label: 'Water Bodies', unit: 'ha', max: 100, default: 0, cooling_factor: 0.09, cost_per_unit: 12.0, carbon_factor: 0.5, icon: '💧' },
  { key: 'urban_parks', label: 'Urban Parks', unit: 'ha', max: 150, default: 0, cooling_factor: 0.07, cost_per_unit: 4.8, carbon_factor: 0.9, icon: '🌿' },
  { key: 'green_corridors', label: 'Green Corridors', unit: 'km', max: 50, default: 0, cooling_factor: 0.05, cost_per_unit: 7.2, carbon_factor: 0.6, icon: '🛣️' },
];

const BASELINE = { temp: 42.3, heat_index: 48.6, energy_baseline: 100 };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-foreground">{payload[0]?.payload?.label || payload[0]?.name}</p>
      <p className="text-xs font-mono" style={{ color: payload[0]?.color }}>{payload[0]?.value?.toFixed(2)}°C reduction</p>
    </div>
  );
};

export default function CoolingSimulator() {
  const [values, setValues] = useState(
    Object.fromEntries(INTERVENTIONS.map(i => [i.key, i.default]))
  );

  const results = useMemo(() => {
    let totalCooling = 0;
    let totalCost = 0;
    let totalCarbon = 0;
    const breakdown = [];

    INTERVENTIONS.forEach(int => {
      const val = values[int.key];
      const cooling = val * int.cooling_factor;
      const cost = val * int.cost_per_unit;
      const carbon = val * int.carbon_factor;
      totalCooling += cooling;
      totalCost += cost;
      totalCarbon += carbon;
      if (val > 0) {
        breakdown.push({ label: int.label, cooling, cost, carbon, icon: int.icon, value: val });
      }
    });

    const newTemp = Math.max(25, BASELINE.temp - totalCooling);
    const newHeatIndex = Math.max(28, BASELINE.heat_index - totalCooling * 1.15);
    const energySavings = Math.min(45, totalCooling * 3.2);
    const efficiency = totalCost > 0 ? (totalCooling / totalCost * 100) : 0;

    return { totalCooling, totalCost, totalCarbon, newTemp, newHeatIndex, energySavings, efficiency, breakdown };
  }, [values]);

  const radarData = INTERVENTIONS.filter(i => values[i.key] > 0).map(i => ({
    name: i.label.split(' ').slice(0, 2).join(' '),
    value: values[i.key],
    max: i.max,
    pct: (values[i.key] / i.max) * 100,
  }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={Sliders} title="Cooling Intervention Simulator" subtitle="Adjust parameters to simulate temperature reduction from various urban cooling strategies" />

      {/* Impact Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <TrendingDown className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-2xl font-bold font-heading text-emerald-400">-{results.totalCooling.toFixed(1)}°C</p>
          <p className="text-[10px] text-muted-foreground">Temp Reduction</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Thermometer className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-2xl font-bold font-heading text-foreground">{results.newTemp.toFixed(1)}°C</p>
          <p className="text-[10px] text-muted-foreground">New LST</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold font-heading text-foreground">{results.energySavings.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Energy Savings</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <Leaf className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-2xl font-bold font-heading text-foreground">{results.totalCarbon.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">Carbon Reduction (t)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <DollarSign className="w-5 h-5 text-sky-400 mx-auto mb-1" />
          <p className="text-2xl font-bold font-heading text-foreground">₹{results.totalCost.toFixed(0)}Cr</p>
          <p className="text-[10px] text-muted-foreground">Est. Cost</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intervention Sliders */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Intervention Parameters</h3>
          <div className="space-y-5">
            {INTERVENTIONS.map(int => (
              <div key={int.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{int.icon}</span>
                    <span className="text-xs text-foreground font-medium">{int.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-primary">{values[int.key]}</span>
                    <span className="text-xs text-muted-foreground">{int.unit}</span>
                    {values[int.key] > 0 && (
                      <span className="text-[10px] text-emerald-400 font-mono">-{(values[int.key] * int.cooling_factor).toFixed(2)}°C</span>
                    )}
                  </div>
                </div>
                <Slider
                  value={[values[int.key]]}
                  onValueChange={([v]) => setValues(prev => ({ ...prev, [int.key]: v }))}
                  min={0}
                  max={int.max}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {/* Cooling Breakdown */}
          {results.breakdown.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs font-heading font-semibold text-foreground mb-3">Cooling Breakdown</h4>
              <ResponsiveContainer width="100%" height={Math.max(120, results.breakdown.length * 35)}>
                <BarChart data={results.breakdown} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cooling" radius={[0, 4, 4, 0]}>
                    {results.breakdown.map((_, i) => (
                      <Cell key={i} fill={['#34d399', '#22c55e', '#38bdf8', '#818cf8', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'][i % 8]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Before/After */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs font-heading font-semibold text-foreground mb-3">Before → After</h4>
            <div className="space-y-3">
              {[
                { label: 'Temperature', before: BASELINE.temp, after: results.newTemp, unit: '°C' },
                { label: 'Heat Index', before: BASELINE.heat_index, after: results.newHeatIndex, unit: '°C' },
                { label: 'Energy Use', before: 100, after: 100 - results.energySavings, unit: '%' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      -{(item.before - item.after).toFixed(1)}{item.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-red-400 w-14">{item.before.toFixed(1)}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-secondary relative">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500 to-emerald-500"
                        style={{ width: `${100 - ((item.after / item.before) * 100 - ((100 - (item.after / item.before) * 100)))}%` }} />
                    </div>
                    <span className="text-xs font-mono text-emerald-400 w-14 text-right">{item.after.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground">Cooling Efficiency Index</p>
            <p className="text-xl font-bold font-heading text-primary">{results.efficiency.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">°C reduction per ₹Cr invested</p>
          </div>
        </div>
      </div>
    </div>
  );
}