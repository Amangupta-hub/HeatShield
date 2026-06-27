import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Satellite, Maximize2, X, TrendingUp, TrendingDown,
  BarChart3, Activity, ChevronRight, MapPin, AlertTriangle, CheckCircle2,
  Thermometer, TreePine, Building2, Cpu, Info, Zap
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell
} from 'recharts';

// ── Study Areas ──────────────────────────────────────────────────────────────
const AREAS = [
  { id: 'delhi_ncr', label: 'Delhi NCR', lat: 28.61, lon: 77.21, area_km2: 1484, population: '32.9M' },
  { id: 'old_delhi', label: 'Old Delhi', lat: 28.65, lon: 77.23, area_km2: 42, population: '1.8M' },
  { id: 'south_delhi', label: 'South Delhi', lat: 28.52, lon: 77.22, area_km2: 250, population: '2.7M' },
  { id: 'noida', label: 'Noida', lat: 28.54, lon: 77.39, area_km2: 203, population: '0.7M' },
  { id: 'gurgaon', label: 'Gurgaon', lat: 28.46, lon: 77.03, area_km2: 738, population: '1.1M' },
  { id: 'rohini', label: 'Rohini', lat: 28.73, lon: 77.12, area_km2: 35, population: '0.9M' },
  { id: 'chandni_chowk', label: 'Chandni Chowk', lat: 28.65, lon: 77.23, area_km2: 12, population: '0.45M' },
];

// ── Per-area thermal profile ─────────────────────────────────────────────────
const AREA_DATA = {
  delhi_ncr:     { lst: 47.3, ndvi: 0.18, ndbi: 0.34, uhi: 6.8, stress: 78, veg: 14.8, builtup: 62.4, expansion: 428 },
  old_delhi:     { lst: 51.2, ndvi: 0.08, ndbi: 0.61, uhi: 10.4, stress: 95, veg: 6.1, builtup: 82.3, expansion: 18 },
  south_delhi:   { lst: 43.7, ndvi: 0.29, ndbi: 0.28, uhi: 5.2, stress: 66, veg: 24.8, builtup: 51.0, expansion: 62 },
  noida:         { lst: 44.9, ndvi: 0.22, ndbi: 0.31, uhi: 6.1, stress: 71, veg: 18.4, builtup: 57.6, expansion: 95 },
  gurgaon:       { lst: 45.8, ndvi: 0.19, ndbi: 0.38, uhi: 7.3, stress: 76, veg: 14.1, builtup: 66.2, expansion: 134 },
  rohini:        { lst: 48.6, ndvi: 0.14, ndbi: 0.44, uhi: 8.5, stress: 84, veg: 10.3, builtup: 71.8, expansion: 42 },
  chandni_chowk: { lst: 53.1, ndvi: 0.04, ndbi: 0.72, uhi: 11.9, stress: 97, veg: 3.2, builtup: 89.4, expansion: 5 },
};

