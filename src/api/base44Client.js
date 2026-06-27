// Mock base44 client — replaces @base44/sdk for local dev
// All entity data is stubbed so the app runs without a backend

const HOTSPOTS = [
  { id: '1', zone_name: 'Connaught Place', latitude: 28.6315, longitude: 77.2167, lst_value: 49.2, heat_score: 95, risk_level: 'extreme', cluster_method: 'kmeans', ndvi: 0.05, ndbi: 0.58, population_density: 75000, building_density: 0.88, road_density: 0.82, vegetation_cover: 5, impervious_surface: 91, wind_speed: 1.6, humidity: 42, driver_vegetation: 38, driver_buildings: 27, driver_roads: 14, driver_wind: 11, driver_population: 10 },
  { id: '2', zone_name: 'Chandni Chowk', latitude: 28.6562, longitude: 77.2300, lst_value: 50.1, heat_score: 97, risk_level: 'extreme', cluster_method: 'dbscan', ndvi: 0.04, ndbi: 0.62, population_density: 92000, building_density: 0.92, road_density: 0.88, vegetation_cover: 3, impervious_surface: 94, wind_speed: 1.2, humidity: 40, driver_vegetation: 40, driver_buildings: 30, driver_roads: 15, driver_wind: 9, driver_population: 6 },
  { id: '3', zone_name: 'Karol Bagh', latitude: 28.6512, longitude: 77.1900, lst_value: 47.8, heat_score: 91, risk_level: 'extreme', cluster_method: 'getis_ord', ndvi: 0.07, ndbi: 0.52, population_density: 68000, building_density: 0.82, road_density: 0.75, vegetation_cover: 7, impervious_surface: 88, wind_speed: 1.9, humidity: 44, driver_vegetation: 36, driver_buildings: 25, driver_roads: 14, driver_wind: 13, driver_population: 12 },
  { id: '4', zone_name: 'Rohini', latitude: 28.7495, longitude: 77.0683, lst_value: 45.3, heat_score: 84, risk_level: 'high', cluster_method: 'morans_i', ndvi: 0.12, ndbi: 0.44, population_density: 52000, building_density: 0.72, road_density: 0.65, vegetation_cover: 12, impervious_surface: 80, wind_speed: 2.4, humidity: 47, driver_vegetation: 32, driver_buildings: 22, driver_roads: 16, driver_wind: 18, driver_population: 12 },
  { id: '5', zone_name: 'Dwarka', latitude: 28.5921, longitude: 77.0460, lst_value: 43.1, heat_score: 76, risk_level: 'high', cluster_method: 'kmeans', ndvi: 0.15, ndbi: 0.40, population_density: 44000, building_density: 0.68, road_density: 0.60, vegetation_cover: 16, impervious_surface: 76, wind_speed: 2.8, humidity: 49, driver_vegetation: 30, driver_buildings: 20, driver_roads: 15, driver_wind: 20, driver_population: 15 },
  { id: '6', zone_name: 'Saket', latitude: 28.5245, longitude: 77.2066, lst_value: 41.5, heat_score: 68, risk_level: 'high', cluster_method: 'dbscan', ndvi: 0.18, ndbi: 0.36, population_density: 38000, building_density: 0.62, road_density: 0.55, vegetation_cover: 20, impervious_surface: 72, wind_speed: 3.1, humidity: 51, driver_vegetation: 28, driver_buildings: 20, driver_roads: 14, driver_wind: 22, driver_population: 16 },
  { id: '7', zone_name: 'Hauz Khas', latitude: 28.5494, longitude: 77.2001, lst_value: 37.2, heat_score: 45, risk_level: 'moderate', cluster_method: 'getis_ord', ndvi: 0.35, ndbi: 0.22, population_density: 28000, building_density: 0.48, road_density: 0.42, vegetation_cover: 38, impervious_surface: 55, wind_speed: 3.8, humidity: 58, driver_vegetation: 22, driver_buildings: 18, driver_roads: 12, driver_wind: 28, driver_population: 20 },
  { id: '8', zone_name: 'Lodhi Garden Area', latitude: 28.5931, longitude: 77.2197, lst_value: 32.4, heat_score: 22, risk_level: 'low', cluster_method: 'kmeans', ndvi: 0.58, ndbi: 0.08, population_density: 12000, building_density: 0.22, road_density: 0.25, vegetation_cover: 62, impervious_surface: 32, wind_speed: 4.2, humidity: 65, driver_vegetation: 12, driver_buildings: 14, driver_roads: 10, driver_wind: 38, driver_population: 26 },
];

