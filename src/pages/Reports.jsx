import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';

const REPORT_TYPES = {
  heat_risk: { label: 'Heat Risk Report', icon: '🌡️' },
  cooling_strategy: { label: 'Cooling Strategy Report', icon: '❄️' },
  urban_assessment: { label: 'Urban Heat Assessment', icon: '🏙️' },
  executive_summary: { label: 'Executive Summary', icon: '📋' },
  planning_document: { label: 'Planning Document', icon: '📐' },
};

async function generateWithAI(reportType) {
  const typeInfo = REPORT_TYPES[reportType];
  try {
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [{
          role: 'user',
          content: `Generate a professional ${typeInfo.label} for Delhi NCR as part of the HEATSHIELD AI Urban Heat Intelligence Platform for ISRO Bharatiya Antariksh Hackathon 2026.

Key data:
- City: Delhi NCR, Population: 32.9M, Area: 1484 sq km
- Average LST: 42.3°C, Maximum LST: 51.7°C
- UHI Intensity: 6.8°C, Heat Risk Score: 92/100 (Extreme)
- Green Cover: 15.2%, Impervious Surface: 68.3%
- Hottest Zones: Chandni Chowk (50.1°C), Connaught Place (49.2°C), Karol Bagh (47.8°C)
- Heat Drivers: Low vegetation (38%), Dense buildings (27%), Road density (14%), Low wind (11%)
- Best cooling scenario: -5.8°C reduction at ₹342Cr

Format with proper markdown sections: Executive Summary, Key Findings, Risk Assessment, Recommendations, Methodology, Conclusion. Make it research-grade and actionable.`
        }],
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Report generation failed.';
  } catch {
    return `# ${typeInfo.label} — Delhi NCR\n\n## Executive Summary\n\nDelhi NCR faces critical urban heat challenges with LST averaging 42.3°C.\n\n## Key Findings\n\n- Max LST: 51.7°C in Chandni Chowk\n- UHI Intensity: 6.8°C above rural baseline\n- Green cover critically low at 15.2%\n\n## Recommendations\n\n1. Increase urban tree cover by 25%\n2. Deploy cool roofs on 40% of buildings\n3. Restore and create urban water bodies\n4. Establish green corridors along arterial roads`;
  }
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('executive_summary');

  useEffect(() => {
    base44.entities.Report.list().then(data => {
      setReports(data);
      setLoading(false);
    });
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    const typeInfo = REPORT_TYPES[selectedType];
    const newReport = await base44.entities.Report.create({
      title: `${typeInfo.label} — Delhi NCR`,
      report_type: selectedType,
      status: 'generating',
      created_date: new Date().toISOString(),
    });
    setReports(await base44.entities.Report.list());

    const content = await generateWithAI(selectedType);
    const summary = content.replace(/#+/g, '').substring(0, 200) + '...';
    await base44.entities.Report.update(newReport.id, { content, summary, status: 'completed' });
    setReports(await base44.entities.Report.list());
    setGenerating(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={FileText} title="Reporting Engine" subtitle="Generate AI-powered urban heat assessment reports and planning documents">
        <div className="flex items-center gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-52 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REPORT_TYPES).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generateReport} disabled={generating}>
            {generating ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Generating...</> : <><Plus className="w-3.5 h-3.5 mr-2" /> Generate</>}
          </Button>
        </div>
      </PageHeader>

      {reports.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No reports generated yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Select a report type and click Generate</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(report => {
            const typeInfo = REPORT_TYPES[report.report_type] || { label: report.report_type, icon: '📄' };
            return (
              <div key={report.id} className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg">{typeInfo.icon}</span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      report.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      report.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {report.status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                       report.status === 'generating' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                       <AlertCircle className="w-3 h-3" />}
                      {report.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-heading font-semibold text-foreground mb-1">{report.title}</h3>
                  <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                  {report.summary && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{report.summary}</p>}
                  <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(report.created_date).toLocaleDateString()}
                  </div>
                </div>
                {report.status === 'completed' && report.content && (
                  <div className="border-t border-border p-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full text-xs">View Report</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card">
                        <DialogHeader>
                          <DialogTitle>{report.title}</DialogTitle>
                        </DialogHeader>
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{report.content}</ReactMarkdown>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
