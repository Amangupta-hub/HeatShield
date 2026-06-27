import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-secondary">
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <span className="ml-3 text-sm font-heading font-bold text-foreground">HEATSHIELD AI</span>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full">
            <Sidebar />
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg bg-secondary z-50">
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      )}

      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}