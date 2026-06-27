import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, Satellite, Flame, Brain, BarChart3,
  AlertTriangle, Sliders, Cpu, Box, MessageSquare, FileText,
  Thermometer, Zap, Layers, Target, Globe
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    label: 'Satellite Maps',
    items: [
      { path: '/heat-map', icon: Map, label: 'India Heat Map' },
      { path: '/india-satellite', icon: Globe, label: 'India GEE Satellite', badge: 'NEW' },
      { path: '/satellite', icon: Satellite, label: 'Satellite Analytics' },
      { path: '/hotspots', icon: Flame, label: 'Heat Hotspots' },
    ]
  },
  {
    label: 'Analysis',
    items: [
      { path: '/drivers', icon: Brain, label: 'Heat Drivers & SHAP' },
      { path: '/forecasting', icon: BarChart3, label: 'Forecasting' },
      { path: '/alerts', icon: AlertTriangle, label: 'Heatwave Alerts' },
    ]
  },
  {
    label: 'Simulation',
    items: [
      { path: '/simulator', icon: Sliders, label: 'Cooling Simulator' },
      { path: '/optimization', icon: Cpu, label: 'Optimization Engine' },
      { path: '/digital-twin', icon: Box, label: 'Digital Twin' },
      { path: '/scenarios', icon: Layers, label: 'Scenario Explorer' },
      { path: '/heat-strategies', icon: Target, label: 'Heat Strategies' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/copilot', icon: MessageSquare, label: 'AI Copilot' },
      { path: '/reports', icon: FileText, label: 'Reports' },
    ]
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full z-40 flex flex-col border-r border-border bg-card w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shrink-0">
          <Thermometer className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-sm text-foreground tracking-wide">HEATSHIELD AI</h1>
          <p className="text-[10px] text-muted-foreground">Urban Heat Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map(section => (
          <div key={section.label}>
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-1">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-3 h-3 text-primary" />
          <span className="text-[10px] text-muted-foreground">ISRO Hackathon 2026</span>
        </div>
      </div>
    </aside>
  );
}
