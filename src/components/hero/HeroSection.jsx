import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Satellite, Target, ArrowDownRight } from 'lucide-react';
import HeroGlobe from './HeroGlobe';

const TICKER_ITEMS = [
  'LST 51.7°C · Delhi NCR',
  'Extreme Heatwave · Rajasthan',
  'Sentinel-2 Pass · 14:32 UTC',
  'Green Cover · −0.8%/yr',
  'LSTM v4.2 Updated',
  'Landsat 9 · Band 10',
];

// Curtain entrance animation — covers screen then slides away
function CurtainReveal({ onDone }) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex"
      initial="closed"
      animate="open"
      onAnimationComplete={onDone}
    >
      {/* Left panel */}
      <motion.div
        className="flex-1 origin-left"
        style={{ background: '#0a0202' }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
      />
      {/* Right panel */}
      <motion.div
        className="flex-1 origin-right"
        style={{ background: '#0a0202' }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 1.1, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
      />
      {/* Center title during curtain */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="text-center">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#8B1A1A]/70 font-light mb-3">Urban Heat Intelligence</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white/90 leading-none">
            HEATSHIELD
          </h1>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection() {
  const [curtainDone, setCurtainDone] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const globeY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const id = setInterval(() => setTickerIndex(i => (i + 1) % TICKER_ITEMS.length), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* Curtain entrance */}
      <AnimatePresence>
        {!curtainDone && <CurtainReveal onDone={() => setCurtainDone(true)} />}
      </AnimatePresence>

      <section
        ref={sectionRef}
        className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: '#030408' }}
      >
        {/* ── Film grain texture overlay ──────────────────────────────── */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        {/* ── Deep crimson radial glow — bottom center ────────────────── */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 55% at 50% 90%, rgba(120,15,15,0.45) 0%, rgba(60,5,5,0.2) 50%, transparent 100%)',
          }}
        />

        {/* ── Top edge crimson accent line ────────────────────────────── */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px z-10"
          style={{ background: 'linear-gradient(90deg, transparent, #8B1A1A, #c0392b, #8B1A1A, transparent)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: curtainDone ? 1 : 0, opacity: curtainDone ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
        />

        {/* ── Globe — full bleed background, parallax ─────────────────── */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-[2]"
          style={{ y: globeY }}
        >
          <div className="w-full max-w-2xl aspect-square opacity-60" style={{ filter: 'saturate(0.7) hue-rotate(340deg)' }}>
            <HeroGlobe />
          </div>
        </motion.div>

        {/* ── Vignette over globe ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 z-[3] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 25%, rgba(3,4,8,0.55) 60%, rgba(3,4,8,0.97) 100%)',
          }}
        />

        {/* ── Top-left wordmark ───────────────────────────────────────── */}
        <motion.div
          className="absolute top-8 left-8 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: curtainDone ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <p className="text-[10px] tracking-[0.35em] uppercase text-white/20 leading-none mb-0.5">ISRO · 2026</p>
          <p className="text-xs tracking-[0.2em] uppercase text-white/50 font-semibold">HEATSHIELD AI</p>
        </motion.div>

        {/* ── Top-right live pulse ─────────────────────────────────────── */}
        <motion.div
          className="absolute top-8 right-8 z-20 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: curtainDone ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#c0392b] animate-pulse" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/25">Live</span>
        </motion.div>

        {/* ── Main content — centered ──────────────────────────────────── */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6"
          style={{ y: textY, opacity }}
        >
          {/* Eyebrow */}
          <motion.p
            className="text-[10px] tracking-[0.5em] uppercase text-[#8B1A1A] mb-10"
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: curtainDone ? 1 : 0, letterSpacing: curtainDone ? '0.5em' : '0.2em' }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            Urban Heat Intelligence
          </motion.p>

          {/* Hero headline — split reveal */}
          <div className="overflow-hidden mb-2">
            <motion.h1
              className="text-[clamp(4rem,13vw,11rem)] font-black leading-[0.88] tracking-[-0.04em] text-white"
              initial={{ y: '110%' }}
              animate={{ y: curtainDone ? '0%' : '110%' }}
              transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              HEAT
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h1
              className="text-[clamp(4rem,13vw,11rem)] font-black leading-[0.88] tracking-[-0.04em]"
              style={{ color: '#8B1A1A', WebkitTextStroke: '1px #8B1A1A' }}
              initial={{ y: '110%' }}
              animate={{ y: curtainDone ? '0%' : '110%' }}
              transition={{ duration: 1.0, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              SHIELD
            </motion.h1>
          </div>

          {/* Divider line */}
          <motion.div
            className="w-16 h-px mb-8"
            style={{ background: 'linear-gradient(90deg, transparent, #8B1A1A, transparent)' }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: curtainDone ? 1 : 0, opacity: curtainDone ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />

          {/* Subtitle — minimal */}
          <motion.p
            className="text-[13px] text-white/30 tracking-wider max-w-xs leading-relaxed mb-14 font-light"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: curtainDone ? 1 : 0, y: curtainDone ? 0 : 12 }}
            transition={{ duration: 0.9, delay: 0.7 }}
          >
            AI-powered satellite intelligence<br />for urban heat island detection
          </motion.p>

          {/* CTA — minimal ghost buttons */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: curtainDone ? 1 : 0, y: curtainDone ? 0 : 16 }}
            transition={{ duration: 0.8, delay: 0.85 }}
          >
            <Link
              to="/heat-map"
              className="group flex items-center gap-3 px-7 py-3 border border-white/10 text-white/50 text-xs tracking-[0.25em] uppercase hover:border-white/30 hover:text-white/80 transition-all duration-500"
            >
              <Satellite className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
              Explore
            </Link>
            <Link
              to="/heat-strategies"
              className="group flex items-center gap-3 px-7 py-3 border border-[#8B1A1A]/40 text-[#c0392b]/70 text-xs tracking-[0.25em] uppercase hover:border-[#c0392b] hover:text-[#c0392b] transition-all duration-500"
            >
              Strategies
              <ArrowDownRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* ── Bottom-left: rolling ticker ──────────────────────────────── */}
        <motion.div
          className="absolute bottom-8 left-8 z-20 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: curtainDone ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          <span className="text-[9px] tracking-[0.35em] uppercase text-white/15">Signal</span>
          <span className="w-px h-3 bg-white/10" />
          <AnimatePresence mode="wait">
            <motion.span
              key={tickerIndex}
              className="text-[10px] text-white/25 tracking-wider font-mono"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.35 }}
            >
              {TICKER_ITEMS[tickerIndex]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* ── Bottom-right: scroll hint ─────────────────────────────────── */}
        <motion.div
          className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: curtainDone ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <motion.div
            className="w-px h-8 origin-top"
            style={{ background: 'linear-gradient(to bottom, #8B1A1A, transparent)' }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
          />
          <span className="text-[9px] tracking-[0.35em] uppercase text-white/15">Scroll</span>
        </motion.div>

        {/* ── Bottom fade into dashboard ───────────────────────────────── */}
        <div
          className="absolute bottom-0 inset-x-0 h-40 pointer-events-none z-[5]"
          style={{ background: 'linear-gradient(to top, hsl(222,47%,6%) 0%, transparent 100%)' }}
        />
      </section>
    </>
  );
}