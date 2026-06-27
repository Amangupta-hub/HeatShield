import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, MapPin, ArrowUpDown } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import RiskBadge from '@/components/shared/RiskBadge';
import HeatGauge from '@/components/shared/HeatGauge';
import { getTempColor, RISK_COLORS } from '@/lib/heatUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const CLUSTER_LABELS = {
  kmeans: 'K-Means',
  dbscan: 'DBSCAN',
  getis_ord: 'Getis-Ord Gi*',
  morans_i: "Moran's I",
};

export default function HeatHotspots() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [clusterFilter, setClusterFilter] = useState('all');
  const [sortBy, setSortBy] = useState('heat_score');

  useEffect(() => {
    base44.entities.HeatHotspot.list().then(data => {
      setHotspots(data);
      setSelected(data[0] || null);
      setLoading(false);
    });
  }, []);

  const filtered = hotspots
    .filter(h => clusterFilter === 'all' || h.cluster_method === clusterFilter)
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  const riskCounts = {
    extreme: hotspots.filter(h => h.risk_level === 'extreme').length,
    high: hotspots.filter(h => h.risk_level === 'high').length,
    moderate: hotspots.filter(h => h.risk_level === 'moderate').length,
    low: hotspots.filter(h => h.risk_level === 'low').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={Flame} title="Heat Hotspot Detection" subtitle="Spatial clustering & risk classification using K-Means, DBSCAN, Getis-Ord Gi*, Moran's I">
        <Select value={clusterFilter} onValueChange={setClusterFilter}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {Object.entries(CLUSTER_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Risk Distribution */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(riskCounts).map(([level, count]) => {
          const c = RISK_COLORS[level];
          return (
            <div key={level} className={`rounded-xl border ${c.border} ${c.bg} p-4 text-center`}>
              <p className="text-3xl font-heading font-bold text-foreground">{count}</p>
              <p className={`text-xs font-semibold mt-1 ${c.text} capitalize`}>{level} Risk</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hotspot List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-semibold text-foreground">Detected Hotspots ({filtered.length})</h3>
            <button onClick={() => setSortBy(s => s === 'heat_score' ? 'lst_value' : 'heat_score')} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <ArrowUpDown className="w-3 h-3" /> Sort by {sortBy === 'heat_score' ? 'Temperature' : 'Heat Score'}
            </button>
          </div>
          <div className="space-y-2">
            {filtered.map(h => (
              <button
                key={h.id}
                onClick={() => setSelected(h)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  selected?.id === h.id ? 'border-primary/50 bg-primary/5' : 'border-border bg-card hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" style={{ color: getTempColor(h.lst_value) }} />
                    <span className="text-sm font-semibold text-foreground">{h.zone_name}</span>
                  </div>
                  <RiskBadge level={h.risk_level} />
                </div>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">LST</p>
                    <p className="text-sm font-bold font-mono" style={{ color: getTempColor(h.lst_value) }}>{h.lst_value}°C</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Heat Score</p>
                    <p className="text-sm font-bold font-mono text-foreground">{h.heat_score}/100</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">NDVI</p>
                    <p className="text-sm font-mono text-foreground">{h.ndvi}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Method</p>
                    <p className="text-xs font-mono text-primary">{CLUSTER_LABELS[h.cluster_method]}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-heading font-semibold text-foreground mb-3">{selected.zone_name}</h3>
              <div className="flex justify-center mb-4">
                <HeatGauge value={selected.heat_score} max={100} label="Heat Risk Score" size="lg" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'LST', value: `${selected.lst_value}°C` },
                  { label: 'NDVI', value: selected.ndvi },
                  { label: 'NDBI', value: selected.ndbi },
                  { label: 'Population', value: `${(selected.population_density || 0).toLocaleString()}/km²` },
                  { label: 'Building Density', value: `${((selected.building_density || 0) * 100).toFixed(0)}%` },
                  { label: 'Road Density', value: `${((selected.road_density || 0) * 100).toFixed(0)}%` },
                  { label: 'Vegetation', value: `${selected.vegetation_cover || 0}%` },
                  { label: 'Wind Speed', value: `${selected.wind_speed || 0} m/s` },
                ].map(item => (
                  <div key={item.label} className="px-3 py-2 rounded-lg bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-semibold text-foreground font-mono">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Heat Drivers Mini */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h4 className="text-xs font-heading font-semibold text-foreground mb-3">Heat Driver Contribution</h4>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { name: 'Vegetation', value: selected.driver_vegetation || 0 },
                  { name: 'Buildings', value: selected.driver_buildings || 0 },
                  { name: 'Roads', value: selected.driver_roads || 0 },
                  { name: 'Wind', value: selected.driver_wind || 0 },
                  { name: 'Population', value: selected.driver_population || 0 },
                ]} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={70} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[
                      { name: 'Vegetation', value: selected.driver_vegetation || 0 },
                      { name: 'Buildings', value: selected.driver_buildings || 0 },
                      { name: 'Roads', value: selected.driver_roads || 0 },
                      { name: 'Wind', value: selected.driver_wind || 0 },
                      { name: 'Population', value: selected.driver_population || 0 },
                    ].map((entry, i) => (
                      <Cell key={i} fill={['#34d399', '#f87171', '#fb923c', '#38bdf8', '#a78bfa'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}