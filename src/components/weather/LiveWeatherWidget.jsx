import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Thermometer, Droplets, Wind, Eye, Gauge, MapPin, RefreshCw, AlertCircle } from 'lucide-react';

const AQI_LEVELS = [
  { max: 50, label: 'Good', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { max: 100, label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { max: 150, label: 'Unhealthy (Sensitive)', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  { max: 200, label: 'Unhealthy', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
  { max: 300, label: 'Very Unhealthy', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  { max: Infinity, label: 'Hazardous', color: 'text-rose-600', bg: 'bg-rose-600/10', border: 'border-rose-600/20' },
];

function getAQIInfo(aqi) {
  return AQI_LEVELS.find(l => aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

function getWeatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code <= 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

export default function LiveWeatherWidget() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Search cities via Open-Meteo Geocoding API
  const searchCities = useCallback(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
      const data = await res.json();
      setSuggestions(data.results || []);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(val), 350);
  };

  const fetchWeather = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    try {
      const { latitude: lat, longitude: lon } = city;
      const [weatherRes, airRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,visibility,precipitation&timezone=auto`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone&timezone=auto`),
      ]);
      const weatherData = await weatherRes.json();
      const airData = await airRes.json();

      setWeather({
        temperature: weatherData.current?.temperature_2m,
        humidity: weatherData.current?.relative_humidity_2m,
        feelsLike: weatherData.current?.apparent_temperature,
        weatherCode: weatherData.current?.weather_code,
        windSpeed: weatherData.current?.wind_speed_10m,
        pressure: weatherData.current?.surface_pressure,
        visibility: weatherData.current?.visibility,
        precipitation: weatherData.current?.precipitation,
        aqi: airData.current?.us_aqi,
        pm25: airData.current?.pm2_5,
        pm10: airData.current?.pm10,
        no2: airData.current?.nitrogen_dioxide,
        ozone: airData.current?.ozone,
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCity = (city) => {
    setSelectedCity(city);
    setQuery(`${city.name}, ${city.country}`);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeather(city);
  };

  // Load Delhi NCR by default
  useEffect(() => {
    selectCity({ name: 'New Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.2090 });
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const aqiInfo = weather?.aqi != null ? getAQIInfo(weather.aqi) : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center">
            <Thermometer className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-semibold text-foreground">Live Weather</h3>
            {lastUpdated && (
              <p className="text-[10px] text-muted-foreground">Updated {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
        </div>
        {selectedCity && !loading && (
          <button onClick={() => fetchWeather(selectedCity)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search any city worldwide..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border border-primary border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
            {suggestions.map((city, i) => (
              <button
                key={i}
                onMouseDown={() => selectCity(city)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-secondary transition-colors text-left"
              >
                <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{city.name}</p>
                  <p className="text-[10px] text-muted-foreground">{[city.admin1, city.country].filter(Boolean).join(', ')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Weather Data */}
      {weather && !loading && (
        <>
          {/* City name + main temp */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">{selectedCity?.name}, {selectedCity?.country}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold font-heading text-foreground">{Math.round(weather.temperature)}°C</span>
                <span className="text-2xl mb-1">{getWeatherIcon(weather.weatherCode)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Feels like {Math.round(weather.feelsLike)}°C</p>
            </div>
            {aqiInfo && (
              <div className={`px-3 py-2 rounded-xl border ${aqiInfo.bg} ${aqiInfo.border} text-center`}>
                <p className="text-[10px] text-muted-foreground mb-0.5">AQI (US)</p>
                <p className={`text-xl font-bold font-heading ${aqiInfo.color}`}>{weather.aqi}</p>
                <p className={`text-[9px] font-medium ${aqiInfo.color}`}>{aqiInfo.label}</p>
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%`, color: 'text-sky-400' },
              { icon: Wind, label: 'Wind Speed', value: `${weather.windSpeed} km/h`, color: 'text-teal-400' },
              { icon: Gauge, label: 'Pressure', value: `${Math.round(weather.pressure)} hPa`, color: 'text-violet-400' },
              { icon: Eye, label: 'Visibility', value: weather.visibility != null ? `${(weather.visibility / 1000).toFixed(1)} km` : 'N/A', color: 'text-amber-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50">
                <Icon className={`w-3.5 h-3.5 ${color} shrink-0`} />
                <div>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                  <p className="text-xs font-semibold text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Air Quality Details */}
          {weather.pm25 != null && (
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">Air Quality Details</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'PM2.5', value: weather.pm25?.toFixed(1), unit: 'µg/m³' },
                  { label: 'PM10', value: weather.pm10?.toFixed(1), unit: 'µg/m³' },
                  { label: 'NO₂', value: weather.no2?.toFixed(1), unit: 'µg/m³' },
                  { label: 'O₃', value: weather.ozone?.toFixed(1), unit: 'µg/m³' },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="text-center p-1.5 rounded-lg bg-secondary/50">
                    <p className="text-[9px] text-muted-foreground">{label}</p>
                    <p className="text-xs font-bold text-foreground">{value ?? 'N/A'}</p>
                    <p className="text-[8px] text-muted-foreground">{unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}