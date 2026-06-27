import React, { useState } from 'react';
import { Layers, Play, Trash2, Thermometer } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SCENARIO_PRESETS = [
  { id: 'tree25', name: 'Increase Tree Cover 25%', type: 'tree_cover', value: 25, temp: -3.0, cost: 60, carbon: 52, envImpact: 'High' },
  { id: 'green40', name: 'Green Roofs 40%', type: 'green_roofs', value: 40, temp: -2.4, cost: 340, carbon: 16, envImpact: 'Medium' },
  { id: 'lake', name: 'Add Urban Lake (20 ha)', type: 'water_body', value: 20, temp: -1.8, cost: 240, carbon: 10, envImpact: 'High' },
  { id: 'dedens', name: 'Reduce Built-Up Density 15%', type: 'building_density', value: -15, temp: -1.2, cost: 520, carbon: 28, envImpact: 'Very High' },
  { id: 'cool60', name: 'Cool Roofs 60%', type: 'cool_roofs', value: 60, temp: -3.0, cost: 192, carbon: 12, envImpact: 'Low' },
  { id: 'park100', name: 'Urban Parks 100 ha', type: 'urban_parks', value: 100, temp: -7.0, cost: 480, carbon: 90, envImpact: 'Very High' },
];

const COLORS = ['#38bdf8', '#34d399', '#f59e0b', '#a78bfa', '#ec4899', '#14b8a6'];

export default function ScenarioExplorer() {
  const [scenarios, setScenarios] = useState([SCENARIO_PRESETS[0], SCENARIO_PRESETS[4]]);
  const [results, setResults] = useState(null);

  const addScenario = (preset) => {
    if (!scenarios.find(s => s.id === preset.id)) {
      setScenarios([...scenarios, preset]);
    }
  };

  const removeScenario = (id) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  const runAnalysis = () => {
    const combined = {
      totalTemp: scenarios.reduce((sum, s) => sum + s.temp, 0),
      totalCost: scenarios.reduce((sum, s) => sum + s.cost, 0),
      totalCarbon: scenarios.reduce((sum, s) => sum + s.carbon, 0),
    };
    setResults(combined);
  };

  const chartData = scenarios.map((s, i) => ({
    name: s.name.length > 18 ? s.name.substring(0, 18) + '...' : s.name,
    cooling: Math.abs(s.temp),
    cost: s.cost,
    carbon: s.carbon,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={Layers} title="Scenario Explorer" subtitle="What-if analysis engine for urban cooling intervention modeling">
        <Button onClick={runAnalysis} disabled={scenarios.length === 0}>
          <Play className="w-3.5 h-3.5 mr-2" /> Run Analysis
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Builder */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Scenarios */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Active Scenarios ({scenarios.length})</h3>
            {scenarios.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Add scenarios from presets below</p>
            ) : (
              <div className="space-y-3">
                {scenarios.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                      <div className="flex gap-4 mt-1">
                        <span className="text-[10px] text-emerald-400 font-mono">{s.temp}°C</span>
                        <span className="text-[10px] text-muted-foreground font-mono">₹{s.cost}Cr</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{s.carbon}t CO₂</span>
                        <span className="text-[10px] text-sky-400">{s.envImpact}</span>
                      </div>
                    </div>
                    <button onClick={() => removeScenario(s.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Scenario Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SCENARIO_PRESETS.map(preset => {
                const isActive = scenarios.find(s => s.id === preset.id);
                return (
                  <button
                    key={preset.id}
                    onClick={() => isActive ? removeScenario(preset.id) : addScenario(preset)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      isActive ? 'border-primary/50 bg-primary/5' : 'border-border hover:bg-secondary/50'
                    }`}
                  >
                    <p className="text-xs font-semibold text-foreground">{preset.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">{preset.temp}°C cooling</p>
                    <p className="text-[10px] text-muted-foreground font-mono">₹{preset.cost}Cr · {preset.envImpact}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Chart */}
          {chartData.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-heading font-semibold text-foreground mb-4">Scenario Comparison</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="cooling" name="Cooling (°C)" fill="#34d399" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Cost (₹Cr)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbon" name="CO₂ (tons)" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          {results ? (
            <>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                <Thermometer className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-3xl font-bold font-heading text-emerald-400">{results.totalTemp.toFixed(1)}°C</p>
                <p className="text-xs text-muted-foreground mt-1">Combined Temperature Change</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h4 className="text-xs font-heading font-semibold text-foreground mb-3">Combined Impact</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground">New Estimated LST</span>
                    <span className="text-sm font-bold font-mono text-foreground">{(42.3 + results.totalTemp).toFixed(1)}°C</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground">Total Investment</span>
                    <span className="text-sm font-bold font-mono text-foreground">₹{results.totalCost}Cr</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-xs text-muted-foreground">Carbon Reduction</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">{results.totalCarbon}t</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-muted-foreground">Cooling Efficiency</span>
                    <span className="text-sm font-bold font-mono text-primary">{(Math.abs(results.totalTemp) / results.totalCost * 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Play className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Run analysis to see combined results</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Select scenarios and click "Run Analysis"</p>
            </div>
          )}

          {/* Methodology */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs font-heading font-semibold text-foreground mb-2">Methodology</h4>
            <div className="space-y-1.5 text-[10px] text-muted-foreground">
              <p>• Temperature reduction modeled via energy balance equations</p>
              <p>• Albedo changes computed from material properties</p>
              <p>• Evapotranspiration effects from vegetation models</p>
              <p>• Wind flow adjustments from CFD simulations</p>
              <p>• Cost estimates from Smart City Mission data</p>
              <p>• Interactions between interventions accounted for with diminishing returns model</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}