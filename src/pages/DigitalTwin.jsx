import React, { useState } from 'react';
import { Box, Layers, Eye, SplitSquareHorizontal, Thermometer, TreePine, Building2, Cloud } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LAYER_TYPES = [
  { id: 'heat', label: 'Heat Layer', icon: Thermometer, color: '#ef4444', desc: 'Surface temperature distribution' },
  { id: 'vegetation', label: 'Vegetation', icon: TreePine, color: '#22c55e', desc: 'Green cover and tree canopy' },
  { id: 'builtup', label: 'Built-Up', icon: Building2, color: '#94a3b8', desc: 'Building footprints and density' },
  { id: 'climate', label: 'Climate', icon: Cloud, color: '#38bdf8', desc: 'Wind, humidity, and microclimate' },
];

function CityStatePanel({ title, subtitle, state, layers }) {
  const gradients = {
    current: 'from-red-600/40 via-orange-500/30 to-yellow-500/20',
    future: 'from-red-700/50 via-red-500/40 to-orange-500/30',
    simulated: 'from-green-600/30 via-emerald-500/20 to-teal-500/10',
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-heading font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="relative h-72 overflow-hidden">
        {/* City visualization */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients[state]}`} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(239,68,68,0.3) 0%, transparent 40%), radial-gradient(circle at 60% 50%, rgba(249,115,22,0.2) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(234,179,8,0.2) 0%, transparent 30%)',
        }} />
        {/* Grid representing buildings */}
        <div className="absolute inset-4 grid grid-cols-12 grid-rows-8 gap-1 opacity-30">
          {Array.from({ length: 96 }).map((_, i) => {
            const isGreen = state === 'simulated' && Math.random() > 0.6;
            const height = 10 + Math.random() * 30;
            return (
              <div
                key={i}
                className="rounded-sm transition-all duration-500"
                style={{
                  backgroundColor: isGreen ? '#22c55e' : `rgba(148,163,184,${0.1 + Math.random() * 0.4})`,
                  height: `${height}%`,
                  alignSelf: 'end',
                }}
              />
            );
          })}
        </div>
        {/* Temperature overlay text */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          <div className="px-2 py-1 rounded bg-black/50 backdrop-blur text-xs font-mono text-white">
            {state === 'current' ? 'LST: 42.3°C' : state === 'future' ? 'LST: 45.8°C (+8.3%)' : 'LST: 37.1°C (-12.3%)'}
          </div>
          <div className="px-2 py-1 rounded bg-black/50 backdrop-blur text-xs font-mono text-white">
            {state === 'current' ? 'UHI: 6.8°C' : state === 'future' ? 'UHI: 8.2°C' : 'UHI: 4.1°C'}
          </div>
        </div>
      </div>
      {/* Metrics */}
      <div className="p-4 grid grid-cols-4 gap-2">
        {[
          { label: 'Avg LST', value: state === 'current' ? '42.3°C' : state === 'future' ? '45.8°C' : '37.1°C' },
          { label: 'Green Cover', value: state === 'current' ? '15%' : state === 'future' ? '11%' : '32%' },
          { label: 'Heat Score', value: state === 'current' ? '92' : state === 'future' ? '97' : '58' },
          { label: 'Risk', value: state === 'current' ? 'Extreme' : state === 'future' ? 'Extreme' : 'Moderate' },
        ].map(m => (
          <div key={m.label} className="text-center">
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
            <p className="text-xs font-bold font-mono text-foreground">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DigitalTwin() {
  const [activeLayers, setActiveLayers] = useState(['heat', 'builtup']);
  const [viewMode, setViewMode] = useState('comparison');

  const toggleLayer = (id) => {
    setActiveLayers(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={Box} title="Urban Climate Digital Twin" subtitle="Dynamic digital replica of the urban environment for heat analysis and simulation">
        <Select value={viewMode} onValueChange={setViewMode}>
          <SelectTrigger className="w-44 bg-secondary border-border">
            <SplitSquareHorizontal className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comparison">Side-by-Side</SelectItem>
            <SelectItem value="current">Current State</SelectItem>
            <SelectItem value="future">Future Projection</SelectItem>
            <SelectItem value="simulated">Simulated State</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Layer Controls */}
      <div className="flex items-center gap-3">
        <Layers className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Active Layers:</span>
        {LAYER_TYPES.map(layer => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeLayers.includes(layer.id)
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-secondary text-muted-foreground border border-transparent hover:text-foreground'
            }`}
          >
            <layer.icon className="w-3 h-3" />
            {layer.label}
          </button>
        ))}
      </div>

      {/* City States */}
      {viewMode === 'comparison' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CityStatePanel title="Current State" subtitle="Real-time urban heat conditions" state="current" layers={activeLayers} />
          <CityStatePanel title="Future Projection (2030)" subtitle="Climate model based projection" state="future" layers={activeLayers} />
          <CityStatePanel title="Simulated (Post-Intervention)" subtitle="With optimized cooling strategies" state="simulated" layers={activeLayers} />
        </div>
      ) : (
        <CityStatePanel
          title={viewMode === 'current' ? 'Current State' : viewMode === 'future' ? 'Future Projection (2030)' : 'Simulated State'}
          subtitle={viewMode === 'current' ? 'Real-time urban heat conditions' : viewMode === 'future' ? 'Climate model projection' : 'Post-intervention simulation'}
          state={viewMode}
          layers={activeLayers}
        />
      )}

      {/* 3D Visualization Note */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-semibold text-foreground">3D Visualization Engine</h3>
            <p className="text-xs text-muted-foreground">CesiumJS + Deck.gl powered 3D urban model</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '3D Buildings', desc: 'Extruded building footprints with height data', status: 'Ready' },
            { label: 'Heat Overlay', desc: 'Temperature-mapped surface coloring', status: 'Active' },
            { label: 'Vegetation 3D', desc: 'Tree canopy and green space modeling', status: 'Ready' },
            { label: 'Wind Flow', desc: 'CFD-based wind pattern visualization', status: 'Processing' },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs font-semibold text-foreground">{item.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
              <span className={`inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded ${
                item.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : item.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-primary/10 text-primary'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}