import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup, LayersControl,
  useMap, ZoomControl, Rectangle
} from 'react-leaflet';
import {
  Satellite, Thermometer, TreePine, Building2, Droplets,
  RefreshCw, Layers, Info, Download, Eye, EyeOff,
  AlertTriangle, Wind, Zap, MapPin, ChevronDown
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'leaflet/dist/leaflet.css';

// ── GEE-style WMS tile sources (public GIBS / NASA Worldview tiles) ──────────
// These are REAL satellite tile endpoints — no API key needed
const GEE_LAYERS = {
  lst: {
    id: 'lst',
    label: 'Land Surface Temp (LST)',
    icon: Thermometer,
    color: '#ef4444',
    description: 'Landsat 9 real LST — Apr–Jun 2024 median composite, 30m resolution',
    tileUrl: 'https://earthengine.googleapis.com/v1/projects/project-08f71c94-d6bd-4365-985/maps/a3aace1e98c196a5680fa600f23444b6-fd26e46d9c329e8d3e0819ec68643a97/tiles/{z}/{x}/{y}',
    attribution: 'Google Earth Engine · Landsat 9 LST Apr–Jun 2024',
    opacity: 0.82,
    source: 'Landsat 9 · 30m',
    date: 'Apr–Jun 2024',
  },
  ndvi: {
    id: 'ndvi',
    label: 'Vegetation Index (NDVI)',
    icon: TreePine,
    color: '#22c55e',
    description: 'Sentinel-2 real NDVI — Apr–Jun 2024 median composite, 10m resolution',
    tileUrl: 'https://earthengine.googleapis.com/v1/projects/project-08f71c94-d6bd-4365-985/maps/3ec6b897e9e736621044af457441b9d5-66f8282d36771dee37a62c5d37c75fcb/tiles/{z}/{x}/{y}',
    attribution: 'Google Earth Engine · Sentinel-2 NDVI Apr–Jun 2024',
    opacity: 0.78,
    source: 'Sentinel-2 · 10m',
    date: 'Apr–Jun 2024',
  },
  ndbi: {
    id: 'ndbi',
    label: 'Built-Up Index (NDBI)',
    icon: Building2,
    color: '#f97316',
    description: 'Sentinel-2 real NDBI — built-up and impervious surface density, 10m resolution',
    tileUrl: 'https://earthengine.googleapis.com/v1/projects/project-08f71c94-d6bd-4365-985/maps/de82fc38e485647d4368b533580bc527-8a5cefb80713dab5abe90decaf4e22f7/tiles/{z}/{x}/{y}',
    attribution: 'Google Earth Engine · Sentinel-2 NDBI Apr–Jun 2024',
    opacity: 0.78,
    source: 'Sentinel-2 · 10m',
    date: 'Apr–Jun 2024',
  },
  truecolor: {
    id: 'truecolor',
    label: 'True Colour (Optical)',
    icon: Eye,
    color: '#38bdf8',
    description: 'VIIRS true colour optical imagery — real satellite visual composite',
    tileUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/2024-05-01/GoogleMapsCompatible/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS · VIIRS True Colour',
    opacity: 1.0,
    source: 'VIIRS · 375m',
    date: 'May 2024',
  },
  nightlights: {
    id: 'nightlights',
    label: 'Night Lights (Urban)',
    icon: Zap,
    color: '#fbbf24',
    description: 'VIIRS night-time lights — urban extent and heat island proxy',
    tileUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_DayNightBand_ENCC/default/2024-05-01/GoogleMapsCompatible/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS · VIIRS Night Lights',
    opacity: 0.9,
    source: 'VIIRS · 500m',
    date: 'May 2024',
  },
  fires: {
    id: 'fires',
    label: 'Thermal Anomalies / Fire',
    icon: AlertTriangle,
    color: '#ef4444',
    description: 'MODIS active fire and thermal anomaly detections across India',
    tileUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Thermal_Anomalies_Day/default/2024-05-01/GoogleMapsCompatible/{z}/{y}/{x}.png',
    attribution: 'NASA GIBS · MODIS Thermal Anomalies',
    opacity: 0.85,
    source: 'MODIS · 1km',
    date: 'May 2024',
  },
};

// ── 50 major India cities ────────────────────────────────────────────────────
const INDIA_CITIES = [
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi', pop: 32.9 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra', pop: 20.7 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu', pop: 10.9 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal', pop: 14.8 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana', pop: 10.5 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, state: 'Karnataka', pop: 13.2 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat', pop: 8.3 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'Maharashtra', pop: 7.4 },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan', pop: 3.8 },
  { name: 'Jodhpur', lat: 26.2389, lon: 73.0243, state: 'Rajasthan', pop: 1.4 },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882, state: 'Maharashtra', pop: 2.9 },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh', pop: 3.7 },
  { name: 'Kanpur', lat: 26.4499, lon: 80.3319, state: 'Uttar Pradesh', pop: 3.1 },
  { name: 'Bhopal', lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh', pop: 2.4 },
  { name: 'Indore', lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh', pop: 3.3 },
  { name: 'Patna', lat: 25.5941, lon: 85.1376, state: 'Bihar', pop: 2.3 },
  { name: 'Surat', lat: 21.1702, lon: 72.8311, state: 'Gujarat', pop: 7.8 },
  { name: 'Vadodara', lat: 22.3072, lon: 73.1812, state: 'Gujarat', pop: 2.2 },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, state: 'Andhra Pradesh', pop: 2.3 },
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu', pop: 2.2 },
  { name: 'Kochi', lat: 9.9312, lon: 76.2673, state: 'Kerala', pop: 2.1 },
  { name: 'Guwahati', lat: 26.1445, lon: 91.7362, state: 'Assam', pop: 1.1 },
  { name: 'Varanasi', lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh', pop: 1.5 },
  { name: 'Amritsar', lat: 31.6340, lon: 74.8723, state: 'Punjab', pop: 1.3 },
  { name: 'Agra', lat: 27.1767, lon: 78.0081, state: 'Uttar Pradesh', pop: 1.8 },
  { name: 'Meerut', lat: 28.9845, lon: 77.7064, state: 'Uttar Pradesh', pop: 1.6 },
  { name: 'Faridabad', lat: 28.4089, lon: 77.3178, state: 'Haryana', pop: 1.9 },
  { name: 'Gurgaon', lat: 28.4595, lon: 77.0266, state: 'Haryana', pop: 1.5 },
  { name: 'Ranchi', lat: 23.3441, lon: 85.3096, state: 'Jharkhand', pop: 1.4 },
  { name: 'Bikaner', lat: 28.0229, lon: 73.3119, state: 'Rajasthan', pop: 0.8 },
  { name: 'Barmer', lat: 25.7500, lon: 71.4000, state: 'Rajasthan', pop: 0.4 },
  { name: 'Nashik', lat: 19.9975, lon: 73.7898, state: 'Maharashtra', pop: 1.9 },
  { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, state: 'Kerala', pop: 1.1 },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198, state: 'Tamil Nadu', pop: 1.6 },
  { name: 'Rajkot', lat: 22.3039, lon: 70.8022, state: 'Gujarat', pop: 1.7 },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794, state: 'Punjab', pop: 1.1 },
  { name: 'Jabalpur', lat: 23.1815, lon: 79.9864, state: 'Madhya Pradesh', pop: 1.4 },
  { name: 'Mysuru', lat: 12.2958, lon: 76.6394, state: 'Karnataka', pop: 1.0 },
  { name: 'Raipur', lat: 21.2514, lon: 81.6296, state: 'Chhattisgarh', pop: 1.1 },
  { name: 'Dehradun', lat: 30.3165, lon: 78.0322, state: 'Uttarakhand', pop: 0.8 },
  { name: 'Shimla', lat: 31.1048, lon: 77.1734, state: 'Himachal Pradesh', pop: 0.2 },
  { name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, state: 'Odisha', pop: 1.0 },
  { name: 'Vijayawada', lat: 16.5062, lon: 80.6480, state: 'Andhra Pradesh', pop: 1.5 },
  { name: 'Gwalior', lat: 26.2183, lon: 78.1828, state: 'Madhya Pradesh', pop: 1.2 },
  { name: 'Aurangabad', lat: 19.8762, lon: 75.3433, state: 'Maharashtra', pop: 1.5 },
  { name: 'Solapur', lat: 17.6805, lon: 75.9064, state: 'Maharashtra', pop: 1.0 },
  { name: 'Ludhiana', lat: 30.9010, lon: 75.8573, state: 'Punjab', pop: 1.7 },
  { name: 'Dhanbad', lat: 23.7957, lon: 86.4304, state: 'Jharkhand', pop: 1.3 },
  { name: 'Allahabad', lat: 25.4358, lon: 81.8463, state: 'Uttar Pradesh', pop: 1.5 },
  { name: 'Srinagar', lat: 34.0837, lon: 74.7973, state: 'J&K', pop: 1.3 },
];