const ALERTS = [
  { id: '1', city_id: '1', alert_level: 'red', alert_type: 'heatwave', title: 'Severe Heatwave Warning — Delhi NCR', description: 'Extreme heat conditions expected across central Delhi. LST exceeding 50°C in commercial zones. Public health emergency declared.', start_date: '2025-06-15', end_date: '2025-06-22', affected_zones: 'Connaught Place, Chandni Chowk, Karol Bagh, Rohini', max_temp_predicted: 51.7, heat_index_predicted: 58.2, population_at_risk: 4200000, is_active: true, recommended_actions: 'Avoid outdoor activity 11AM–5PM. Open cooling centres. Ensure hydration. Check on elderly neighbours. Keep pets indoors.' },
  { id: '2', city_id: '1', alert_level: 'orange', alert_type: 'extreme_heat', title: 'Heat Advisory — South Delhi', description: 'Elevated heat stress conditions in South Delhi residential areas. Vulnerable populations at risk.', start_date: '2025-06-14', end_date: '2025-06-20', affected_zones: 'Dwarka, Saket, Vasant Kunj', max_temp_predicted: 46.3, heat_index_predicted: 52.1, population_at_risk: 1800000, is_active: true, recommended_actions: 'Limit strenuous outdoor activities. Use fans and coolers. Drink water frequently.' },
  { id: '3', city_id: '1', alert_level: 'yellow', alert_type: 'heat_stress', title: 'Heat Watch — North Delhi', description: 'Conditions favourable for heat stress development. Monitor forecasts.', start_date: '2025-06-16', end_date: '2025-06-18', affected_zones: 'Rohini, Pitampura, Model Town', max_temp_predicted: 43.5, heat_index_predicted: 48.0, population_at_risk: 950000, is_active: true, recommended_actions: 'Stay hydrated. Wear light-coloured clothing.' },
  { id: '4', city_id: '2', alert_level: 'green', alert_type: 'public_health', title: 'Normal Conditions — East Delhi', description: 'No significant heat threat currently. Monitor seasonal trends.', start_date: '2025-06-10', end_date: '2025-06-30', affected_zones: 'Mayur Vihar, Preet Vihar', max_temp_predicted: 38.2, heat_index_predicted: 42.1, population_at_risk: 200000, is_active: false, recommended_actions: 'No special precautions needed.' },
];

