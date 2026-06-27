import React, { useState, useEffect } from 'react';
import FloatingChatbot from '@/components/chatbot/FloatingChatbot';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import {
  Thermometer, Flame, TreePine, AlertTriangle, MapPin, Building2, Satellite, BarChart3, Zap
} from 'lucide-react';
import MetricCard from '@/components/shared/MetricCard';
import LiveWeatherWidget from '@/components/weather/LiveWeatherWidget';
import HeroSection from '@/components/hero/HeroSection';
import HeatGauge from '@/components/shared/HeatGauge';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TEMP_TREND = [
  { month: 'Jan', temp: 22.4, uhi: 3.1 }, { month: 'Feb', temp: 26.8, uhi: 3.6 },
  { month: 'Mar', temp: 32.1, uhi: 4.8 }, { month: 'Apr', temp: 38.5, uhi: 5.9 },
  { month: 'May', temp: 43.2, uhi: 6.7 }, { month: 'Jun', temp: 44.8, uhi: 7.2 },
  { month: 'Jul', temp: 42.3, uhi: 6.8 }, { month: 'Aug', temp: 38.1, uhi: 5.4 },
  { month: 'Sep', temp: 36.4, uhi: 5.1 }, { month: 'Oct', temp: 33.2, uhi: 4.5 },
  { month: 'Nov', temp: 28.6, uhi: 3.8 }, { month: 'Dec', temp: 23.1, uhi: 3.2 },
];

const PIE_DATA = [
  { name: 'Extreme', value: 3, color: '#f87171' },
  { name: 'High', value: 3, color: '#fb923c' },
  { name: 'Moderate', value: 1, color: '#facc15' },
  { name: 'Low', value: 1, color: '#34d399' },
];

const DATA_SOURCES = [
  { name: 'Landsat 8/9', status: 'active' }, { name: 'Sentinel-2', status: 'active' },
  { name: 'MODIS', status: 'active' }, { name: 'ECOSTRESS', status: 'active' },
  { name: 'ERA5 Climate', status: 'active' }, { name: 'NASA POWER', status: 'active' },
  { name: 'OpenWeather', status: 'active' }, { name: 'Google Earth Engine', status: 'active' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}°C
        </p>
      ))}
    </div>
  );
};

export default function Home() {
  const [cities, setCities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.CityProfile.list(),
      base44.entities.HeatwaveAlert.list(),
      base44.entities.HeatHotspot.list(),
    ]).then(([c, a, h]) => {
      setCities(c);
      setAlerts(a);
      setHotspots(h);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto animate-pulse">
            <Thermometer className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading HEATSHIELD AI...</p>
        </div>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.is_active);
  const extremeHotspots = hotspots.filter(h => h.risk_level === 'extreme');
  const delhi = cities.find(c => c.name === 'Delhi');

  return (
    <div>
      {/* Hero Section with 3D Globe */}
      <HeroSection />

      {/* Dashboard Content */}
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">HEATSHIELD AI</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Urban Heat Intelligence Platform</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">System Active</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground">
              Last Sync: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Active Alert Banner */}
        {activeAlerts.filter(a => a.alert_level === 'red').map(alert => (
          <Link key={alert.id} to="/alerts" className="block">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center gap-4 hover:bg-red-500/15 transition-colors">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-400">{alert.title}</p>
                <p className="text-xs text-red-400/70 mt-0.5">{alert.description}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                ACTIVE
              </span>
            </div>
          </Link>
        ))}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard icon={Thermometer} label="Max LST" value={delhi?.max_lst || 51.7} unit="°C" color="danger" trend={2.3} trendLabel="vs last year" />
          <MetricCard icon={Flame} label="UHI Intensity" value={delhi?.uhi_intensity || 6.8} unit="°C" color="warning" trend={1.1} trendLabel="vs avg" />
          <MetricCard icon={TreePine} label="Green Cover" value={delhi?.green_cover_pct || 15.2} unit="%" color="success" trend={-0.8} trendLabel="declining" />
          <MetricCard icon={AlertTriangle} label="Active Alerts" value={activeAlerts.length} color="danger" />
          <MetricCard icon={MapPin} label="Extreme Zones" value={extremeHotspots.length} color="warning" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Temperature Trend */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-heading font-semibold text-foreground">Temperature & UHI Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly land surface temperature analysis</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">Delhi NCR · 2025</span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={TEMP_TREND}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="uhiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="temp" name="LST" stroke="#ef4444" fill="url(#tempGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="uhi" name="UHI" stroke="#f97316" fill="url(#uhiGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Heat Risk Score */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-4">City Heat Risk Score</h3>
            <div className="flex justify-center mb-4">
              <HeatGauge value={delhi?.heat_risk_score || 92} max={100} label="Delhi NCR" size="lg" />
            </div>
            <div className="space-y-2 mt-4">
              {PIE_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-muted-foreground">{d.name} Risk Zones</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* City Comparison */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-4">City Heat Comparison</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cities.slice(0, 5)}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215 20% 55%)' }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="avg_lst" name="Avg LST" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max_lst" name="Max LST" fill="#7f1d1d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Live Weather */}
          <LiveWeatherWidget />
        </div>

        {/* Third Row - Data Sources */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Satellite className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-heading font-semibold text-foreground">Data Sources</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DATA_SOURCES.map(ds => (
              <div key={ds.name} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-secondary/50">
                <span className="text-xs text-foreground">{ds.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { path: '/heat-map', icon: MapPin, label: 'Heat Map', color: 'text-red-400' },
            { path: '/satellite', icon: Satellite, label: 'Satellite', color: 'text-sky-400' },
            { path: '/hotspots', icon: Flame, label: 'Hotspots', color: 'text-orange-400' },
            { path: '/drivers', icon: BarChart3, label: 'SHAP Analysis', color: 'text-purple-400' },
            { path: '/simulator', icon: Zap, label: 'Simulator', color: 'text-emerald-400' },
            { path: '/copilot', icon: Building2, label: 'AI Copilot', color: 'text-sky-400' },
          ].map(q => (
            <Link key={q.path} to={q.path} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors group">
              <q.icon className={`w-5 h-5 ${q.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <FloatingChatbot />
    </div>
  );
}