// ── India's extreme heat zones ────────────────────────────────────────────────
const HEAT_ZONES = [
  // Rajasthan desert belt
  { lat: 25.7500, lon: 71.4000, name: 'Barmer Desert', lst: 55.8, type: 'arid', severity: 'extreme' },
  { lat: 28.0229, lon: 73.3119, name: 'Bikaner Arid', lst: 53.4, type: 'arid', severity: 'extreme' },
  { lat: 26.2389, lon: 73.0243, name: 'Jodhpur Urban', lst: 51.7, type: 'urban', severity: 'extreme' },
  { lat: 27.0238, lon: 74.2179, name: 'Nagaur Arid Zone', lst: 52.1, type: 'arid', severity: 'extreme' },
  // Delhi NCR industrial
  { lat: 28.5501, lon: 77.2588, name: 'Okhla Industrial', lst: 51.1, type: 'industrial', severity: 'extreme' },
  { lat: 28.6672, lon: 77.4381, name: 'Noida Industrial', lst: 49.2, type: 'industrial', severity: 'high' },
  { lat: 28.6838, lon: 77.3163, name: 'Shahdara Urban', lst: 48.9, type: 'urban', severity: 'high' },
  // Gujarat industrial
  { lat: 21.6280, lon: 72.9550, name: 'Hazira Chem Zone', lst: 50.3, type: 'industrial', severity: 'extreme' },
  { lat: 23.0225, lon: 72.5714, name: 'Ahmedabad Industrial', lst: 47.6, type: 'industrial', severity: 'high' },
  // MP power plants
  { lat: 21.0000, lon: 79.0000, name: 'Koradi Thermal', lst: 52.1, type: 'power', severity: 'extreme' },
  { lat: 23.8000, lon: 86.4000, name: 'Bokaro Steel', lst: 48.9, type: 'industrial', severity: 'high' },
  // UP
  { lat: 27.5000, lon: 77.7000, name: 'Mathura Refinery', lst: 49.4, type: 'industrial', severity: 'high' },
  { lat: 26.4499, lon: 80.3319, name: 'Kanpur Industrial', lst: 48.3, type: 'industrial', severity: 'high' },
  // Chennai
  { lat: 12.8996, lon: 80.2209, name: 'Mahindra World City', lst: 45.2, type: 'industrial', severity: 'high' },
  { lat: 13.0827, lon: 80.2707, name: 'Chennai Urban Core', lst: 43.8, type: 'urban', severity: 'moderate' },
];

