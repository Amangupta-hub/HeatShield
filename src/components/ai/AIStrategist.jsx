import React, { useState, useEffect } from 'react';
import { Brain, ChevronDown, ChevronUp, CheckCircle2, Circle, TrendingDown, Zap, TreePine, Droplets, Wind, Building2, Sun } from 'lucide-react';

const STRATEGIES_DB = {
  high: [ // temp >= 42
    {
      id: 'green-roof',
      icon: TreePine,
      title: 'Green Rooftop Coverage',
      desc: 'Install vegetation on 30% of rooftops to reduce solar absorption and provide evapotranspiration cooling.',
      impact: { lst: -3.2, uhi: -1.8, label: 'High Impact' },
      color: 'emerald',
      timeframe: '6–18 months',
      cost: '₹₹₹',
    },
    {
      id: 'cool-pavement',
      icon: Sun,
      title: 'Cool/Reflective Pavements',
      desc: 'Replace dark asphalt with high-albedo (reflective) materials on 40% of roads and parking lots.',
      impact: { lst: -2.5, uhi: -1.4, label: 'High Impact' },
      color: 'yellow',
      timeframe: '3–12 months',
      cost: '₹₹',
    },
    {
      id: 'urban-forest',
      icon: TreePine,
      title: 'Urban Afforestation Corridors',
      desc: 'Plant shade trees along arterial roads and open spaces, targeting 25% canopy cover increase.',
      impact: { lst: -4.1, uhi: -2.3, label: 'Very High Impact' },
      color: 'green',
      timeframe: '2–5 years',
      cost: '₹₹',
    },
    {
      id: 'water-bodies',
      icon: Droplets,
      title: 'Revive Water Bodies & Lakes',
      desc: 'Restore urban lakes, ponds and wetlands to create evaporative cooling zones across the city.',
      impact: { lst: -2.8, uhi: -1.6, label: 'High Impact' },
      color: 'blue',
      timeframe: '1–3 years',
      cost: '₹₹₹',
    },
    {
      id: 'cool-buildings',
      icon: Building2,
      title: 'Cool Building Envelopes',
      desc: 'Mandate white/light-coloured exterior paints and insulated roofs for new construction.',
      impact: { lst: -1.6, uhi: -0.9, label: 'Moderate Impact' },
      color: 'slate',
      timeframe: 'Policy: 1–2 years',
      cost: '₹',
    },
    {
      id: 'ventilation',
      icon: Wind,
      title: 'Urban Wind Corridors',
      desc: 'Redesign street layout to align with prevailing winds, breaking heat-trapping urban canyons.',
      impact: { lst: -1.9, uhi: -1.1, label: 'Moderate Impact' },
      color: 'sky',
      timeframe: 'Long-term urban plan',
      cost: '₹₹₹₹',
    },
  ],
  moderate: [ // temp 35–42
    {
      id: 'green-roof',
      icon: TreePine,
      title: 'Green Rooftop Coverage',
      desc: 'Install vegetation on 25% of rooftops to reduce solar absorption.',
      impact: { lst: -2.4, uhi: -1.3, label: 'High Impact' },
      color: 'emerald',
      timeframe: '6–18 months',
      cost: '₹₹₹',
    },
    {
      id: 'cool-pavement',
      icon: Sun,
      title: 'Cool/Reflective Pavements',
      desc: 'Replace dark surfaces with high-albedo materials on key roads and parking areas.',
      impact: { lst: -1.8, uhi: -1.0, label: 'Moderate Impact' },
      color: 'yellow',
      timeframe: '3–12 months',
      cost: '₹₹',
    },
    {
      id: 'urban-forest',
      icon: TreePine,
      title: 'Street Tree Plantation',
      desc: 'Systematic planting of native shade trees along roads to reduce direct solar radiation.',
      impact: { lst: -2.9, uhi: -1.6, label: 'High Impact' },
      color: 'green',
      timeframe: '1–3 years',
      cost: '₹₹',
    },
    {
      id: 'water-features',
      icon: Droplets,
      title: 'Misting & Water Features',
      desc: 'Install evaporative mist systems in public spaces and parks for localised cooling.',
      impact: { lst: -1.2, uhi: -0.7, label: 'Low–Moderate Impact' },
      color: 'blue',
      timeframe: '1–6 months',
      cost: '₹',
    },
  ],
  low: [ // temp < 35
    {
      id: 'green-spaces',
      icon: TreePine,
      title: 'Expand Green Spaces',
      desc: 'Develop parks and community gardens to build cooling buffers proactively.',
      impact: { lst: -1.5, uhi: -0.8, label: 'Moderate Impact' },
      color: 'green',
      timeframe: '1–2 years',
      cost: '₹₹',
    },
    {
      id: 'cool-pavement',
      icon: Sun,
      title: 'Pilot Reflective Pavements',
      desc: 'Start reflective paving in high-traffic areas as a preventive heat measure.',
      impact: { lst: -0.9, uhi: -0.5, label: 'Low Impact' },
      color: 'yellow',
      timeframe: '3–9 months',
      cost: '₹₹',
    },
    {
      id: 'awareness',
      icon: Zap,
      title: 'Heat Action Planning',
      desc: 'Develop city-level heat action plans, early warning systems and community awareness.',
      impact: { lst: -0.3, uhi: -0.2, label: 'Preparedness' },
      color: 'orange',
      timeframe: '3–6 months',
      cost: '₹',
    },
  ],
};

const COLOR_MAP = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-400' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-400' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400' },
};

