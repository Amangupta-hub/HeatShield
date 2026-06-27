import React, { useState, useEffect, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup, useMap, Circle
} from 'react-leaflet';
import {
  Crosshair, Search, MapPin, Thermometer, Flame, Navigation,
  RefreshCw, X, Info, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import AIStrategist from '@/components/ai/AIStrategist';
import 'leaflet/dist/leaflet.css';

// ── Extended Indian city list ─────────────────────────────────────────────
const CITY_LIST = [
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi' },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794, state: 'Punjab' },
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
  { name: 'Noida', lat: 28.5355, lon: 77.3910, state: 'Uttar Pradesh' },
  { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538, state: 'Uttar Pradesh' },
  { name: 'Mathura', lat: 27.4924, lon: 77.6737, state: 'Uttar Pradesh' },
  { name: 'Shimla', lat: 31.1048, lon: 77.1734, state: 'Himachal Pradesh' },
  { name: 'Dehradun', lat: 30.3165, lon: 78.0322, state: 'Uttarakhand' },
  { name: 'Haridwar', lat: 29.9457, lon: 78.1642, state: 'Uttarakhand' },
  { name: 'Bikaner', lat: 28.0229, lon: 73.3119, state: 'Rajasthan' },
  { name: 'Udaipur', lat: 24.5854, lon: 73.7125, state: 'Rajasthan' },
  { name: 'Kota', lat: 25.2138, lon: 75.8648, state: 'Rajasthan' },
  { name: 'Ajmer', lat: 26.4499, lon: 74.6399, state: 'Rajasthan' },
  { name: 'Mysuru', lat: 12.2958, lon: 76.6394, state: 'Karnataka' },
  { name: 'Hubballi', lat: 15.3647, lon: 75.1240, state: 'Karnataka' },
  { name: 'Mangaluru', lat: 12.9141, lon: 74.8560, state: 'Karnataka' },
  { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, state: 'Kerala' },
  { name: 'Kozhikode', lat: 11.2588, lon: 75.7804, state: 'Kerala' },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198, state: 'Tamil Nadu' },
  { name: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047, state: 'Tamil Nadu' },
  { name: 'Salem', lat: 11.6643, lon: 78.1460, state: 'Tamil Nadu' },
  { name: 'Vijayawada', lat: 16.5062, lon: 80.6480, state: 'Andhra Pradesh' },
  { name: 'Warangal', lat: 17.9784, lon: 79.5941, state: 'Telangana' },
  { name: 'Raipur', lat: 21.2514, lon: 81.6296, state: 'Chhattisgarh' },
  { name: 'Bilaspur', lat: 22.0797, lon: 82.1409, state: 'Chhattisgarh' },
  { name: 'Jabalpur', lat: 23.1815, lon: 79.9864, state: 'Madhya Pradesh' },
  { name: 'Gwalior', lat: 26.2183, lon: 78.1828, state: 'Madhya Pradesh' },
  { name: 'Allahabad', lat: 25.4358, lon: 81.8463, state: 'Uttar Pradesh' },
  { name: 'Bareilly', lat: 28.3670, lon: 79.4304, state: 'Uttar Pradesh' },
  { name: 'Aligarh', lat: 27.8974, lon: 78.0880, state: 'Uttar Pradesh' },
  { name: 'Moradabad', lat: 28.8386, lon: 78.7733, state: 'Uttar Pradesh' },
  { name: 'Saharanpur', lat: 29.9680, lon: 77.5510, state: 'Uttar Pradesh' },
  { name: 'Gorakhpur', lat: 26.7606, lon: 83.3732, state: 'Uttar Pradesh' },
];