// ── Product definitions (dynamic current pulled from area data) ──────────────
const BASE_PRODUCTS = [
  {
    id: 'lst', label: 'Land Surface Temperature', source: 'Landsat 8/9', band: 'Band 10 Thermal',
    resolution: '100m', unit: '°C', color: '#ef4444',
    desc: 'Thermal infrared emission converted to surface kinetic temperature. Directly measures urban heat retention.',
    gradient: 'from-blue-600 via-yellow-400 via-orange-500 to-red-700',
    insight_key: 'lst_insight',
    icon: Thermometer,
    stats_fn: (v) => ({ min: +(v * 0.55).toFixed(1), max: +(v * 1.10).toFixed(1), mean: +(v * 0.92).toFixed(1), stddev: +(v * 0.12).toFixed(1) }),
  },
  {
    id: 'ndvi', label: 'NDVI — Vegetation Index', source: 'Sentinel-2', band: '(B8−B4)/(B8+B4)',
    resolution: '10m', unit: 'Index', color: '#22c55e',
    desc: 'Measures live green vegetation density. NDVI < 0.2 indicates sparse/no vegetation — a primary heat driver.',
    gradient: 'from-red-700 via-yellow-400 to-green-600',
    insight_key: 'ndvi_insight',
    icon: TreePine,
    stats_fn: (v) => ({ min: +(-0.05).toFixed(2), max: +(v * 3.2).toFixed(2), mean: +(v * 1.1).toFixed(2), stddev: +(v * 0.6).toFixed(2) }),
  },
  {
    id: 'ndbi', label: 'NDBI — Built-Up Index', source: 'Sentinel-2', band: '(B11−B8)/(B11+B8)',
    resolution: '20m', unit: 'Index', color: '#f97316',
    desc: 'Identifies impervious surfaces (concrete, asphalt, rooftops). High NDBI correlates directly with LST spikes.',
    gradient: 'from-green-600 via-yellow-400 to-red-700',
    insight_key: 'ndbi_insight',
    icon: Building2,
    stats_fn: (v) => ({ min: +(v * -0.3).toFixed(2), max: +(v * 1.9).toFixed(2), mean: +(v * 0.88).toFixed(2), stddev: +(v * 0.3).toFixed(2) }),
  },
  {
    id: 'uhi', label: 'UHI Intensity Map', source: 'ECOSTRESS + Landsat', band: 'LST differential',
    resolution: '70m', unit: '°C diff', color: '#a855f7',
    desc: 'Urban–rural temperature difference. Values >6°C indicate severe urban heat island effect.',
    gradient: 'from-blue-500 via-yellow-400 to-red-600',
    insight_key: 'uhi_insight',
    icon: Activity,
    stats_fn: (v) => ({ min: +(v * 0.15).toFixed(1), max: +(v * 1.65).toFixed(1), mean: +(v * 0.87).toFixed(1), stddev: +(v * 0.28).toFixed(1) }),
  },
  {
    id: 'heat_stress', label: 'Heat Stress Index', source: 'Multi-source fusion', band: 'Composite HSI',
    resolution: '100m', unit: 'Score /100', color: '#dc2626',
    desc: 'Physiological heat stress combining LST, humidity, wind speed. >80 indicates dangerous outdoor conditions.',
    gradient: 'from-green-500 via-orange-500 to-red-700',
    insight_key: 'stress_insight',
    icon: Zap,
    stats_fn: (v) => ({ min: Math.round(v * 0.25), max: Math.min(100, Math.round(v * 1.25)), mean: Math.round(v * 0.82), stddev: Math.round(v * 0.18) }),
  },
  {
    id: 'vegetation', label: 'Vegetation Cover', source: 'MODIS + Sentinel', band: 'NDVI classified',
    resolution: '10m', unit: '% cover', color: '#16a34a',
    desc: 'Fractional green cover per pixel. WHO recommends ≥30% urban green cover for heat resilience.',
    gradient: 'from-amber-800 via-yellow-500 to-green-600',
    insight_key: 'veg_insight',
    icon: TreePine,
    stats_fn: (v) => ({ min: 0, max: Math.round(v * 4.2), mean: Math.round(v * 1.5), stddev: Math.round(v * 0.9) }),
  },
  {
    id: 'builtup', label: 'Impervious Surface', source: 'Sentinel-2', band: 'NDBI classified',
    resolution: '10m', unit: '% cover', color: '#64748b',
    desc: 'Concrete/asphalt fraction. Surfaces above 60% impervious have significantly reduced evaporative cooling.',
    gradient: 'from-green-700 via-yellow-500 to-gray-400',
    insight_key: 'builtup_insight',
    icon: Building2,
    stats_fn: (v) => ({ min: 0, max: Math.min(100, Math.round(v * 1.55)), mean: Math.round(v * 0.87), stddev: Math.round(v * 0.33) }),
  },
  {
    id: 'expansion', label: 'Urban Expansion', source: 'Landsat time-series', band: 'Multi-temporal change',
    resolution: '30m', unit: 'km²', color: '#eab308',
    desc: 'New impervious pixels vs 2010 baseline. Tracks urban sprawl and heat island growth over 15 years.',
    gradient: 'from-green-700 via-yellow-400 to-red-600',
    insight_key: 'exp_insight',
    icon: BarChart3,
    stats_fn: (v) => ({ min: 0, max: Math.round(v * 2.1), mean: Math.round(v * 0.73), stddev: Math.round(v * 0.41) }),
  },
];