function StrategyCard({ strategy, applied, onToggle, baseLST }) {
  const [expanded, setExpanded] = useState(false);
  const c = COLOR_MAP[strategy.color] || COLOR_MAP.emerald;

  return (
    <div className={`rounded-xl border transition-all duration-300 ${applied ? c.border + ' ' + c.bg : 'border-border bg-card'}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${applied ? c.bg : 'bg-secondary'}`}>
            <strategy.icon className={`w-4.5 h-4.5 ${applied ? c.text : 'text-muted-foreground'}`} style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">{strategy.title}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{strategy.impact.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{strategy.desc}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground">⏱ {strategy.timeframe}</span>
              <span className="text-[10px] text-muted-foreground">Cost: {strategy.cost}</span>
              <button onClick={() => setExpanded(v => !v)} className="text-[10px] text-primary hover:underline flex items-center gap-0.5 ml-auto">
                {expanded ? 'Less' : 'Details'}
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            {expanded && (
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">LST Reduction</span>
                  <span className={`font-bold ${c.text}`}>{strategy.impact.lst}°C</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">UHI Intensity Reduction</span>
                  <span className={`font-bold ${c.text}`}>{strategy.impact.uhi}°C</span>
                </div>
                {baseLST && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">New Projected LST</span>
                    <span className="font-bold text-foreground">{(baseLST + strategy.impact.lst).toFixed(1)}°C</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => onToggle(strategy.id)}
            className={`shrink-0 transition-all ${applied ? c.text : 'text-muted-foreground hover:text-foreground'}`}
          >
            {applied
              ? <CheckCircle2 className="w-5 h-5" />
              : <Circle className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AIStrategist({ locationLabel, lst, airTemp }) {
  const [applied, setApplied] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const baseLST = lst || (airTemp ? airTemp + 8 : 42);
  const tier = baseLST >= 42 ? 'high' : baseLST >= 35 ? 'moderate' : 'low';
  const strategies = STRATEGIES_DB[tier] || STRATEGIES_DB.high;

  const visibleStrategies = showAll ? strategies : strategies.slice(0, 3);

  const totalLSTReduction = applied.reduce((sum, id) => {
    const s = strategies.find(s => s.id === id);
    return sum + (s?.impact.lst || 0);
  }, 0);

  const totalUHIReduction = applied.reduce((sum, id) => {
    const s = strategies.find(s => s.id === id);
    return sum + (s?.impact.uhi || 0);
  }, 0);

  const projectedLST = Math.max(baseLST + totalLSTReduction, 20);

  const toggle = (id) => setApplied(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const riskLabel = baseLST >= 50 ? 'Extreme' : baseLST >= 45 ? 'Very High' : baseLST >= 40 ? 'High' : baseLST >= 35 ? 'Moderate' : 'Low';
  const riskColor = baseLST >= 50 ? 'text-red-400' : baseLST >= 45 ? 'text-orange-400' : baseLST >= 40 ? 'text-yellow-400' : 'text-emerald-400';

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-orange-500/5 to-transparent">
        <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center shrink-0">
          <Brain className="w-4.5 h-4.5 text-orange-400" style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">AI Heat Strategist</p>
          <p className="text-xs text-muted-foreground">{locationLabel} · Heat Risk: <span className={`font-semibold ${riskColor}`}>{riskLabel}</span></p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-muted-foreground">Current LST</p>
          <p className="text-lg font-bold text-red-400">{baseLST.toFixed(1)}°C</p>
        </div>
      </div>

      {/* Impact summary when strategies applied */}
      {applied.length > 0 && (
        <div className="px-5 py-3 bg-emerald-500/5 border-b border-emerald-500/20 flex flex-wrap gap-4 items-center">
          <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Projected LST after {applied.length} strateg{applied.length > 1 ? 'ies' : 'y'}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xl font-bold text-emerald-400">{projectedLST.toFixed(1)}°C</span>
              <span className="text-sm text-emerald-400 font-semibold">↓ {Math.abs(totalLSTReduction).toFixed(1)}°C LST</span>
              <span className="text-xs text-muted-foreground">· ↓ {Math.abs(totalUHIReduction).toFixed(1)}°C UHI</span>
            </div>
          </div>
          {/* Simple progress bar */}
          <div className="ml-auto flex-1 min-w-[100px] max-w-[160px]">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Impact</span>
              <span>{Math.min(100, Math.round(Math.abs(totalLSTReduction) / (baseLST - 20) * 100))}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(Math.abs(totalLSTReduction) / (baseLST - 20) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Strategy list */}
      <div className="p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          Recommended Strategies — select to simulate impact
        </p>
        {visibleStrategies.map(s => (
          <StrategyCard
            key={s.id}
            strategy={s}
            applied={applied.includes(s.id)}
            onToggle={toggle}
            baseLST={baseLST}
          />
        ))}
        {strategies.length > 3 && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="w-full py-2 text-xs text-primary hover:text-primary/80 font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            {showAll ? <><ChevronUp className="w-3.5 h-3.5" /> Show Less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show {strategies.length - 3} More Strategies</>}
          </button>
        )}
      </div>

      {/* Footer note */}
      <div className="px-4 pb-4">
        <p className="text-[10px] text-muted-foreground bg-secondary/40 rounded-lg px-3 py-2">
          ⚡ Impact estimates based on urban heat island research, Landsat LST studies, and IPCC climate adaptation guidelines. Tick strategies to simulate combined cooling effect.
        </p>
      </div>
    </div>
  );
}