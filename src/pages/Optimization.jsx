import React, { useState } from 'react';
import { Cpu, Zap, Target, TrendingDown, DollarSign, Leaf, Trophy } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

const OPTIMIZED_STRATEGIES = [
  {
    rank: 1, name: 'Maximum Cooling Strategy',
    objective: 'Maximum Temperature Reduction',
    temp_reduction: 5.8, cost: 342, carbon: 186, efficiency: 1.7,
    interventions: { tree_cover: 35, green_roofs: 40, cool_roofs: 60, water_bodies: 45, urban_parks: 80, green_corridors: 25 },
    score: 96
  },
  {
    rank: 2, name: 'Cost-Optimized Strategy',
    objective: 'Minimum Cost with 3°C+ Reduction',
    temp_reduction: 3.4, cost: 128, carbon: 94, efficiency: 2.66,
    interventions: { tree_cover: 25, cool_roofs: 50, urban_parks: 40, reflective_pavements: 20 },
    score: 91
  },
  {
    rank: 3, name: 'Balanced Green Strategy',
    objective: 'Maximum Sustainability',
    temp_reduction: 4.6, cost: 256, carbon: 248, efficiency: 1.8,
    interventions: { tree_cover: 40, urban_forests: 80, green_roofs: 30, urban_parks: 100, green_corridors: 35, water_bodies: 30 },
    score: 89
  },
  {
    rank: 4, name: 'Quick Wins Strategy',
    objective: 'Fast Implementation',
    temp_reduction: 2.8, cost: 96, carbon: 62, efficiency: 2.92,
    interventions: { cool_roofs: 70, reflective_pavements: 35, tree_cover: 15 },
    score: 84
  },
];

const PARETO_DATA = OPTIMIZED_STRATEGIES.map(s => ({
  name: s.name.split(' ')[0],
  cooling: s.temp_reduction,
  cost: s.cost,
}));

function StrategyCard({ strategy, isSelected, onSelect }) {
  const medals = ['🥇', '🥈', '🥉', '4️⃣'];
  const interventionLabels = {
    tree_cover: 'Tree Cover', green_roofs: 'Green Roofs', cool_roofs: 'Cool Roofs',
    water_bodies: 'Water Bodies', urban_parks: 'Urban Parks', green_corridors: 'Green Corridors',
    reflective_pavements: 'Reflective Pavements', urban_forests: 'Urban Forests',
  };

  return (
    <button
      onClick={() => onSelect(strategy)}
      className={`w-full text-left rounded-xl border p-5 transition-all ${
        isSelected ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{medals[strategy.rank - 1]}</span>
          <div>
            <h4 className="text-sm font-heading font-semibold text-foreground">{strategy.name}</h4>
            <p className="text-xs text-muted-foreground">{strategy.objective}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold font-heading text-emerald-400">-{strategy.temp_reduction}°C</p>
          <p className="text-[10px] text-muted-foreground">Score: {strategy.score}/100</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="px-3 py-2 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs font-bold font-mono text-foreground">₹{strategy.cost}Cr</p>
          <p className="text-[10px] text-muted-foreground">Cost</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs font-bold font-mono text-foreground">{strategy.carbon}t</p>
          <p className="text-[10px] text-muted-foreground">CO₂ Reduced</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-secondary/50 text-center">
          <p className="text-xs font-bold font-mono text-primary">{strategy.efficiency.toFixed(2)}</p>
          <p className="text-[10px] text-muted-foreground">Efficiency</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {Object.entries(strategy.interventions).map(([key, value]) => (
          <span key={key} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-mono">
            {interventionLabels[key]}: {value}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function Optimization() {
  const [selected, setSelected] = useState(OPTIMIZED_STRATEGIES[0]);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 2000);
  };

  const radarData = Object.entries(selected.interventions).map(([key, val]) => ({
    name: key.split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ').substring(0, 12),
    value: val,
  }));

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={Cpu} title="AI Optimization Engine" subtitle="Multi-objective optimization using Genetic Algorithms for optimal cooling strategies">
        <Button onClick={handleRun} disabled={running} className="bg-primary text-primary-foreground">
          {running ? (
            <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" /> Optimizing...</>
          ) : (
            <><Zap className="w-3.5 h-3.5 mr-2" /> Run Optimization</>
          )}
        </Button>
      </PageHeader>

      {/* Optimization Objectives */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: TrendingDown, label: 'Max Cooling', value: '-5.8°C', color: 'text-emerald-400' },
          { icon: DollarSign, label: 'Min Cost', value: '₹96Cr', color: 'text-sky-400' },
          { icon: Leaf, label: 'Max Sustainability', value: '248t CO₂', color: 'text-green-400' },
          { icon: Target, label: 'Best Efficiency', value: '2.92', color: 'text-purple-400' },
        ].map(obj => (
          <div key={obj.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <obj.icon className={`w-5 h-5 ${obj.color} mx-auto mb-1`} />
            <p className={`text-lg font-bold font-heading ${obj.color}`}>{obj.value}</p>
            <p className="text-[10px] text-muted-foreground">{obj.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy List */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-heading font-semibold text-foreground">Ranked Intervention Plans</h3>
          {OPTIMIZED_STRATEGIES.map(s => (
            <StrategyCard key={s.rank} strategy={s} isSelected={selected.rank === s.rank} onSelect={setSelected} />
          ))}
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs font-heading font-semibold text-foreground mb-3">Intervention Mix — {selected.name}</h4>
            {radarData.length > 2 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(217 33% 20%)" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} />
                  <Radar dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={radarData}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pareto Front */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-xs font-heading font-semibold text-foreground mb-3">Pareto Front: Cooling vs Cost</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={PARETO_DATA}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="cooling" name="Cooling (°C)" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">GA Configuration</span>
            </div>
            <div className="space-y-1 text-[10px] text-muted-foreground font-mono">
              <p>Population: 500 | Generations: 200</p>
              <p>Crossover: 0.85 | Mutation: 0.15</p>
              <p>Selection: Tournament (k=3)</p>
              <p>Objectives: NSGA-II Multi-Objective</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}