// ── Per-product insight generator ────────────────────────────────────────────
function getInsights(productId, value, area) {
  const a = area.label;
  const insights = {
    lst: [
      value > 50 ? `🔴 CRITICAL: ${a} LST of ${value}°C exceeds the extreme heat threshold (50°C). Outdoor exposure risk is very high.` : value > 45 ? `🟠 HIGH: ${a} LST of ${value}°C is ${(value - 38).toFixed(1)}°C above comfortable urban levels.` : `🟡 MODERATE: ${a} LST of ${value}°C is elevated but within manageable range.`,
      `Peak LST recorded in May–June. Diurnal range: ~${(value * 0.28).toFixed(1)}°C between 2 AM (min) and 2 PM (max).`,
      `Thermal anomaly vs rural background: +${(value * 0.16).toFixed(1)}°C — consistent with dense urban morphology.`,
    ],
    ndvi: [
      value < 0.1 ? `🔴 CRITICAL: NDVI of ${value} indicates near-zero vegetation. ${a} has almost no natural cooling capacity from plants.` : value < 0.2 ? `🟠 LOW: NDVI ${value} — sparse vegetation in ${a}. Each 0.1 NDVI increase yields ~1.8°C LST reduction.` : `🟢 MODERATE: NDVI ${value} suggests some vegetation present but well below the 0.4 target.`,
      `Seasonal peak NDVI occurs July–September (monsoon). Dry-season NDVI drops to ~${(value * 0.55).toFixed(2)}.`,
      `Increasing tree canopy from ${value} to 0.35+ could reduce area LST by 4–6°C over 5 years.`,
    ],
    ndbi: [
      value > 0.6 ? `🔴 CRITICAL: NDBI ${value} — ${a} is dominated by impervious surfaces. Almost no natural cooling mechanisms remain.` : value > 0.4 ? `🟠 HIGH: NDBI ${value} — heavy impervious cover in ${a}. Albedo-improving interventions are urgent.` : `🟡 MODERATE: NDBI ${value} indicates mixed land use with opportunities for greening.`,
      `NDBI increase of 0.1 correlates with +2.4°C LST rise based on Delhi NCR regression (R²=0.87).`,
      `Reflective pavement deployment on top ${(value * 40).toFixed(0)}% NDBI zones could cut area LST by 2.1°C.`,
    ],
    uhi: [
      value > 10 ? `🔴 EXTREME UHI: ${value}°C differential in ${a}. Among the highest urban heat islands in South Asia.` : value > 7 ? `🟠 SEVERE UHI: ${value}°C differential. ${a} is significantly hotter than surrounding rural areas.` : `🟡 MODERATE UHI: ${value}°C differential — intervention can realistically reduce this by 2–3°C.`,
      `UHI peak occurs between 8 PM–11 PM due to heat release from thermal mass accumulated during the day.`,
      `Green corridor along major roads in ${a} could reduce UHI by up to ${(value * 0.3).toFixed(1)}°C within 3 years.`,
    ],
    heat_stress: [
      value > 85 ? `🔴 DANGEROUS: Heat Stress Index ${value}/100 in ${a}. Outdoor activity is hazardous without protection.` : value > 70 ? `🟠 HIGH RISK: HSI ${value}/100 — vulnerable populations (elderly, children) face serious health risk.` : `🟡 CAUTION: HSI ${value}/100 — exercise caution during peak afternoon hours (12 PM – 4 PM).`,
      `At HSI > 80, core body temperature rises 0.5°C/hour without cooling. Emergency services should be on alert.`,
      `Misting stations and shaded corridors could reduce effective HSI by 12–18 points in public spaces.`,
    ],
    vegetation: [
      value < 10 ? `🔴 CRITICAL: Only ${value}% green cover in ${a}. WHO minimum is 9 m²/person; current level is critically deficient.` : value < 20 ? `🟠 LOW: ${value}% green cover. Target of 30% requires planting on ${((30 - value) / 100 * AREAS.find(a2 => a2.label === a)?.area_km2 || 50).toFixed(0)} km².` : `🟡 BELOW TARGET: ${value}% green cover. Urban forestry program needed to reach 30% WHO benchmark.`,
      `Each additional 1% green cover reduces city-wide mean LST by 0.22°C (Delhi NCR empirical estimate).`,
      `Priority zones for afforestation: high-NDBI, low-NDVI corridors near industrial and transport hubs.`,
    ],
    builtup: [
      value > 80 ? `🔴 EXTREME: ${value}% impervious cover in ${a}. Heat retention is at maximum — no permeable surfaces remain.` : value > 60 ? `🟠 HIGH: ${value}% impervious cover. Evapotranspiration is suppressed, amplifying surface temperatures.` : `🟡 MODERATE: ${value}% impervious — targeted greening of parking lots and rooftops can reduce heat.`,
      `Cool-roof program covering 30% of rooftops in ${a} would reduce impervious surface absorption by ~18%.`,
      `Permeable paving on ${Math.round(value * 0.15)}% of current area would restore partial groundwater recharge and cooling.`,
    ],
    expansion: [
      value > 100 ? `🟠 RAPID GROWTH: ${value} km² new urban area since 2010 in ${a} region. Heat island is expanding proportionally.` : `🟡 STEADY GROWTH: ${value} km² urbanised since 2010. Growth corridors need mandatory green infrastructure standards.`,
      `At current rate, ${a} region will add ~${Math.round(value * 0.08)} km² new urban land per year through 2030.`,
      `New development zones should enforce 25% minimum green cover and cool-roof mandates to prevent heat compounding.`,
    ],
  };
  return insights[productId] || ['No specific insights available for this product.'];
}

// ── Processing simulation hook ───────────────────────────────────────────────
function useProcessing(areaId) {
  const [progress, setProgress] = useState({});
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setDone(false);
    const initial = {};
    BASE_PRODUCTS.forEach(p => { initial[p.id] = 0; });
    setProgress(initial);

    let step = 0;
    const total = 40;
    timerRef.current = setInterval(() => {
      step++;
      setProgress(prev => {
        const next = { ...prev };
        BASE_PRODUCTS.forEach((p, i) => {
          const offset = i * 3;
          const pct = Math.min(100, Math.round(((step - offset) / total) * 100));
          if (pct > 0) next[p.id] = pct;
        });
        return next;
      });
      if (step >= total + BASE_PRODUCTS.length * 3) {
        clearInterval(timerRef.current);
        setDone(true);
      }
    }, 60);

    return () => clearInterval(timerRef.current);
  }, [areaId]);

  return { progress, done };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEASONAL = {
  lst: [0.7, 0.78, 0.9, 1.0, 1.12, 1.14, 1.06, 1.0, 0.95, 0.88, 0.78, 0.71],
  ndvi: [0.8, 0.74, 0.68, 0.62, 0.58, 0.92, 1.15, 1.18, 1.12, 1.02, 0.91, 0.84],
  ndbi: [1.05, 1.04, 1.02, 1.0, 0.97, 0.94, 0.91, 0.93, 0.97, 1.0, 1.03, 1.06],
  uhi: [0.68, 0.73, 0.84, 1.0, 1.12, 1.18, 1.1, 1.04, 0.99, 0.88, 0.79, 0.70],
  heat_stress: [0.58, 0.63, 0.79, 1.0, 1.14, 1.18, 1.1, 1.04, 0.94, 0.83, 0.68, 0.60],
  vegetation: [0.9, 0.84, 0.78, 0.72, 0.67, 1.12, 1.22, 1.24, 1.16, 1.08, 0.98, 0.93],
  builtup: [1.0, 1.01, 1.02, 1.03, 1.04, 1.03, 1.02, 1.01, 1.02, 1.03, 1.04, 1.05],
  expansion: [1.0, 1.03, 1.07, 1.1, 1.13, 1.09, 1.05, 1.04, 1.07, 1.11, 1.14, 1.17],
};

