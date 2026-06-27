import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  'Why is Connaught Place the hottest zone in Delhi?',
  'What is the most cost-effective cooling intervention for Chandni Chowk?',
  'How much cooling can adding 25% tree cover achieve?',
  'Generate an executive summary of Delhi\'s urban heat risk',
  'Compare cooling strategies: green roofs vs cool roofs',
  'What is the predicted heatwave risk for next month?',
];

const SYSTEM_PROMPT = `You are HEATSHIELD AI Copilot, an expert AI assistant for urban heat mitigation and climate planning. You are part of an Urban Heat Digital Twin platform built for ISRO Bharatiya Antariksh Hackathon 2026.

Context about the system:
- Monitors Delhi NCR with avg LST of 42.3°C and max LST of 51.7°C
- UHI intensity is 6.8°C
- Hottest zones: Chandni Chowk (50.1°C, score 97), Connaught Place (49.2°C, score 95), Karol Bagh (47.8°C, score 91)
- Primary heat drivers: Low vegetation (38%), Dense buildings (27%), Road density (14%), Low wind (11%), Population (10%)
- Green cover is only 15.2%, impervious surfaces at 68.3%
- Active red heatwave alert for Connaught Place, Chandni Chowk, Karol Bagh, Rohini
- Cooling interventions: tree cover, green/cool roofs, reflective pavements, water bodies, urban parks, green corridors
- Best optimization: Maximum cooling of -5.8°C at ₹342Cr cost

Answer with detailed, research-grade analysis. Use markdown formatting. Include specific numbers and recommendations.`;

async function callFreeAI(messages) {
  const response = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });
  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `# Welcome to HEATSHIELD AI Copilot 🌡️

I'm your AI Urban Planning Assistant. I can help you with:

- **Heat Analysis** — Understanding why specific locations are hot
- **Intervention Recommendations** — Which cooling strategies to apply
- **Cost Estimates** — Implementation costs and timelines
- **Report Generation** — Executive summaries and planning documents
- **Data Insights** — Interpreting satellite analytics and forecasts

Ask me anything about urban heat mitigation!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    const updatedMessages = [...messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0), userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history (exclude first welcome message for API)
      const apiHistory = [...messages.slice(1), userMsg].map(m => ({ role: m.role, content: m.content }));
      const reply = await callFreeAI(apiHistory);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I encountered an error connecting to the AI service. Please try again in a moment.' }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="p-6 h-[calc(100vh-0px)] flex flex-col">
      <PageHeader icon={MessageSquare} title="AI Urban Planner Copilot" subtitle="Intelligent assistant for urban heat analysis, intervention planning, and report generation" />

      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none text-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="rounded-xl bg-secondary/50 px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing…
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Suggested questions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors border border-border"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border flex items-center gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about urban heat, interventions, forecasts, or request reports..."
            className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={loading}
          />
          <Button type="submit" disabled={!input.trim() || loading} size="icon" className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}