import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import HeatMap from '@/pages/HeatMap';
import IndiaGEEMap from '@/pages/IndiaGEEMap';
import SatelliteAnalytics from '@/pages/SatelliteAnalytics';
import HeatHotspot from '@/pages/HeatHotspot';
import HeatDrivers from '@/pages/HeatDrivers';
import Forecasting from '@/pages/Forecasting';
import HeatwaveAlerts from '@/pages/HeatwaveAlerts';
import CoolingSimulator from '@/pages/CoolingSimulator';
import Optimization from '@/pages/Optimization';
import DigitalTwin from '@/pages/DigitalTwin';
import ScenarioExplorer from '@/pages/ScenarioExplorer';
import AICopilot from '@/pages/AICopilot';
import Reports from '@/pages/Reports';
import HeatStrategies from '@/pages/HeatStrategies';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/heat-map" element={<HeatMap />} />
              <Route path="/india-satellite" element={<IndiaGEEMap />} />
              <Route path="/satellite" element={<SatelliteAnalytics />} />
              <Route path="/hotspots" element={<HeatHotspot />} />
              <Route path="/drivers" element={<HeatDrivers />} />
              <Route path="/forecasting" element={<Forecasting />} />
              <Route path="/alerts" element={<HeatwaveAlerts />} />
              <Route path="/simulator" element={<CoolingSimulator />} />
              <Route path="/optimization" element={<Optimization />} />
              <Route path="/digital-twin" element={<DigitalTwin />} />
              <Route path="/scenarios" element={<ScenarioExplorer />} />
              <Route path="/copilot" element={<AICopilot />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/heat-strategies" element={<HeatStrategies />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