function makeTimeSeries(productId, baseVal) {
  const curve = SEASONAL[productId] || Array(12).fill(1);
  return MONTHS.map((m, i) => ({
    month: m,
    '2023': parseFloat((baseVal * curve[i] * 0.94 * (1 + (Math.sin(i * 7) * 0.03))).toFixed(2)),
    '2024': parseFloat((baseVal * curve[i] * 0.97 * (1 + (Math.cos(i * 5) * 0.025))).toFixed(2)),
    '2025': parseFloat((baseVal * curve[i] * 1.0 * (1 + (Math.sin(i * 3) * 0.02))).toFixed(2)),
  }));
}

function makeZoneData(productId, baseVal) {
  const zones = AREAS.map(a => ({
    zone: a.label.replace(' Delhi', '').replace(' Chowk', ''),
    value: parseFloat((AREA_DATA[a.id][productId] || baseVal).toFixed(2)),
  }));
  return zones.sort((a, b) => b.value - a.value);
}

const ChartTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-1 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value} {unit}</p>
      ))}
    </div>
  );
};

// ── Insight Panel ─────────────────────────────────────────────────────────────
function InsightPanel({ productId, value, area }) {
  const lines = getInsights(productId, value, area);
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Info className="w-3.5 h-3.5 text-primary shrink-0" />
        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Analysis — {area.label}</p>
      </div>
      {lines.map((line, i) => (
        <p key={i} className="text-xs text-muted-foreground leading-relaxed">{line}</p>
      ))}
    </div>
  );
}