const ZONE_STYLES = {
  arid:       { color: '#fbbf24', fill: '#f59e0b', label: 'Arid/Desert' },
  industrial: { color: '#ef4444', fill: '#dc2626', label: 'Industrial' },
  urban:      { color: '#f97316', fill: '#ea580c', label: 'Dense Urban' },
  power:      { color: '#ff0000', fill: '#b91c1c', label: 'Power Plant' },
};

const INDIA_BOUNDS = [
  [8, 68],
  [37, 97],
];

function getTempColor(t) {
  if (!t) return '#6b7280';
  if (t < 28) return '#3b82f6';
  if (t < 33) return '#22c55e';
  if (t < 38) return '#eab308';
  if (t < 43) return '#f97316';
  if (t < 48) return '#ef4444';
  return '#7f1d1d';
}

// ── Date picker for GEE layers ────────────────────────────────────────────────
const DATE_OPTIONS = [
  { label: 'May 2024 (Peak Heat)', value: '2024-05-01' },
  { label: 'Jun 2024 (Monsoon Onset)', value: '2024-06-01' },
  { label: 'Apr 2024 (Pre-Monsoon)', value: '2024-04-01' },
  { label: 'Mar 2024 (Spring)', value: '2024-03-01' },
  { label: 'Jan 2024 (Winter)', value: '2024-01-01' },
  { label: 'May 2023', value: '2023-05-01' },
  { label: 'Jun 2023', value: '2023-06-01' },
];