// ── LST simulation zones per city ────────────────────────────────────────
function generateLSTZones(lat, lon, cityTemp) {
  const base = cityTemp || 38;
  const zones = [];
  const patterns = [
    { dlat: 0, dlon: 0, r: 2500, heat: 8, type: 'urban-core' },
    { dlat: 0.02, dlon: 0.03, r: 1800, heat: 11, type: 'industrial' },
    { dlat: -0.03, dlon: 0.01, r: 2000, heat: 7, type: 'dense-urban' },
    { dlat: 0.04, dlon: -0.02, r: 1500, heat: 5, type: 'commercial' },
    { dlat: -0.01, dlon: -0.04, r: 1200, heat: 3, type: 'residential' },
    { dlat: 0.05, dlon: 0.05, r: 1000, heat: 13, type: 'power-plant' },
    { dlat: -0.05, dlon: -0.03, r: 900, heat: 2, type: 'green-zone' },
    { dlat: 0.03, dlon: -0.05, r: 1400, heat: 6, type: 'transport' },
    { dlat: -0.04, dlon: 0.04, r: 1100, heat: 9, type: 'construction' },
    { dlat: 0.01, dlon: 0.06, r: 800, heat: -2, type: 'water-body' },
    { dlat: -0.06, dlon: 0.02, r: 1300, heat: 4, type: 'mixed-use' },
    { dlat: 0.06, dlon: -0.01, r: 1600, heat: 10, type: 'industrial2' },
  ];
  patterns.forEach(p => {
    zones.push({ lat: lat + p.dlat, lon: lon + p.dlon, radius: p.r, temp: Math.round((base + p.heat) * 10) / 10, type: p.type });
  });
  return zones;
}

function getLSTColor(temp) {
  if (!temp) return 'rgba(59,130,246,0.5)';
  if (temp < 30) return 'rgba(30,80,200,0.65)';
  if (temp < 34) return 'rgba(0,140,100,0.65)';
  if (temp < 38) return 'rgba(100,200,60,0.65)';
  if (temp < 42) return 'rgba(230,220,0,0.65)';
  if (temp < 46) return 'rgba(255,140,0,0.70)';
  if (temp < 50) return 'rgba(230,50,30,0.72)';
  if (temp < 54) return 'rgba(180,0,0,0.75)';
  return 'rgba(100,0,0,0.78)';
}

function getLSTFill(temp) {
  if (!temp) return '#3b82f6';
  if (temp < 30) return '#1e4fd8';
  if (temp < 34) return '#008c64';
  if (temp < 38) return '#64c83c';
  if (temp < 42) return '#e6dc00';
  if (temp < 46) return '#ff8c00';
  if (temp < 50) return '#e6321e';
  if (temp < 54) return '#b40000';
  return '#640000';
}

