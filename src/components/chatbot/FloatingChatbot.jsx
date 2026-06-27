import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

const SYSTEM_PROMPT = `You are HEATSHIELD AI, a concise assistant for urban heat intelligence. You help with urban heat islands, LST data, cooling strategies, and climate planning for Indian cities. Keep answers brief (2-4 sentences max). For detailed analysis, suggest the user visit the full AI Copilot page.`;

const QUICK_QUESTIONS = [
  'What is Urban Heat Island?',
  'Hottest city in India right now?',
  'Best cooling strategy for Delhi?',
];

async function callFreeAI(messages) {
  const response = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
    }),
  });
  if (!response.ok) throw new Error('error');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, try again.';
}

// 3D animated orb button
function OrbButton({ onClick, hasUnread }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative w-16 h-16 rounded-full focus:outline-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      style={{ filter: 'drop-shadow(0 0 18px rgba(251,146,60,0.7))' }}
    >
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-orange-400/40"
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Secondary glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-red-500/30"
        animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* Main sphere */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #fed7aa, #f97316 40%, #dc2626 70%, #7f1d1d)',
          boxShadow: 'inset 0 -4px 12px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.15)',
        }}
      />
      {/* Shine */}
      <div
        className="absolute top-2 left-3 w-5 h-3 rounded-full opacity-60"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)' }}
      />
      {/* Bot icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Bot className="w-6 h-6 text-white drop-shadow" />
      </div>
      {/* Unread dot */}
      {hasUnread && (
        <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 border-2 border-background flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">!</span>
        </div>
      )}
    </motion.button>
  );
}

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m HEATSHIELD AI 🌡️ Ask me about urban heat, cooling strategies, or city temperatures!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [open, messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const apiHistory = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const reply = await callFreeAI(apiHistory);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[2000] flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="w-80 rounded-2xl border border-orange-500/20 overflow-hidden shadow-2xl"
            style={{
              background: 'hsl(222 47% 8%)',
              boxShadow: '0 0 40px rgba(251,146,60,0.15), 0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b border-orange-500/20"
              style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(220,38,38,0.1))' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'radial-gradient(circle at 35% 35%, #fed7aa, #f97316 40%, #dc2626)' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">HEATSHIELD AI</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-400">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link to="/copilot" onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                  title="Open full Copilot">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'radial-gradient(circle, #f97316, #dc2626)' }}>
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/60 text-foreground'
                  }`}>
                    {msg.role === 'user' ? msg.content : (
                      <div className="prose prose-xs prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'radial-gradient(circle, #f97316, #dc2626)' }}>
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="rounded-xl bg-secondary/60 px-3 py-2 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="px-2 py-1 rounded-full text-[10px] bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage(input))}
                placeholder="Ask about heat…"
                disabled={loading}
                className="flex-1 text-xs bg-secondary border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-primary/80 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating orb */}
      <OrbButton onClick={() => setOpen(v => !v)} hasUnread={hasUnread && !open} />
    </div>
  );
}