const CITIES = [
  { id: '1', name: 'Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, population: 32941308, area_sqkm: 1484, avg_lst: 42.3, max_lst: 51.7, ndvi_avg: 0.18, ndbi_avg: 0.42, uhi_intensity: 6.8, heat_risk_score: 92, risk_level: 'extreme', vegetation_cover_pct: 15.2, impervious_surface_pct: 68.3, building_density: 0.76, road_density: 0.68, green_cover_pct: 15.2, water_body_pct: 2.1, avg_albedo: 0.18, avg_wind_speed: 2.4, avg_humidity: 48, annual_rainfall_mm: 796 },
  { id: '2', name: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, population: 20667656, area_sqkm: 603, avg_lst: 38.1, max_lst: 44.2, ndvi_avg: 0.22, ndbi_avg: 0.38, uhi_intensity: 4.2, heat_risk_score: 74, risk_level: 'high', vegetation_cover_pct: 18.4, impervious_surface_pct: 62.1, building_density: 0.82, road_density: 0.72, green_cover_pct: 18.4, water_body_pct: 8.2, avg_albedo: 0.19, avg_wind_speed: 3.8, avg_humidity: 72, annual_rainfall_mm: 2167 },
  { id: '3', name: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, population: 8253226, area_sqkm: 505, avg_lst: 44.8, max_lst: 52.3, ndvi_avg: 0.14, ndbi_avg: 0.46, uhi_intensity: 5.9, heat_risk_score: 88, risk_level: 'extreme', vegetation_cover_pct: 11.2, impervious_surface_pct: 74.3, building_density: 0.71, road_density: 0.65, green_cover_pct: 11.2, water_body_pct: 1.8, avg_albedo: 0.21, avg_wind_speed: 2.1, avg_humidity: 38, annual_rainfall_mm: 782 },
  { id: '4', name: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, population: 3798647, area_sqkm: 485, avg_lst: 43.2, max_lst: 49.8, ndvi_avg: 0.16, ndbi_avg: 0.44, uhi_intensity: 5.1, heat_risk_score: 85, risk_level: 'extreme', vegetation_cover_pct: 12.8, impervious_surface_pct: 70.1, building_density: 0.68, road_density: 0.62, green_cover_pct: 12.8, water_body_pct: 1.4, avg_albedo: 0.23, avg_wind_speed: 2.8, avg_humidity: 35, annual_rainfall_mm: 650 },
  { id: '5', name: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, population: 13192971, area_sqkm: 741, avg_lst: 34.2, max_lst: 40.1, ndvi_avg: 0.28, ndbi_avg: 0.32, uhi_intensity: 3.4, heat_risk_score: 56, risk_level: 'moderate', vegetation_cover_pct: 25.6, impervious_surface_pct: 58.2, building_density: 0.64, road_density: 0.58, green_cover_pct: 25.6, water_body_pct: 3.8, avg_albedo: 0.17, avg_wind_speed: 3.2, avg_humidity: 62, annual_rainfall_mm: 971 },
];

const FORECASTS = [
  { id: '1', city_id: '1', forecast_date: '2025-07-01', horizon: '1d', model: 'ensemble', predicted_temp: 44.2, predicted_heat_index: 50.1, predicted_uhi_intensity: 7.1, heatwave_probability: 0.88, confidence_lower: 42.1, confidence_upper: 46.3, confidence_level: 0.95 },
  { id: '2', city_id: '1', forecast_date: '2025-07-07', horizon: '7d', model: 'lstm', predicted_temp: 43.8, predicted_heat_index: 49.4, predicted_uhi_intensity: 6.9, heatwave_probability: 0.82, confidence_lower: 41.2, confidence_upper: 46.4, confidence_level: 0.90 },
  { id: '3', city_id: '1', forecast_date: '2025-08-01', horizon: '30d', model: 'tft', predicted_temp: 41.2, predicted_heat_index: 46.8, predicted_uhi_intensity: 6.4, heatwave_probability: 0.65, confidence_lower: 38.5, confidence_upper: 43.9, confidence_level: 0.85 },
  { id: '4', city_id: '1', forecast_date: '2025-10-01', horizon: '90d', model: 'xgboost', predicted_temp: 33.8, predicted_heat_index: 38.2, predicted_uhi_intensity: 4.8, heatwave_probability: 0.22, confidence_lower: 30.2, confidence_upper: 37.4, confidence_level: 0.80 },
  { id: '5', city_id: '1', forecast_date: '2026-07-01', horizon: '1y', model: 'prophet', predicted_temp: 45.1, predicted_heat_index: 51.2, predicted_uhi_intensity: 7.4, heatwave_probability: 0.91, confidence_lower: 42.3, confidence_upper: 47.9, confidence_level: 0.75 },
];

const REPORTS = [];

function makeEntity(data) {
  return {
    list: async () => [...data],
    get: async (id) => data.find(d => d.id === id) || null,
    create: async (item) => {
      const newItem = { ...item, id: String(Date.now()), created_date: new Date().toISOString() };
      data.push(newItem);
      return newItem;
    },
    update: async (id, updates) => {
      const idx = data.findIndex(d => d.id === id);
      if (idx >= 0) { data[idx] = { ...data[idx], ...updates }; return data[idx]; }
      return null;
    },
    delete: async (id) => { const idx = data.findIndex(d => d.id === id); if (idx >= 0) data.splice(idx, 1); },
  };
}

export const base44 = {
  entities: {
    CityProfile: makeEntity(CITIES),
    HeatHotspot: makeEntity(HOTSPOTS),
    HeatwaveAlert: makeEntity(ALERTS),
    HeatForecast: makeEntity(FORECASTS),
    Report: makeEntity(REPORTS),
    SimulationResult: makeEntity([]),
  },
  auth: {
    me: async () => { throw new Error('not authenticated'); },
    loginViaEmailPassword: async () => { throw new Error('auth not available in local mode'); },
    loginWithProvider: () => {},
    register: async () => {},
    verifyOtp: async () => {},
    resendOtp: async () => {},
    resetPasswordRequest: async () => {},
    resetPassword: async () => {},
    logout: () => {},
    redirectToLogin: () => {},
    setToken: () => {},
  },
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt }) => {
        return `# Report Generated\n\nThis is a mock report generated locally.\n\n## Summary\n\nDelhi NCR faces extreme urban heat with LST averaging 42.3°C and peaking at 51.7°C.\n\n## Key Findings\n\n- UHI Intensity: 6.8°C above rural baseline\n- Hottest Zone: Chandni Chowk at 50.1°C\n- Green cover critically low at 15.2%\n\n## Recommendations\n\n1. Increase tree canopy cover by 25%\n2. Deploy cool roofs on 40% of buildings\n3. Restore urban water bodies\n4. Create green corridors along arterial roads`;
      }
    }
  }
};
