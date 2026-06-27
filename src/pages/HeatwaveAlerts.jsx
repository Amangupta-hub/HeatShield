import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Shield, Clock, Users, MapPin } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { ALERT_COLORS, formatNumber } from '@/lib/heatUtils';

export default function HeatwaveAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.HeatwaveAlert.list().then(data => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  const levels = ['red', 'orange', 'yellow', 'green'];
  const activeCount = alerts.filter(a => a.is_active).length;

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={AlertTriangle} title="Heatwave Early Warning System" subtitle="Real-time alert monitoring for heatwaves, extreme heat, and public health risks" />

      {/* Alert Level Legend */}
      <div className="grid grid-cols-4 gap-4">
        {levels.map(level => {
          const c = ALERT_COLORS[level];
          const count = alerts.filter(a => a.alert_level === level).length;
          return (
            <div key={level} className={`rounded-xl border ${c.border} ${c.bg} p-4 text-center`}>
              <div className="w-4 h-4 rounded-full mx-auto mb-2" style={{ backgroundColor: c.hex }} />
              <p className={`text-2xl font-heading font-bold ${c.text}`}>{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {alerts.sort((a, b) => levels.indexOf(a.alert_level) - levels.indexOf(b.alert_level)).map(alert => {
          const c = ALERT_COLORS[alert.alert_level];
          return (
            <div key={alert.id} className={`rounded-xl border ${c.border} bg-card overflow-hidden`}>
              <div className={`${c.bg} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: c.hex + '30' }}>
                    <AlertTriangle className="w-4 h-4" style={{ color: c.hex }} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-heading font-bold ${c.text}`}>{alert.title}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{alert.alert_type?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.is_active && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${c.border} ${c.text}`} style={{ backgroundColor: c.hex + '20' }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm text-muted-foreground mb-4">{alert.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Duration</p>
                      <p className="text-xs font-mono text-foreground">{alert.start_date} → {alert.end_date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Max Temp</p>
                      <p className="text-xs font-bold font-mono" style={{ color: c.hex }}>{alert.max_temp_predicted}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Population at Risk</p>
                      <p className="text-xs font-mono text-foreground">{formatNumber(alert.population_at_risk)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Affected Zones</p>
                      <p className="text-xs text-foreground">{alert.affected_zones}</p>
                    </div>
                  </div>
                </div>
                {alert.recommended_actions && (
                  <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Recommended Actions</p>
                    <p className="text-xs text-foreground">{alert.recommended_actions}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}