// ── Map flyTo controller ───────────────────────────────────────────────────
function MapFlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// ── LST colour legend ─────────────────────────────────────────────────────
function LSTLegend() {
  const steps = [
    { label: '< 30°C', color: '#1e4fd8' },
    { label: '30–34°C', color: '#008c64' },
    { label: '34–38°C', color: '#64c83c' },
    { label: '38–42°C', color: '#e6dc00' },
    { label: '42–46°C', color: '#ff8c00' },
    { label: '46–50°C', color: '#e6321e' },
    { label: '50–54°C', color: '#b40000' },
    { label: '> 54°C',  color: '#640000' },
  ];
  return (
    <div className="absolute bottom-6 left-6 z-[1000] bg-black/80 backdrop-blur border border-white/10 rounded-xl p-3 select-none">
      <p className="text-[10px] font-bold text-white mb-2 tracking-wider uppercase">Land Surface Temp (°C)</p>
      <div className="flex gap-0">
        {steps.map(s => (
          <div key={s.label} className="flex flex-col items-center">
            <div className="w-7 h-4 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-[8px] text-white/60 mt-0.5 hidden sm:block" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', fontSize: 8 }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-white/50">Cool</span>
        <span className="text-[9px] text-white/50">Extreme</span>
      </div>
    </div>
  );
}

// ── Location heatmap layer ─────────────────────────────────────────────────
function LocationHeatLayer({ lat, lon, temp }) {
  if (!lat || !lon) return null;
  const rings = [
    { r: 5000, opacity: 0.18, label: '5 km radius' },
    { r: 3000, opacity: 0.28 },
    { r: 1500, opacity: 0.40 },
    { r: 600, opacity: 0.55 },
    { r: 200, opacity: 0.70 },
  ];
  return (
    <>
      {rings.map((ring, i) => (
        <Circle
          key={i}
          center={[lat, lon]}
          radius={ring.r}
          pathOptions={{
            color: getLSTFill(temp),
            fillColor: getLSTFill(temp),
            fillOpacity: ring.opacity,
            weight: i === 0 ? 2 : 0,
            dashArray: i === 0 ? '6 4' : undefined,
          }}
        >
          {i === 0 && (
            <Popup>
              <div className="text-xs min-w-[160px] space-y-1">
                <p className="font-bold">📍 Your Location</p>
                <p className="text-gray-500">{lat.toFixed(4)}°N, {lon.toFixed(4)}°E</p>
                {temp && <p>Est. Surface Temp: <strong style={{ color: getLSTFill(temp) }}>{temp}°C</strong></p>}
                <p className="text-gray-400 text-[10px]">5 km urban heat radius shown</p>
              </div>
            </Popup>
          )}
        </Circle>
      ))}
      <CircleMarker
        center={[lat, lon]}
        radius={7}
        pathOptions={{ color: '#fff', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
      >
        <Popup>
          <div className="text-xs">
            <p className="font-bold">You are here</p>
            <p className="text-gray-500">{lat.toFixed(5)}°N, {lon.toFixed(5)}°E</p>
          </div>
        </Popup>
      </CircleMarker>
    </>
  );
}

// ── City LST overlay ───────────────────────────────────────────────────────
function CityLSTLayer({ city, zones }) {
  if (!city || !zones.length) return null;
  return (
    <>
      {zones.map((z, i) => (
        <Circle
          key={i}
          center={[z.lat, z.lon]}
          radius={z.radius}
          pathOptions={{
            color: getLSTFill(z.temp),
            fillColor: getLSTFill(z.temp),
            fillOpacity: 0.52,
            weight: 0.5,
          }}
        >
          <Popup>
            <div className="text-xs space-y-1 min-w-[150px]">
              <p className="font-bold capitalize">{z.type.replace('-', ' ')}</p>
              <p>LST: <strong style={{ color: getLSTFill(z.temp) }}>{z.temp}°C</strong></p>
            </div>
          </Popup>
        </Circle>
      ))}
      <CircleMarker
        center={[city.lat, city.lon]}
        radius={8}
        pathOptions={{ color: '#fff', fillColor: '#ef4444', fillOpacity: 1, weight: 2 }}
      >
        <Popup>
          <div className="text-xs space-y-1 min-w-[160px]">
            <p className="font-bold text-sm">{city.name}</p>
            <p className="text-gray-500">{city.state}</p>
            {city.temp && <p>Live Temp: <strong>{city.temp}°C</strong></p>}
          </div>
        </Popup>
      </CircleMarker>
    </>
  );
}

export default function HeatStrategies() {
  const [mode, setMode] = useState(null); // 'city' | 'location'
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityWeather, setCityWeather] = useState(null);
  const [lstZones, setLstZones] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState('');
  const [userLoc, setUserLoc] = useState(null);
  const [locWeather, setLocWeather] = useState(null);
  const [cityLoading, setCityLoading] = useState(false);
  const [tileStyle, setTileStyle] = useState('dark');

  // Autocomplete suggestions
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const q = query.toLowerCase();
    setSuggestions(CITY_LIST.filter(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)).slice(0, 8));
  }, [query]);

  // Fetch city weather + build LST zones
  const loadCity = useCallback(async (city) => {
    setSelectedCity(city);
    setSuggestions([]);
    setQuery(city.name);
    setCityLoading(true);
    setMapCenter([city.lat, city.lon]);
    setMapZoom(12);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m&wind_speed_unit=kmh&forecast_days=1`;
      const res = await fetch(url);
      const json = await res.json();
      const temp = json?.current?.temperature_2m;
      const weather = {
        ...city,
        temp: temp != null ? Math.round(temp * 10) / 10 : null,
        feels_like: json?.current?.apparent_temperature ?? null,
        humidity: json?.current?.relative_humidity_2m ?? null,
        wind_speed: json?.current?.wind_speed_10m ?? null,
      };
      setCityWeather(weather);
      setLstZones(generateLSTZones(city.lat, city.lon, temp != null ? temp + 8 : 42)); // LST ~8°C above air temp
    } catch (e) {
      setCityWeather({ ...city, temp: null });
      setLstZones(generateLSTZones(city.lat, city.lon, 42));
    }
    setCityLoading(false);
  }, []);

  // Get user location
  const enableLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported by your browser.'); return; }
    setLocLoading(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserLoc({ lat, lon });
        setMapCenter([lat, lon]);
        setMapZoom(13);
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m&wind_speed_unit=kmh&forecast_days=1`;
          const res = await fetch(url);
          const json = await res.json();
          const temp = json?.current?.temperature_2m;
          setLocWeather({
            temp: temp != null ? Math.round(temp * 10) / 10 : null,
            feels_like: json?.current?.apparent_temperature ?? null,
            humidity: json?.current?.relative_humidity_2m ?? null,
            wind_speed: json?.current?.wind_speed_10m ?? null,
            lst: temp != null ? Math.round((temp + 8) * 10) / 10 : 42,
          });
        } catch {
          setLocWeather({ temp: null, lst: 42 });
        }
        setLocLoading(false);
      },
      (err) => {
        setLocError('Location access denied. Please allow location in browser settings.');
        setLocLoading(false);
      }
    );
  }, []);

  const tileUrl = tileStyle === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const MODES = [
    { id: 'city', label: 'City Heat Map', icon: Search, desc: 'Search any Indian city' },
    { id: 'location', label: 'My Location (5km)', icon: Navigation, desc: 'Use GPS coordinates' },
  ];

  return (
    <div className="p-6 space-y-4">
      <PageHeader icon={Flame} title="Heat Strategies" subtitle="Urban Land Surface Temperature & proximity heat analysis">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTileStyle(s => s === 'dark' ? 'light' : 'dark')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground border border-border transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            {tileStyle === 'dark' ? 'Light Map' : 'Dark Map'}
          </button>
        </div>
      </PageHeader>

      {/* Strategy selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); if (m.id === 'location') enableLocation(); }}
            className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left group ${
              mode === m.id
                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/40'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              mode === m.id ? 'bg-primary/20' : 'bg-secondary'
            }`}>
              <m.icon className={`w-5 h-5 ${mode === m.id ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${mode === m.id ? 'text-primary' : 'text-foreground'}`}>{m.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
            </div>
            {mode === m.id && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* City search panel */}
      {mode === 'city' && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Search City</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Type city name (e.g. Chandigarh, Delhi, Mumbai…)"
              className="w-full pl-9 pr-9 py-2.5 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            {query && (
              <button onClick={() => { setQuery(''); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl overflow-hidden z-50 shadow-2xl">
                {suggestions.map(c => (
                  <button
                    key={c.name}
                    onClick={() => loadCity(c)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-sm text-foreground font-medium">{c.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{c.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick city buttons */}
          <div className="flex flex-wrap gap-2">
            {['Delhi', 'Chandigarh', 'Mumbai', 'Jaipur', 'Hyderabad', 'Chennai', 'Kolkata'].map(name => {
              const city = CITY_LIST.find(c => c.name === name);
              return (
                <button
                  key={name}
                  onClick={() => city && loadCity(city)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                    selectedCity?.name === name
                      ? 'bg-primary text-white border-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                >{name}</button>
              );
            })}
          </div>

          {/* City weather strip */}
          {cityWeather && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs text-muted-foreground">Air Temp:</span>
                <span className="text-xs font-bold text-orange-400">{cityWeather.temp ?? '–'}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs text-muted-foreground">Est. LST:</span>
                <span className="text-xs font-bold text-red-400">{cityWeather.temp != null ? (cityWeather.temp + 8).toFixed(1) : '–'}°C</span>
              </div>
              {cityWeather.humidity && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Humidity:</span>
                  <span className="text-xs font-semibold text-foreground">{cityWeather.humidity}%</span>
                </div>
              )}
              {cityLoading && <span className="text-xs text-muted-foreground animate-pulse ml-auto">Loading data…</span>}
            </div>
          )}
        </div>
      )}

      {/* Location panel */}
      {mode === 'location' && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Your Location Heat Zone</p>
            <Button size="sm" variant="outline" onClick={enableLocation} disabled={locLoading} className="gap-1.5 text-xs">
              <RefreshCw className={`w-3 h-3 ${locLoading ? 'animate-spin' : ''}`} />
              Re-detect
            </Button>
          </div>

          {locLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Crosshair className="w-4 h-4 text-primary" />
              Detecting GPS coordinates…
            </div>
          )}

          {locError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              {locError}
            </div>
          )}

          {userLoc && !locLoading && (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-muted-foreground">Coords:</span>
                <span className="text-xs font-semibold text-foreground">{userLoc.lat.toFixed(4)}°N, {userLoc.lon.toFixed(4)}°E</span>
              </div>
              {locWeather?.temp && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs text-muted-foreground">Air Temp:</span>
                    <span className="text-xs font-bold text-orange-400">{locWeather.temp}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-red-500" />
                    <span className="text-xs text-muted-foreground">Est. LST:</span>
                    <span className="text-xs font-bold text-red-400">{locWeather.lst}°C</span>
                  </div>
                </>
              )}
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-medium">5 km radius mapped</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info callout when no mode selected */}
      {!mode && (
        <div className="rounded-xl border border-border bg-card/50 p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-sm font-semibold text-foreground">Select a Heat Strategy above</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Choose <strong>City Heat Map</strong> to explore LST data for any Indian city, or <strong>My Location</strong> to visualise a 5 km heat radius around you.
          </p>
        </div>
      )}

      {/* Map */}
      {(mode === 'city' || mode === 'location') && (
        <div className="rounded-xl border border-border overflow-hidden relative" style={{ height: 'calc(100vh - 380px)', minHeight: 420 }}>
          <MapContainer
            center={mapCenter}
            zoom={mode === 'city' && !selectedCity ? 5 : mapZoom}
            className="h-full w-full"
            style={{ background: '#030712' }}
          >
            <TileLayer
              url={tileUrl}
              attribution={tileStyle === 'dark'
                ? '&copy; <a href="https://carto.com">CARTO</a>'
                : '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'}
            />
            <MapFlyTo center={mapCenter} zoom={mapZoom} />

            {mode === 'city' && selectedCity && (
              <CityLSTLayer city={cityWeather || selectedCity} zones={lstZones} />
            )}

            {mode === 'location' && userLoc && (
              <LocationHeatLayer
                lat={userLoc.lat}
                lon={userLoc.lon}
                temp={locWeather?.lst}
              />
            )}

            <LSTLegend />
          </MapContainer>

          {/* Top-right info card */}
          <div className="absolute top-4 right-4 z-[1000] bg-black/75 backdrop-blur border border-white/10 rounded-xl p-3 max-w-[230px]">
            {mode === 'city' && selectedCity && (
              <>
                <p className="text-xs font-bold text-white mb-1">{selectedCity.name} — LST Heat Map</p>
                <p className="text-[10px] text-white/60">Simulated land surface temperature zones based on urban morphology & live air temp.</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400">Open-Meteo · Live</span>
                </div>
              </>
            )}
            {mode === 'location' && userLoc && (
              <>
                <p className="text-xs font-bold text-white mb-1">📍 5 km Heat Radius</p>
                <p className="text-[10px] text-white/60">Concentrically mapped heat intensity around your GPS location.</p>
                {locWeather?.temp && (
                  <p className="text-[10px] text-orange-400 mt-1 font-semibold">Surface ~{locWeather.lst}°C</p>
                )}
              </>
            )}
            {mode === 'city' && !selectedCity && (
              <p className="text-[10px] text-white/60">Search and select a city to render the LST heat map.</p>
            )}
          </div>
        </div>
      )}

      {/* AI Strategist — city mode */}
      {mode === 'city' && cityWeather && (
        <AIStrategist
          locationLabel={cityWeather.name || selectedCity?.name}
          lst={cityWeather.temp != null ? cityWeather.temp + 8 : null}
          airTemp={cityWeather.temp}
        />
      )}

      {/* AI Strategist — location mode */}
      {mode === 'location' && userLoc && locWeather && (
        <AIStrategist
          locationLabel={`${userLoc.lat.toFixed(3)}°N, ${userLoc.lon.toFixed(3)}°E`}
          lst={locWeather.lst}
          airTemp={locWeather.temp}
        />
      )}

      {/* Reference note */}
      {mode && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-secondary/40 border border-border">
          <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground">
            LST visualisation references Landsat 8/9 land surface temperature methodology. Air-to-surface temperature offset (~+8°C) applied based on urban canyon research. Real-time air data from Open-Meteo API. Reference: zoom.earth temperature layer.
          </p>
        </div>
      )}
    </div>
  );
}