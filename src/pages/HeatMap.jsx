import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Map, Eye, RefreshCw, Flame } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

// ── Real Indian cities with Open-Meteo coords ──────────────────────────────
const INDIA_CITIES = [
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi' },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  { name: 'Jodhpur', lat: 26.2389, lon: 73.0243, state: 'Rajasthan' },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882, state: 'Maharashtra' },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' },
  { name: 'Kanpur', lat: 26.4499, lon: 80.3319, state: 'Uttar Pradesh' },
  { name: 'Bhopal', lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh' },
  { name: 'Indore', lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh' },
  { name: 'Patna', lat: 25.5941, lon: 85.1376, state: 'Bihar' },
  { name: 'Surat', lat: 21.1702, lon: 72.8311, state: 'Gujarat' },
  { name: 'Vadodara', lat: 22.3072, lon: 73.1812, state: 'Gujarat' },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, state: 'Andhra Pradesh' },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu' },
  { name: 'Kochi', lat: 9.9312, lon: 76.2673, state: 'Kerala' },
  { name: 'Guwahati', lat: 26.1445, lon: 91.7362, state: 'Assam' },
  { name: 'Ranchi', lat: 23.3441, lon: 85.3096, state: 'Jharkhand' },
  { name: 'Varanasi', lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh' },
  { name: 'Amritsar', lat: 31.6340, lon: 74.8723, state: 'Punjab' },
  { name: 'Ludhiana', lat: 30.9010, lon: 75.8573, state: 'Punjab' },
  { name: 'Agra', lat: 27.1767, lon: 78.0081, state: 'Uttar Pradesh' },
  { name: 'Meerut', lat: 28.9845, lon: 77.7064, state: 'Uttar Pradesh' },
  { name: 'Faridabad', lat: 28.4089, lon: 77.3178, state: 'Haryana' },
  { name: 'Gurgaon', lat: 28.4595, lon: 77.0266, state: 'Haryana' },
];

// ── Industrial / heat epicenter zones across India ─────────────────────────
const HEAT_EPICENTERS = [
  // Delhi NCR industrial belt
  { lat: 28.6672, lon: 77.4381, name: 'Noida Industrial', type: 'industrial', lst: 49.2 },
  { lat: 28.5501, lon: 77.2588, name: 'Okhla Industrial', type: 'industrial', lst: 51.1 },
  { lat: 28.7350, lon: 77.1022, name: 'Rohini Dense Urban', type: 'urban', lst: 47.3 },
  { lat: 28.4595, lon: 77.0266, name: 'Gurgaon IT Hub', type: 'commercial', lst: 45.8 },
  { lat: 28.6838, lon: 77.3163, name: 'Shahdara Urban', type: 'urban', lst: 48.9 },
  { lat: 28.5706, lon: 77.3219, name: 'Delhi-Noida Expressway', type: 'transport', lst: 46.5 },
  // Mumbai
  { lat: 19.0760, lon: 72.8777, name: 'Mumbai CST Area', type: 'urban', lst: 38.2 },
  { lat: 19.1136, lon: 72.8697, name: 'Dharavi Dense', type: 'urban', lst: 40.1 },
  { lat: 19.0330, lon: 73.0297, name: 'Navi Mumbai Industrial', type: 'industrial', lst: 42.7 },
  { lat: 18.9548, lon: 72.8192, name: 'BKC Commercial', type: 'commercial', lst: 39.3 },
  // Chennai
  { lat: 13.0827, lon: 80.2707, name: 'Chennai Urban Core', type: 'urban', lst: 43.8 },
  { lat: 12.8996, lon: 80.2209, name: 'Mahindra World City', type: 'industrial', lst: 45.2 },
  { lat: 13.0667, lon: 80.2000, name: 'Anna Nagar Dense', type: 'urban', lst: 42.1 },
  // Rajasthan hot zones
  { lat: 26.9124, lon: 75.7873, name: 'Jaipur Urban', type: 'urban', lst: 46.9 },
  { lat: 26.2389, lon: 73.0243, name: 'Jodhpur Desert Urban', type: 'urban', lst: 51.7 },
  { lat: 27.9767, lon: 74.7361, name: 'Bikaner Arid Zone', type: 'arid', lst: 53.4 },
  { lat: 25.7500, lon: 73.3500, name: 'Barmer Desert', type: 'arid', lst: 55.8 },
  // Gujarat industrial
  { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad Industrial', type: 'industrial', lst: 47.6 },
  { lat: 21.6280, lon: 72.9550, name: 'Hazira Chemical Zone', type: 'industrial', lst: 50.3 },
  { lat: 22.3072, lon: 73.1812, name: 'Vadodara Industrial', type: 'industrial', lst: 46.1 },
  { lat: 21.1702, lon: 72.8311, name: 'Surat Textile Zone', type: 'industrial', lst: 44.9 },
  // UP industrial
  { lat: 26.4499, lon: 80.3319, name: 'Kanpur Industrial', type: 'industrial', lst: 48.3 },
  { lat: 26.8467, lon: 80.9462, name: 'Lucknow Urban', type: 'urban', lst: 45.6 },
  { lat: 28.9845, lon: 77.7064, name: 'Meerut Industrial', type: 'industrial', lst: 47.1 },
  // MP
  { lat: 22.7196, lon: 75.8577, name: 'Indore Industrial', type: 'industrial', lst: 44.2 },
  { lat: 23.2599, lon: 77.4126, name: 'Bhopal Urban', type: 'urban', lst: 43.5 },
  // Eastern
  { lat: 22.5726, lon: 88.3639, name: 'Kolkata Howrah', type: 'industrial', lst: 39.8 },
  { lat: 22.7082, lon: 88.3978, name: 'Kolkata Industrial', type: 'industrial', lst: 41.2 },
  { lat: 23.3441, lon: 85.3096, name: 'Ranchi Mining Zone', type: 'industrial', lst: 42.7 },
  // South
  { lat: 17.3850, lon: 78.4867, name: 'Hyderabad HITEC', type: 'commercial', lst: 40.3 },
  { lat: 17.4700, lon: 78.5800, name: 'Hyderabad Outer Ring', type: 'transport', lst: 43.1 },
  { lat: 12.9716, lon: 77.5946, name: 'Bengaluru Urban', type: 'commercial', lst: 35.8 },
  { lat: 17.6868, lon: 83.2185, name: 'Visakhapatnam Port', type: 'industrial', lst: 41.5 },
  // Power plants
  { lat: 23.8000, lon: 86.4000, name: 'Bokaro Power Plant', type: 'power', lst: 48.9 },
  { lat: 27.5000, lon: 77.7000, name: 'Mathura Refinery', type: 'industrial', lst: 49.4 },
  { lat: 21.0000, lon: 79.0000, name: 'Koradi Thermal Plant', type: 'power', lst: 52.1 },
  { lat: 28.3500, lon: 79.5000, name: 'Bareilly Industrial', type: 'industrial', lst: 46.8 },
];

const EPICENTER_COLORS = {
  industrial: { fill: '#ef4444', border: '#dc2626', label: 'Industrial' },
  urban: { fill: '#f97316', border: '#ea580c', label: 'Urban' },
  commercial: { fill: '#eab308', border: '#ca8a04', label: 'Commercial' },
  transport: { fill: '#a855f7', border: '#9333ea', label: 'Transport' },
  arid: { fill: '#fbbf24', border: '#f59e0b', label: 'Arid Zone' },
  power: { fill: '#ff0000', border: '#b91c1c', label: 'Power Plant' },
};

function getTempColor(temp) {
  if (!temp) return '#3b82f6';
  if (temp < 30) return '#3b82f6';
  if (temp < 35) return '#22c55e';
  if (temp < 40) return '#eab308';
  if (temp < 45) return '#f97316';
  if (temp < 50) return '#ef4444';
  return '#7f1d1d';
}

function HeatLegend() {
  const items = [
    { label: '< 30°C', color: '#3b82f6' },
    { label: '30–35°C', color: '#22c55e' },
    { label: '35–40°C', color: '#eab308' },
    { label: '40–45°C', color: '#f97316' },
    { label: '45–50°C', color: '#ef4444' },
    { label: '> 50°C', color: '#7f1d1d' },
  ];
  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-card/95 backdrop-blur border border-border rounded-xl p-3">
      <p className="text-xs font-semibold text-foreground mb-2">Temperature Scale</p>
      <div className="space-y-1">
        {items.map(i => (
          <div key={i.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: i.color }} />
            <span className="text-[10px] text-muted-foreground">{i.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-border space-y-1">
        <p className="text-[10px] font-semibold text-foreground mb-1">Epicenters</p>
        {Object.entries(EPICENTER_COLORS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2" style={{ backgroundColor: v.fill + '44', borderColor: v.fill }} />
            <span className="text-[10px] text-muted-foreground">{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IndiaHeatmapLayer({ cities, showEpicenters }) {
  return (
    <>
      {/* Real city temperature markers */}
      {cities.map((city) => (
        <CircleMarker
          key={city.name}
          center={[city.lat, city.lon]}
          radius={city.temp ? Math.max(18, (city.temp - 20) * 1.2) : 14}
          pathOptions={{
            color: getTempColor(city.temp),
            fillColor: getTempColor(city.temp),
            fillOpacity: 0.35,
            weight: 1.5,
          }}
        >
          <Popup>
            <div className="text-xs space-y-1 min-w-[180px]">
              <p className="font-bold text-sm">{city.name}</p>
              <p className="text-gray-500">{city.state}</p>
              {city.temp ? (
                <>
                  <div className="flex justify-between"><span>Temperature:</span><span className="font-semibold">{city.temp}°C</span></div>
                  <div className="flex justify-between"><span>Feels Like:</span><span className="font-semibold">{city.feels_like}°C</span></div>
                  <div className="flex justify-between"><span>Humidity:</span><span>{city.humidity}%</span></div>
                  <div className="flex justify-between"><span>Wind Speed:</span><span>{city.wind_speed} km/h</span></div>
                  {city.heat_index && <div className="flex justify-between"><span>Heat Index:</span><span className="font-semibold text-orange-600">{city.heat_index}°C</span></div>}
                </>
              ) : (
                <p className="text-gray-400">Loading data...</p>
              )}
              <p className="text-[10px] text-gray-400 pt-1">Source: Open-Meteo API (Live)</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Heat epicenters */}
      {showEpicenters && HEAT_EPICENTERS.map((ep, i) => {
        const style = EPICENTER_COLORS[ep.type] || EPICENTER_COLORS.industrial;
        return (
          <CircleMarker
            key={i}
            center={[ep.lat, ep.lon]}
            radius={8}
            pathOptions={{
              color: style.border,
              fillColor: style.fill,
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[160px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.fill }} />
                  <p className="font-bold text-sm">{ep.name}</p>
                </div>
                <div className="flex justify-between"><span>Zone Type:</span><span className="font-semibold capitalize">{ep.type}</span></div>
                <div className="flex justify-between"><span>Est. LST:</span><span className="font-semibold" style={{ color: getTempColor(ep.lst) }}>{ep.lst}°C</span></div>
                <p className="text-[10px] text-gray-400 pt-1">Heat epicenter (~5km zone)</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export default function HeatMap() {
  const [cities, setCities] = useState(INDIA_CITIES.map(c => ({ ...c, temp: null })));
  const [showEpicenters, setShowEpicenters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeLayer, setActiveLayer] = useState('LST');

  const fetchWeatherData = useCallback(async () => {
    setLoading(true);
    try {
      // Batch fetch: Open-Meteo allows comma-separated lat/lon lists
      const lats = INDIA_CITIES.map(c => c.lat).join(',');
      const lons = INDIA_CITIES.map(c => c.lon).join(',');
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m&wind_speed_unit=kmh&forecast_days=1`;

      const res = await fetch(url);
      const json = await res.json();

      // API returns array when multiple locations
      const results = Array.isArray(json) ? json : [json];
      setCities(INDIA_CITIES.map((city, i) => {
        const d = results[i];
        const temp = d?.current?.temperature_2m;
        const feels = d?.current?.apparent_temperature;
        return {
          ...city,
          temp: temp != null ? Math.round(temp * 10) / 10 : null,
          feels_like: feels != null ? Math.round(feels * 10) / 10 : null,
          humidity: d?.current?.relative_humidity_2m ?? null,
          wind_speed: d?.current?.wind_speed_10m ?? null,
          heat_index: feels != null && temp != null ? Math.round(Math.max(temp, feels) * 10) / 10 : null,
        };
      }));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Weather fetch failed', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchWeatherData]);

  const hotCities = [...cities].filter(c => c.temp).sort((a, b) => b.temp - a.temp).slice(0, 5);

  return (
    <div className="p-6 space-y-4">
      <PageHeader icon={Map} title="India Real-Time Heat Map" subtitle="Live temperature data + industrial heat epicenters">
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground">Updated: {lastUpdated}</span>
          )}
          <Button size="sm" variant="outline" onClick={fetchWeatherData} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            variant={showEpicenters ? 'default' : 'outline'}
            onClick={() => setShowEpicenters(v => !v)}
            className="gap-1.5"
          >
            <Flame className="w-3.5 h-3.5" />
            Epicenters
          </Button>
        </div>
      </PageHeader>

      {/* Top hot cities bar */}
      {hotCities.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium">🔥 HOTTEST NOW:</span>
          {hotCities.map(c => (
            <div key={c.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card whitespace-nowrap">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getTempColor(c.temp) }} />
              <span className="text-xs text-foreground font-medium">{c.name}</span>
              <span className="text-xs font-bold" style={{ color: getTempColor(c.temp) }}>{c.temp}°C</span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden relative" style={{ height: 'calc(100vh - 240px)' }}>
        <MapContainer
          center={[22.5, 82.0]}
          zoom={5}
          className="h-full w-full"
          style={{ background: '#030712' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com">CARTO</a>'
          />
          <IndiaHeatmapLayer cities={cities} showEpicenters={showEpicenters} />
          <HeatLegend />
        </MapContainer>

        {/* Layer info */}
        <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur border border-border rounded-xl p-3 max-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Live Data</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-auto" />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {loading ? 'Fetching live temperatures...' : `${cities.filter(c => c.temp).length} cities loaded · Open-Meteo API`}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {HEAT_EPICENTERS.length} heat epicenters mapped across India
          </p>
        </div>

        {/* Stats overlay bottom-right */}
        <div className="absolute bottom-6 right-6 z-[1000] space-y-2">
          {hotCities[0] && (
            <div className="bg-card/95 backdrop-blur border border-red-500/40 rounded-xl p-3 text-center">
              <p className="text-[10px] text-muted-foreground">Hottest City</p>
              <p className="text-lg font-bold text-red-400">{hotCities[0].temp}°C</p>
              <p className="text-xs text-foreground font-medium">{hotCities[0].name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}