// ── Product detail modal ──────────────────────────────────────────────────────
function ProductModal({ product, value, area, onClose }) {
  const stats = product.stats_fn(value);
  const timeSeries = useMemo(() => makeTimeSeries(product.id, value), [product.id, value]);
  const zoneData = useMemo(() => makeZoneData(product.id, value), [product.id, value]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4 p-5 border-b border-border">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${product.gradient} shrink-0`} />
          <div className="flex-1">
            <h2 className="text-base font-bold text-foreground">{product.label}</h2>
            <p className="text-xs text-muted-foreground">{product.source} · {product.band} · {product.resolution} · Area: {area.label}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Current', val: `${value} ${product.unit}`, highlight: true },
              { label: 'Mean', val: `${stats.mean} ${product.unit}` },
              { label: 'Min', val: `${stats.min} ${product.unit}` },
              { label: 'Max', val: `${stats.max} ${product.unit}` },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 text-center border ${s.highlight ? 'border-primary/30 bg-primary/5' : 'bg-secondary/50 border-transparent'}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-sm font-bold" style={s.highlight ? { color: product.color } : {}}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Insights */}
          <InsightPanel productId={product.id} value={value} area={area} />

          {/* Multi-year trend */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Monthly Trend — 2023 to 2025 · {area.label}</p>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<ChartTooltip unit={product.unit} />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="2023" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="2024" stroke="#f97316" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="2025" stroke={product.color} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Zone distribution */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Zone Comparison — All Study Areas</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={zoneData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="zone" type="category" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<ChartTooltip unit={product.unit} />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {zoneData.map((entry, idx) => (
                    <Cell key={idx} fill={product.color} opacity={0.95 - idx * 0.1} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function SatelliteProduct({ product, value, progress, area, onExpand }) {
  const isUp = value > (product.stats_fn(value).mean);
  const TrendIcon = isUp ? TrendingUp : TrendingDown;
  const goodUp = product.id === 'ndvi' || product.id === 'vegetation';
  const trendColor = goodUp ? (isUp ? 'text-emerald-400' : 'text-red-400') : (isUp ? 'text-red-400' : 'text-emerald-400');
  const done = progress >= 100;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden group hover:border-primary/40 transition-all duration-200 cursor-pointer" onClick={() => done && onExpand(product)}>
      {/* Visual */}
      <div className="relative h-36 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} ${done ? 'opacity-75' : 'opacity-30'} transition-opacity duration-500`} />
        {!done && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <Cpu className="w-5 h-5 text-primary animate-pulse" />
            <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">{progress}% processed</p>
          </div>
        )}
        {done && (
          <>
            <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 gap-px opacity-10 pointer-events-none">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="bg-white rounded-sm" style={{ opacity: 0.05 + (i * 41 % 100) / 200 }} />
              ))}
            </div>
            <div className="absolute bottom-2 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur">
              <p className="text-sm font-bold text-white font-mono">{value} <span className="text-[10px] text-white/60">{product.unit}</span></p>
            </div>
            <div className="absolute top-2 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-white/80 font-mono">{product.source}</div>
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> Ready
            </div>
            <button
              onClick={e => { e.stopPropagation(); onExpand(product); }}
              className="absolute bottom-2 right-2 p-1 rounded-md bg-black/60 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Maximize2 className="w-3 h-3 text-white" />
            </button>
          </>
        )}
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs font-heading font-semibold text-foreground leading-tight">{product.label}</h4>
          {done && (
            <div className={`flex items-center gap-0.5 shrink-0 ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-[10px] font-bold">{isUp ? '↑' : '↓'}</span>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{product.desc}</p>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[9px] text-muted-foreground font-mono">{product.band}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{product.resolution}</span>
            {done && <span className="text-[10px] text-primary flex items-center gap-0.5">Analyse <ChevronRight className="w-3 h-3" /></span>}
          </div>
        </div>
        {/* Quick insight tag */}
        {done && (
          <div className="text-[10px] px-2 py-1 rounded-lg bg-secondary/60 text-muted-foreground leading-snug">
            {getInsights(product.id, value, { label: area.label })[0].slice(0, 80)}…
          </div>
        )}
      </div>
    </div>
  );
}

// ── Time Series Tab ───────────────────────────────────────────────────────────
function TimeSeriesTab({ area, areaData }) {
  const [selectedId, setSelectedId] = useState('lst');
  const product = BASE_PRODUCTS.find(p => p.id === selectedId);
  const value = areaData[selectedId];
  const timeSeries = useMemo(() => makeTimeSeries(selectedId, value), [selectedId, value]);
  const stats = product.stats_fn(value);

  const annualData = [
    { year: '2020', value: parseFloat((value * 0.91).toFixed(2)) },
    { year: '2021', value: parseFloat((value * 0.94).toFixed(2)) },
    { year: '2022', value: parseFloat((value * 0.97).toFixed(2)) },
    { year: '2023', value: parseFloat((value * 1.00).toFixed(2)) },
    { year: '2024', value: parseFloat((value * 1.03).toFixed(2)) },
    { year: '2025', value: parseFloat((value * 1.06).toFixed(2)) },
  ];

  return (
    <div className="space-y-4">
      {/* Product selector */}
      <div className="flex flex-wrap gap-2">
        {BASE_PRODUCTS.map(p => (
          <button key={p.id} onClick={() => setSelectedId(p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedId === p.id ? 'text-white border-transparent' : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
            }`}
            style={selectedId === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}
          >{p.label.split(' — ')[0]}</button>
        ))}
      </div>

      {/* Stats + insight row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Current Readings — {area.label}</p>
          <div className="text-3xl font-bold font-mono" style={{ color: product.color }}>{value} <span className="text-base text-muted-foreground">{product.unit}</span></div>
          <div className="grid grid-cols-2 gap-2">
            {[{ l: 'Min', v: stats.min }, { l: 'Max', v: stats.max }, { l: 'Mean', v: stats.mean }, { l: 'Std Dev', v: stats.stddev }].map(s => (
              <div key={s.l} className="bg-secondary/50 rounded-lg p-2">
                <p className="text-[10px] text-muted-foreground">{s.l}</p>
                <p className="text-sm font-semibold text-foreground">{s.v} <span className="text-[10px] text-muted-foreground">{product.unit}</span></p>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <p><span className="text-foreground">Source:</span> {product.source}</p>
            <p><span className="text-foreground">Band:</span> {product.band}</p>
            <p><span className="text-foreground">Resolution:</span> {product.resolution}</p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <InsightPanel productId={selectedId} value={value} area={area} />
          {/* Annual trend mini chart */}
          <div className="mt-3 rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">Annual Average — 2020–2025 · {area.label}</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={annualData}>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<ChartTooltip unit={product.unit} />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {annualData.map((_, i) => <Cell key={i} fill={product.color} opacity={0.5 + i * 0.1} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Multi-year monthly chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Monthly Trend — 2023 to 2025 · {product.label} · {area.label}</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={timeSeries}>
            <defs>
              <linearGradient id="g23" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
              <linearGradient id="g24" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f97316" stopOpacity={0.2} /><stop offset="100%" stopColor="#f97316" stopOpacity={0} /></linearGradient>
              <linearGradient id="g25" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={product.color} stopOpacity={0.25} /><stop offset="100%" stopColor={product.color} stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 14%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={44} />
            <Tooltip content={<ChartTooltip unit={product.unit} />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="2023" stroke="#3b82f6" fill="url(#g23)" strokeWidth={1.5} dot={false} />
            <Area type="monotone" dataKey="2024" stroke="#f97316" fill="url(#g24)" strokeWidth={1.5} dot={false} />
            <Area type="monotone" dataKey="2025" stroke={product.color} fill="url(#g25)" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Comparison Tab ────────────────────────────────────────────────────────────
function ComparisonTab({ area, areaData }) {
  const [leftId, setLeftId] = useState('lst');
  const [rightId, setRightId] = useState('ndvi');
  const leftP = BASE_PRODUCTS.find(p => p.id === leftId);
  const rightP = BASE_PRODUCTS.find(p => p.id === rightId);
  const leftVal = areaData[leftId];
  const rightVal = areaData[rightId];

  const leftTS = useMemo(() => makeTimeSeries(leftId, leftVal), [leftId, leftVal]);
  const rightTS = useMemo(() => makeTimeSeries(rightId, rightVal), [rightId, rightVal]);
  const combined = leftTS.map((d, i) => ({
    month: d.month,
    [leftP.label.split(' — ')[0]]: d['2025'],
    [rightP.label.split(' — ')[0]]: rightTS[i]['2025'],
  }));

  const zoneLeft = makeZoneData(leftId, leftVal);
  const zoneRight = makeZoneData(rightId, rightVal);
  const zoneCompare = AREAS.map((a, i) => ({
    zone: a.label.replace(' Delhi', '').replace(' Chowk', ''),
    [leftP.label.split(' — ')[0]]: AREA_DATA[a.id][leftId],
    [rightP.label.split(' — ')[0]]: AREA_DATA[a.id][rightId],
  }));

  // Radar data normalised 0–100
  const radarData = AREAS.map(a => {
    const lv = AREA_DATA[a.id][leftId];
    const rv = AREA_DATA[a.id][rightId];
    return {
      zone: a.label.replace(' Delhi', '').replace(' Chowk', ''),
      [leftP.label.split(' — ')[0]]: parseFloat(((lv / (leftP.stats_fn(leftVal).max || 1)) * 100).toFixed(1)),
      [rightP.label.split(' — ')[0]]: parseFloat(((rv / (rightP.stats_fn(rightVal).max || 1)) * 100).toFixed(1)),
    };
  });

  // Correlation insight
  const corr = (leftId === 'lst' && rightId === 'ndvi') || (leftId === 'ndvi' && rightId === 'lst')
    ? '🔴 Strong negative correlation (r = −0.89): As NDVI drops, LST rises sharply. Vegetation is the primary thermal regulator.'
    : (leftId === 'lst' && rightId === 'ndbi') || (leftId === 'ndbi' && rightId === 'lst')
    ? '🔴 Strong positive correlation (r = +0.91): Higher built-up density directly drives surface temperature increases.'
    : (leftId === 'uhi' && rightId === 'builtup') || (leftId === 'builtup' && rightId === 'uhi')
    ? '🟠 Strong positive correlation (r = +0.84): Impervious surfaces trap heat and amplify UHI intensity.'
    : `📊 Comparing ${leftP.label.split(' — ')[0]} vs ${rightP.label.split(' — ')[0]} across study areas reveals spatial co-variation patterns across ${area.label} region.`;

  return (
    <div className="space-y-4">
      {/* Selectors + value badges */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Layer A', id: leftId, setId: setLeftId, color: '#3b82f6', product: leftP, value: leftVal },
          { label: 'Layer B', id: rightId, setId: setRightId, color: '#f97316', product: rightP, value: rightVal },
        ].map(sel => (
          <div key={sel.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sel.color }} />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{sel.label}</p>
            </div>
            <Select value={sel.id} onValueChange={sel.setId}>
              <SelectTrigger className="bg-secondary border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASE_PRODUCTS.map(p => <SelectItem key={p.id} value={p.id}>{p.label.split(' — ')[0]}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{area.label} value</span>
                <span className="font-bold" style={{ color: sel.color }}>{sel.value} {sel.product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source</span>
                <span className="text-foreground">{sel.product.source}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Correlation insight */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 flex items-start gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">{corr}</p>
      </div>

      {/* Side-by-side visual */}
      <div className="grid grid-cols-2 gap-4">
        {[{ p: leftP, v: leftVal, c: '#3b82f6' }, { p: rightP, v: rightVal, c: '#f97316' }].map(({ p, v, c }) => (
          <div key={p.id} className="rounded-xl overflow-hidden border border-border">
            <div className={`h-28 bg-gradient-to-br ${p.gradient} relative`}>
              <div className="absolute inset-0 bg-black/25 flex items-end p-3">
                <div>
                  <p className="text-xs font-bold text-white">{p.label.split(' — ')[0]}</p>
                  <p className="text-[10px] text-white/60">{p.source}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xl font-bold text-white">{v}</p>
                  <p className="text-[10px] text-white/60">{p.unit}</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-card">
              <p className="text-[10px] text-muted-foreground">{getInsights(p.id, v, area)[0]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly comparison */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Monthly Trend Comparison — 2025 · {area.label}</p>
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={combined}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 14%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#3b82f6' }} axisLine={false} tickLine={false} width={44} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#f97316' }} axisLine={false} tickLine={false} width={44} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey={leftP.label.split(' — ')[0]} stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey={rightP.label.split(' — ')[0]} stroke="#f97316" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Zone bar comparison */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Zone-by-Zone Comparison — All Study Areas</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={zoneCompare} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
            <YAxis dataKey="zone" type="category" tick={{ fontSize: 10, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={80} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={leftP.label.split(' — ')[0]} fill="#3b82f6" radius={[0, 3, 3, 0]} opacity={0.85} />
            <Bar dataKey={rightP.label.split(' — ')[0]} fill="#f97316" radius={[0, 3, 3, 0]} opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Thermal Summary Tab ───────────────────────────────────────────────────────
function ThermalSummaryTab({ area, areaData }) {
  const riskScore = Math.round(
    (areaData.lst / 55) * 30 +
    (1 - areaData.ndvi) * 20 +
    (areaData.ndbi) * 20 +
    (areaData.uhi / 12) * 20 +
    (areaData.heat_stress / 100) * 10
  );

  const metrics = [
    { label: 'LST', value: areaData.lst, unit: '°C', max: 55, color: '#ef4444', risk: areaData.lst > 48 ? 'Extreme' : areaData.lst > 44 ? 'High' : 'Moderate' },
    { label: 'UHI', value: areaData.uhi, unit: '°C diff', max: 12, color: '#a855f7', risk: areaData.uhi > 9 ? 'Extreme' : areaData.uhi > 6 ? 'High' : 'Moderate' },
    { label: 'Heat Stress', value: areaData.heat_stress, unit: '/100', max: 100, color: '#dc2626', risk: areaData.heat_stress > 85 ? 'Dangerous' : areaData.heat_stress > 70 ? 'High' : 'Moderate' },
    { label: 'NDVI', value: areaData.ndvi, unit: '', max: 0.8, color: '#22c55e', risk: areaData.ndvi < 0.1 ? 'Critical Low' : areaData.ndvi < 0.2 ? 'Low' : 'Moderate' },
    { label: 'NDBI', value: areaData.ndbi, unit: '', max: 1.0, color: '#f97316', risk: areaData.ndbi > 0.6 ? 'Critical High' : areaData.ndbi > 0.4 ? 'High' : 'Moderate' },
    { label: 'Veg Cover', value: areaData.vegetation, unit: '%', max: 100, color: '#16a34a', risk: areaData.vegetation < 8 ? 'Critical Low' : areaData.vegetation < 15 ? 'Low' : 'Moderate' },
  ];

  const RISK_COLORS = { 'Extreme': 'text-red-500', 'Dangerous': 'text-red-500', 'High': 'text-orange-400', 'Critical High': 'text-red-500', 'Critical Low': 'text-red-500', 'Low': 'text-yellow-400', 'Moderate': 'text-emerald-400' };

  return (
    <div className="space-y-4">
      {/* Overall risk */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 flex items-center gap-6">
        <div className="text-center shrink-0">
          <div className="text-5xl font-bold font-mono" style={{ color: riskScore > 75 ? '#ef4444' : riskScore > 55 ? '#f97316' : '#eab308' }}>{riskScore}</div>
          <p className="text-xs text-muted-foreground mt-1">Thermal Risk Score</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: riskScore > 75 ? '#ef4444' : riskScore > 55 ? '#f97316' : '#eab308' }}>
            {riskScore > 75 ? 'EXTREME' : riskScore > 55 ? 'HIGH' : 'MODERATE'}
          </p>
        </div>
        <div className="flex-1 space-y-1.5">
          <p className="text-sm font-bold text-foreground">{area.label} — Thermal Assessment</p>
          <p className="text-xs text-muted-foreground">Area: {area.area_km2} km² · Population: {area.population}</p>
          <div className="h-2 rounded-full bg-secondary overflow-hidden mt-2">
            <div className="h-full rounded-full transition-all" style={{ width: `${riskScore}%`, background: `linear-gradient(90deg, #22c55e, #eab308, #ef4444)` }} />
          </div>
          <p className="text-[10px] text-muted-foreground">Composite score from LST, UHI, NDVI, NDBI, Heat Stress Index</p>
        </div>
      </div>

      {/* Per-metric breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">{m.label}</p>
              <span className={`text-[10px] font-bold ${RISK_COLORS[m.risk] || 'text-muted-foreground'}`}>{m.risk}</span>
            </div>
            <p className="text-2xl font-bold font-mono mb-2" style={{ color: m.color }}>{m.value}<span className="text-sm text-muted-foreground ml-1">{m.unit}</span></p>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%`, backgroundColor: m.color }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{getInsights(
              m.label === 'LST' ? 'lst' : m.label === 'UHI' ? 'uhi' : m.label === 'Heat Stress' ? 'heat_stress' : m.label === 'NDVI' ? 'ndvi' : m.label === 'NDBI' ? 'ndbi' : 'vegetation',
              m.value, area)[0]}</p>
          </div>
        ))}
      </div>

      {/* Cross-zone thermal table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Full Zone Thermal Data Table</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2.5 text-muted-foreground font-medium">Zone</th>
                <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">LST °C</th>
                <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">UHI °C</th>
                <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">NDVI</th>
                <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">NDBI</th>
                <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Heat Stress</th>
                <th className="text-right px-3 py-2.5 text-muted-foreground font-medium">Veg %</th>
                <th className="text-right px-4 py-2.5 text-muted-foreground font-medium">Risk</th>
              </tr>
            </thead>
            <tbody>
              {AREAS.sort((a, b) => AREA_DATA[b.id].lst - AREA_DATA[a.id].lst).map(a => {
                const d = AREA_DATA[a.id];
                const r = Math.round((d.lst / 55) * 30 + (1 - d.ndvi) * 20 + d.ndbi * 20 + (d.uhi / 12) * 20 + (d.heat_stress / 100) * 10);
                const rColor = r > 75 ? 'text-red-400' : r > 55 ? 'text-orange-400' : 'text-yellow-400';
                const rLabel = r > 75 ? 'Extreme' : r > 55 ? 'High' : 'Moderate';
                const isSelected = a.id === area.id;
                return (
                  <tr key={a.id} className={`border-b border-border/50 ${isSelected ? 'bg-primary/5' : 'hover:bg-secondary/30'} transition-colors`}>
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {isSelected && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2" />}
                      {a.label}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-red-400">{d.lst}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-purple-400">{d.uhi}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-emerald-400">{d.ndvi}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-orange-400">{d.ndbi}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-red-300">{d.heat_stress}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-green-400">{d.vegetation}%</td>
                    <td className={`px-4 py-2.5 text-right font-bold ${rColor}`}>{rLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SatelliteAnalytics() {
  const [areaId, setAreaId] = useState('delhi_ncr');
  const [expandedProduct, setExpandedProduct] = useState(null);
  const { progress, done } = useProcessing(areaId);

  const area = AREAS.find(a => a.id === areaId);
  const areaData = AREA_DATA[areaId];

  // Build products with area-specific values
  const products = BASE_PRODUCTS.map(p => ({
    ...p,
    current: areaData[p.id],
    stats: p.stats_fn(areaData[p.id]),
  }));

  const expandedWithValue = expandedProduct ? products.find(p => p.id === expandedProduct.id) : null;

  const PIPELINE_STEPS = ['Ingest', 'Calibrate', 'Atm. Correct', 'Band Math', 'Index Compute', 'Classify', 'Mosaic', 'Export'];
  const overallProgress = Math.round(Object.values(progress).reduce((s, v) => s + v, 0) / (BASE_PRODUCTS.length * 100) * 100);

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={Satellite} title="Satellite Analytics Engine" subtitle="Active thermal processing — select study area to analyse">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <Select value={areaId} onValueChange={setAreaId}>
            <SelectTrigger className="w-52 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AREAS.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.label} — {a.area_km2} km²</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {done && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Analysis Ready</span>
            </div>
          )}
        </div>
      </PageHeader>

      {/* Processing pipeline */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cpu className={`w-4 h-4 ${done ? 'text-emerald-400' : 'text-primary animate-pulse'}`} />
            <h3 className="text-sm font-heading font-semibold text-foreground">Processing Pipeline — {area.label}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground">{overallProgress}%</span>
            {done ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-primary">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Processing
              </span>
            )}
          </div>
        </div>
        {/* Overall bar */}
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden mb-3">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-300" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {PIPELINE_STEPS.map((step, i) => {
            const pct = Math.min(100, Math.round((overallProgress / 100) * (i + 1) * (100 / PIPELINE_STEPS.length) * 1.4));
            const done_step = pct >= 100;
            return (
              <div key={step} className="text-center">
                <div className="flex items-center justify-center mb-1.5">
                  <div className={`w-full h-1.5 rounded-full ${done_step ? 'bg-emerald-500' : pct > 0 ? 'bg-primary' : 'bg-secondary'}`} />
                </div>
                <p className={`text-[10px] leading-tight ${done_step ? 'text-emerald-400' : 'text-muted-foreground'}`}>{step}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products">
        <TabsList className="bg-secondary">
          <TabsTrigger value="products">Generated Products</TabsTrigger>
          <TabsTrigger value="thermal">Thermal Summary</TabsTrigger>
          <TabsTrigger value="timeseries">Time Series</TabsTrigger>
          <TabsTrigger value="comparison">Layer Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <SatelliteProduct
                key={p.id}
                product={p}
                value={p.current}
                progress={progress[p.id] || 0}
                area={area}
                onExpand={setExpandedProduct}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="thermal" className="mt-4">
          <ThermalSummaryTab area={area} areaData={areaData} />
        </TabsContent>

        <TabsContent value="timeseries" className="mt-4">
          <TimeSeriesTab area={area} areaData={areaData} />
        </TabsContent>

        <TabsContent value="comparison" className="mt-4">
          <ComparisonTab area={area} areaData={areaData} />
        </TabsContent>
      </Tabs>

      {/* Data source status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { name: 'Landsat 8/9 Collection 2', scenes: 342, status: 'Active', lat: new Date().toISOString().split('T')[0] },
          { name: 'Sentinel-2 L2A', scenes: 1204, status: 'Active', lat: new Date().toISOString().split('T')[0] },
          { name: 'MODIS MOD11A2', scenes: 2156, status: 'Active', lat: new Date().toISOString().split('T')[0] },
          { name: 'ECOSTRESS L2', scenes: 118, status: 'Active', lat: new Date().toISOString().split('T')[0] },
        ].map(ds => (
          <div key={ds.name} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-[11px] font-semibold text-foreground">{ds.name}</h4>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Scenes</span><span className="font-mono text-foreground">{ds.scenes}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last sync</span><span className="font-mono text-foreground">{ds.lat}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Product detail modal */}
      {expandedProduct && expandedWithValue && (
        <ProductModal
          product={expandedWithValue}
          value={expandedWithValue.current}
          area={area}
          onClose={() => setExpandedProduct(null)}
        />
      )}
    </div>
  );
}