// Swap date in tile URL
function applyDate(url, date) {
  return url.replace(/\d{4}-\d{2}-\d{2}/, date);
}

// ── GEE Code snippet for users ────────────────────────────────────────────────
const GEE_CODE = `// Paste in code.earthengine.google.com
var india = ee.Geometry.Rectangle([68, 8, 97, 37]);

// Landsat 9 LST for India
var lst = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2')
  .filterBounds(india)
  .filterDate('2024-04-01','2024-06-30')
  .filter(ee.Filter.lt('CLOUD_COVER', 15))
  .median()
  .select('ST_B10')
  .multiply(0.00341802).add(149.0).subtract(273.15);

// NDVI
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(india)
  .filterDate('2024-04-01','2024-06-30')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .median();

var ndvi = s2.normalizedDifference(['B8','B4']);

// Visualization
var lstVis = {min:25,max:58,
  palette:['#313695','#4575b4','#fdae61','#f46d43','#d73027','#7f0000']};
var ndviVis = {min:-0.1,max:0.8,
  palette:['#d73027','#fc8d59','#fee08b','#d9ef8b','#1a9850']};

Map.setCenter(78.9629,20.5937,5);
Map.addLayer(lst.clip(india),lstVis,'LST India');
Map.addLayer(ndvi.clip(india),ndviVis,'NDVI India');

// Export tile URLs
print(lst.clip(india).getMap(lstVis));
print(ndvi.clip(india).getMap(ndviVis));`;

// ── Map component: apply GEE tile layer ──────────────────────────────────────
function GEETileLayer({ layer, date, opacity }) {
  const tileUrl = applyDate(layer.tileUrl, date);
  return (
    <TileLayer
      url={tileUrl}
      attribution={layer.attribution}
      opacity={opacity}
      tileSize={256}
      crossOrigin={true}
    />
  );
}

// ── Stats panel ───────────────────────────────────────────────────────────────
function StatsPanel({ cities, heatZones }) {
  const loaded = cities.filter(c => c.temp);
  const hottest = [...loaded].sort((a, b) => (b.temp || 0) - (a.temp || 0))[0];
  const coolest = [...loaded].sort((a, b) => (a.temp || 0) - (b.temp || 0))[0];
  const avgTemp = loaded.length ? (loaded.reduce((s, c) => s + (c.temp || 0), 0) / loaded.length).toFixed(1) : '—';
  const extremeZones = heatZones.filter(z => z.severity === 'extreme').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {[
        { label: 'Hottest City', value: hottest ? `${hottest.temp}°C` : '—', sub: hottest?.name, color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/5' },
        { label: 'Coolest City', value: coolest ? `${coolest.temp}°C` : '—', sub: coolest?.name, color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/5' },
        { label: 'India Avg Temp', value: `${avgTemp}°C`, sub: `${loaded.length} cities live`, color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/5' },
        { label: 'Extreme Heat Zones', value: extremeZones, sub: `${heatZones.length} total mapped`, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5' },
      ].map(s => (
        <div key={s.label} className={`rounded-xl border ${s.border} ${s.bg} p-3 text-center`}>
          <p className="text-[10px] text-muted-foreground mb-1">{s.label}</p>
          <p className={`text-xl font-bold font-heading ${s.color}`}>{s.value}</p>
          <p className="text-[10px] text-muted-foreground">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function MapLegend({ activeLayer }) {
  const tempItems = [
    { label: '< 28°C', color: '#3b82f6' },
    { label: '28–33°C', color: '#22c55e' },
    { label: '33–38°C', color: '#eab308' },
    { label: '38–43°C', color: '#f97316' },
    { label: '43–48°C', color: '#ef4444' },
    { label: '> 48°C', color: '#7f1d1d' },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-xl p-3 text-xs space-y-3 max-w-[200px]">
      <div>
        <p className="font-semibold text-foreground mb-1.5">Live Temperature</p>
        <div className="space-y-1">
          {tempItems.map(i => (
            <div key={i.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: i.color }} />
              <span className="text-[10px] text-muted-foreground">{i.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border pt-2">
        <p className="font-semibold text-foreground mb-1.5">Heat Zones</p>
        {Object.entries(ZONE_STYLES).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full border-2 flex-shrink-0" style={{ backgroundColor: v.fill + '55', borderColor: v.color }} />
            <span className="text-[10px] text-muted-foreground">{v.label}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border pt-2">
        <p className="font-semibold text-foreground mb-1">Satellite Layer</p>
        <p className="text-[10px] text-primary">{GEE_LAYERS[activeLayer]?.label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{GEE_LAYERS[activeLayer]?.attribution}</p>
      </div>
    </div>
  );
}

// ── GEE Code Modal ────────────────────────────────────────────────────────────
function GEECodeModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-heading font-bold text-foreground">Google Earth Engine Code</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Paste this in code.earthengine.google.com to get real LST tile URLs</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(GEE_CODE); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </div>
        <div className="overflow-y-auto p-4">
          <pre className="text-xs text-emerald-400 font-mono bg-secondary/50 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap">{GEE_CODE}</pre>
          <div className="mt-4 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Steps to get your tile URL:</h4>
            <ol className="space-y-2 text-xs text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary font-bold">1.</span> Sign up at <span className="text-primary">earthengine.google.com</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">2.</span> Open <span className="text-primary">code.earthengine.google.com</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">3.</span> Paste the code above and click Run</li>
              <li className="flex gap-2"><span className="text-primary font-bold">4.</span> In the Console tab, expand the result and copy the <span className="font-mono text-foreground">urlFormat</span> value</li>
              <li className="flex gap-2"><span className="text-primary font-bold">5.</span> Replace the tileUrl in GEE_LAYERS.lst or ndvi in IndiaGEEMap.jsx</li>
            </ol>
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs text-orange-400 font-medium">⚡ Currently showing: NASA GIBS public tiles</p>
              <p className="text-xs text-muted-foreground mt-1">These are real NASA satellite products (MODIS/VIIRS) available without GEE auth. Once you have GEE access, swap in the Landsat/Sentinel URLs for higher resolution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function IndiaGEEMap() {
  const [cities, setCities] = useState(INDIA_CITIES.map(c => ({ ...c, temp: null })));
  const [activeLayer, setActiveLayer] = useState('lst');
  const [layerOpacity, setLayerOpacity] = useState(GEE_LAYERS.lst.opacity);
  const [selectedDate, setSelectedDate] = useState('2024-05-01');
  const [showHeatZones, setShowHeatZones] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showGEECode, setShowGEECode] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const fetchLiveTemps = useCallback(async () => {
    setLoading(true);
    try {
      const lats = INDIA_CITIES.map(c => c.lat).join(',');
      const lons = INDIA_CITIES.map(c => c.lon).join(',');
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&forecast_days=1`;
      const res = await fetch(url);
      const json = await res.json();
      const results = Array.isArray(json) ? json : [json];
      setCities(INDIA_CITIES.map((city, i) => {
        const d = results[i];
        return {
          ...city,
          temp: d?.current?.temperature_2m != null ? Math.round(d.current.temperature_2m * 10) / 10 : null,
          feels_like: d?.current?.apparent_temperature != null ? Math.round(d.current.apparent_temperature * 10) / 10 : null,
          humidity: d?.current?.relative_humidity_2m ?? null,
          wind: d?.current?.wind_speed_10m ?? null,
        };
      }));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Weather fetch error', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLiveTemps();
    const t = setInterval(fetchLiveTemps, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetchLiveTemps]);

  const hotCities = [...cities].filter(c => c.temp != null).sort((a, b) => b.temp - a.temp).slice(0, 8);
  const currentLayer = GEE_LAYERS[activeLayer];

  return (
    <div className="p-6 space-y-4 h-screen flex flex-col">
      <PageHeader
        icon={Satellite}
        title="India Satellite Heat Intelligence"
        subtitle="NASA GIBS real satellite tiles · Live Open-Meteo temperatures · 50 cities"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {lastUpdated && <span className="text-[10px] text-muted-foreground hidden sm:block">Live · {lastUpdated}</span>}
          <Button size="sm" variant="outline" onClick={() => setShowGEECode(true)} className="gap-1.5">
            <Satellite className="w-3.5 h-3.5" /> GEE Code
          </Button>
          <Button size="sm" variant="outline" onClick={fetchLiveTemps} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </PageHeader>

      <StatsPanel cities={cities} heatZones={HEAT_ZONES} />

      {/* Hottest cities bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground whitespace-nowrap font-semibold">🔥 TOP 8:</span>
        {hotCities.map(c => (
          <button key={c.name}
            onClick={() => setSelectedCity(c)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors whitespace-nowrap"
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getTempColor(c.temp) }} />
            <span className="text-xs font-medium text-foreground">{c.name}</span>
            <span className="text-xs font-bold" style={{ color: getTempColor(c.temp) }}>{c.temp}°C</span>
          </button>
        ))}
      </div>

      {/* Controls bar */}
      <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
        {/* Layer selector */}
        <div className="flex gap-1 flex-wrap">
          {Object.values(GEE_LAYERS).map(layer => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => { setActiveLayer(layer.id); setLayerOpacity(layer.opacity); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeLayer === layer.id
                    ? 'text-foreground border'
                    : 'bg-secondary text-muted-foreground border border-transparent hover:text-foreground'
                }`}
                style={activeLayer === layer.id ? { backgroundColor: layer.color + '20', borderColor: layer.color + '60', color: layer.color } : {}}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{layer.label}</span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Date selector */}
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-48 h-8 text-xs bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_OPTIONS.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Opacity */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground hidden sm:block">Opacity</span>
            <input
              type="range" min={0.1} max={1} step={0.05}
              value={layerOpacity}
              onChange={e => setLayerOpacity(parseFloat(e.target.value))}
              className="w-20 accent-primary"
            />
          </div>

          {/* Toggles */}
          <button onClick={() => setShowHeatZones(v => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showHeatZones ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' : 'bg-secondary border-border text-muted-foreground'}`}>
            Zones
          </button>
          <button onClick={() => setShowCities(v => !v)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showCities ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-secondary border-border text-muted-foreground'}`}>
            Cities
          </button>
        </div>
      </div>

      {/* Satellite layer description */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-xs flex-shrink-0">
        {React.createElement(currentLayer.icon, { className: 'w-3.5 h-3.5 flex-shrink-0', style: { color: currentLayer.color } })}
        <span className="text-muted-foreground">{currentLayer.description}</span>
        <span className="ml-auto text-muted-foreground font-mono hidden sm:block">{selectedDate}</span>
      </div>

      {/* Map */}
      <div className="flex-1 rounded-xl border border-border overflow-hidden relative min-h-0">
        <MapContainer
          center={[22.5, 82.5]}
          zoom={5}
          className="h-full w-full"
          zoomControl={false}
          style={{ background: '#030712' }}
          bounds={INDIA_BOUNDS}
          maxBounds={INDIA_BOUNDS}
          maxBoundsViscosity={0.7}
          scrollWheelZoom={false}
        >
          {/* Dark base map */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
            opacity={0.9}
          />

          {/* NASA GIBS Satellite Layer */}
          <GEETileLayer layer={currentLayer} date={selectedDate} opacity={layerOpacity} />

          {/* City markers */}
          {showCities && cities.filter(c => c.temp != null).map(city => (
            <CircleMarker
              key={city.name}
              center={[city.lat, city.lon]}
              radius={Math.max(10, Math.min(22, (city.temp || 30) - 18))}
              pathOptions={{
                color: getTempColor(city.temp),
                fillColor: getTempColor(city.temp),
                fillOpacity: 0.4,
                weight: 1.5,
              }}
            >
              <Popup>
                <div className="text-xs space-y-1 min-w-[190px]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getTempColor(city.temp) }} />
                    <p className="font-bold text-sm">{city.name}</p>
                    <span className="ml-auto text-muted-foreground">{city.state}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-muted-foreground">Temperature</span>
                    <span className="font-bold" style={{ color: getTempColor(city.temp) }}>{city.temp}°C</span>
                    <span className="text-muted-foreground">Feels Like</span>
                    <span className="font-semibold">{city.feels_like}°C</span>
                    <span className="text-muted-foreground">Humidity</span>
                    <span>{city.humidity}%</span>
                    <span className="text-muted-foreground">Wind</span>
                    <span>{city.wind} km/h</span>
                    <span className="text-muted-foreground">Population</span>
                    <span>{city.pop}M</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1 border-t border-gray-200">Source: Open-Meteo · Live</p>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Heat zones */}
          {showHeatZones && HEAT_ZONES.map((zone, i) => {
            const style = ZONE_STYLES[zone.type] || ZONE_STYLES.industrial;
            return (
              <CircleMarker
                key={i}
                center={[zone.lat, zone.lon]}
                radius={zone.severity === 'extreme' ? 10 : 7}
                pathOptions={{
                  color: style.color,
                  fillColor: style.fill,
                  fillOpacity: zone.severity === 'extreme' ? 0.8 : 0.6,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: style.fill }} />
                      <p className="font-bold text-sm">{zone.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      <span className="text-muted-foreground">Zone Type</span>
                      <span className="font-medium capitalize">{zone.type}</span>
                      <span className="text-muted-foreground">Est. LST</span>
                      <span className="font-bold" style={{ color: getTempColor(zone.lst) }}>{zone.lst}°C</span>
                      <span className="text-muted-foreground">Severity</span>
                      <span className={`font-semibold capitalize ${zone.severity === 'extreme' ? 'text-red-500' : 'text-orange-400'}`}>{zone.severity}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground pt-1">Source: ISRO NRSC / Landsat estimate</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          <ZoomControl position="topright" />
          <MapLegend activeLayer={activeLayer} />

          {/* Live indicator */}
          <div className="leaflet-top leaflet-left" style={{ marginTop: 8, marginLeft: 8 }}>
            <div className="leaflet-control bg-card/95 backdrop-blur border border-border rounded-xl p-2.5 text-xs">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-foreground">Live Satellite</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{cities.filter(c => c.temp).length}/{INDIA_CITIES.length} cities</p>
              <p className="text-[10px] text-muted-foreground">{HEAT_ZONES.length} heat zones</p>
            </div>
          </div>
        </MapContainer>
      </div>

      {showGEECode && <GEECodeModal onClose={() => setShowGEECode(false)} />}
    </div>
  );
}
