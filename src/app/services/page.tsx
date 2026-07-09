'use client';

import { useState, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ease = [0.16, 1, 0.3, 1] as const;

const ACCENTS = ['#0A0A0A', '#d8c480', '#b8a8e0'] as const;
const ACCENTS_DARK = ['#F0EDE8', '#d8c480', '#b8a8e0'] as const;

const FEATURES: string[][] = [
  ['Responsive Design', 'Fast Performance', 'SEO Foundations', 'Deployment'],
  ['Responsive Design', 'Motion Design', 'Brand System', 'SEO Foundations', 'Analytics', 'Accessibility'],
  ['Custom Interactions', 'Cinematic Motion', 'Bespoke System', 'Performance', 'SEO', 'Accessibility', 'Analytics', 'Ongoing Refinement'],
];

const PARTICLES = [
  { x: '18%', y: '28%', s: 2, d: 0,   dur: 4.2 },
  { x: '72%', y: '18%', s: 3, d: 0.6, dur: 5.1 },
  { x: '83%', y: '62%', s: 2, d: 1.1, dur: 4.8 },
  { x: '12%', y: '72%', s: 2, d: 1.7, dur: 5.5 },
  { x: '58%', y: '82%', s: 3, d: 0.4, dur: 4.5 },
];

/* ─── Canvas: Landing Page ─── */
function CanvasLanding({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  const navX  = useTransform(px, v => v * 0.3);
  const navY  = useTransform(py, v => v * 0.3);
  const heroX = useTransform(px, v => v * 0.55);
  const heroY = useTransform(py, v => v * 0.45);
  const metX  = useTransform(px, v => v * -0.4);

  return (
    <motion.div
      key="l"
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Fine grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(128,128,128,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style={{ opacity: 0.035 }}>
        <span
          className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8] uppercase tracking-[0.12em]"
          style={{ fontSize: 'clamp(36px, 7vw, 88px)' }}
        >
          FOCUS
        </span>
      </div>

      {/* Nav bar mockup */}
      <motion.div
        className="absolute top-5 left-5 right-5 flex items-center justify-between"
        style={{ x: navX, y: navY }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55, ease }}
      >
        <div className="w-3 h-3 rounded-full bg-[#0A0A0A] dark:bg-[#F0EDE8] opacity-80" />
        <div className="flex gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-5 h-0.5 rounded-full bg-[#0A0A0A] dark:bg-[#F0EDE8] opacity-20" />
          ))}
        </div>
        <div className="border border-[#0A0A0A] dark:border-[#F0EDE8] border-opacity-30 px-2.5 py-1">
          <div className="w-7 h-0.5 bg-[#0A0A0A] dark:bg-[#F0EDE8] opacity-60" />
        </div>
      </motion.div>

      {/* Hero content */}
      <motion.div
        className="absolute left-5 right-5"
        style={{ top: '38%', x: heroX, y: heroY }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease }}
      >
        <div className="flex flex-col gap-2.5">
          <div className="h-1 rounded-full bg-[#0A0A0A] dark:bg-[#F0EDE8] opacity-75" style={{ width: '82%' }} />
          <div className="h-0.5 rounded-full bg-[#0A0A0A] dark:bg-[#F0EDE8] opacity-30" style={{ width: '58%' }} />
          <div className="mt-3 flex items-center gap-3">
            <motion.div
              className="border border-[#0A0A0A] dark:border-[#F0EDE8] border-opacity-50 px-3 py-1.5"
              whileHover={{ opacity: 0.85 }}
            >
              <div className="w-10 h-0.5 bg-[#0A0A0A] dark:bg-[#F0EDE8] opacity-70" />
            </motion.div>
            <div className="h-0.5 rounded-full bg-[#0A0A0A] dark:bg-[#F0EDE8] opacity-15" style={{ width: '52px' }} />
          </div>
        </div>
      </motion.div>

      {/* Perf metric */}
      <motion.div
        className="absolute bottom-5 right-5 text-right"
        style={{ x: metX }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] opacity-28">Perf</p>
        <p className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8] leading-none opacity-70" style={{ fontSize: '22px' }}>100</p>
      </motion.div>

      {/* Baseline */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-[#0A0A0A] dark:bg-[#F0EDE8] origin-left opacity-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.65, duration: 0.7, ease }}
      />
    </motion.div>
  );
}

/* ─── Canvas: Custom Website ─── */
function CanvasCustom({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  const c0x = useTransform(px, v => v * 0.25);
  const c0y = useTransform(py, v => v * 0.15);
  const c1x = useTransform(px, v => v * 0.45);
  const c1y = useTransform(py, v => v * 0.3);
  const c2x = useTransform(px, v => v * 0.65);
  const c2y = useTransform(py, v => v * 0.45);

  const cards = [
    { x: c0x, y: c0y, w: '86%', h: '72%', t: '6%',  l: '3%',  delay: 0.1,  fromX: 20, fromY: -14 },
    { x: c1x, y: c1y, w: '66%', h: '58%', t: '16%', l: '7%',  delay: 0.22, fromX: -16, fromY: 8 },
    { x: c2x, y: c2y, w: '44%', h: '40%', t: '44%', l: '50%', delay: 0.34, fromX: 18, fromY: 22 },
  ];

  return (
    <motion.div
      key="c"
      className="absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {cards.map((c, i) => (
        <motion.div
          key={i}
          className="absolute border border-[#0A0A0A]/[0.07] dark:border-[#F0EDE8]/[0.06] bg-[#F8F5EE] dark:bg-[#100E0A]"
          style={{
            width: c.w, height: c.h,
            top: c.t, left: c.l,
            zIndex: i,
            boxShadow: '0 6px 28px rgba(0,0,0,0.07)',
            x: c.x, y: c.y,
          }}
          initial={{ opacity: 0, x: c.fromX, y: c.fromY }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: c.delay, duration: 0.75, ease }}
        >
          {/* Gold top accent on card 1 */}
          {i === 1 && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-px origin-left"
              style={{ backgroundColor: '#d8c480' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.55, duration: 0.65, ease }}
            />
          )}

          {/* Content lines */}
          <div className="absolute left-4 right-4 top-4 flex flex-col gap-2">
            {[82, 58, 36].slice(0, i === 2 ? 2 : 3).map((w, j) => (
              <div
                key={j}
                className="h-0.5 rounded-full bg-[#0A0A0A] dark:bg-[#F0EDE8]"
                style={{ width: `${w}%`, opacity: j === 0 ? 0.45 : 0.15 }}
              />
            ))}
          </div>

          {/* Swatches on card 2 */}
          {i === 2 && (
            <div className="absolute bottom-3.5 left-4 flex gap-2">
              {['#d8c480', '#0A0A0A', '#F0EDE8'].map(col => (
                <div
                  key={col}
                  className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          )}
        </motion.div>
      ))}

      {/* Thin connector line between card 1 and card 2 */}
      <motion.div
        className="absolute pointer-events-none origin-left"
        style={{
          left: '36%', top: '54%',
          width: '60px', height: '1px',
          background: 'rgba(216,196,128,0.3)',
          transform: 'rotate(-22deg)',
          zIndex: 10,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.75, duration: 0.5, ease }}
      />
    </motion.div>
  );
}

/* ─── Canvas: Signature Experience ─── */
function CanvasSignature({ px, py }: { px: MotionValue<number>; py: MotionValue<number> }) {
  const glowX  = useTransform(px, v => v * -5);
  const glowY  = useTransform(py, v => v * -3);
  const textX  = useTransform(px, v => v * 0.6);
  const textY  = useTransform(py, v => v * 0.4);

  return (
    <motion.div
      key="s"
      className="absolute inset-0 overflow-hidden bg-[#080808]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{ top: '50%', left: '50%', width: '80%', height: '70%', transform: 'translate(-50%, -50%)' }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(216,196,128,0.2) 0%, rgba(140,120,180,0.08) 45%, transparent 70%)',
            filter: 'blur(28px)',
            x: glowX, y: glowY,
          }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#F0EDE8]"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s }}
          animate={{ y: [-6, 6, -6], opacity: [0.18, 0.5, 0.18] }}
          transition={{ duration: p.dur, delay: p.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Cinematic text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
        style={{ x: textX, y: textY }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 1, ease }}
      >
        <span
          style={{
            fontFamily: "var(--font-cormorant, 'Cormorant', serif)",
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 4.5vw, 56px)',
            letterSpacing: '-0.01em',
            color: 'rgba(240,237,232,0.88)',
            textShadow: '0 0 48px rgba(216,196,128,0.45)',
          }}
        >
          Crafted.
        </span>
      </motion.div>

      {/* Slow scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(216,196,128,0.28) 50%, transparent 100%)',
        }}
        animate={{ top: ['4%', '96%', '4%'] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
      />

      {/* Thin bottom lines */}
      {[0, 1].map(i => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 h-px origin-left"
          style={{ bottom: `${14 + i * 8}px`, background: 'rgba(240,237,232,0.05)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.65 + i * 0.15, duration: 0.8, ease }}
        />
      ))}
    </motion.div>
  );
}

/* ─── Process timeline ─── */
function ProcessTimeline({ isDark }: { isDark: boolean }) {
  const steps = [
    { n: '01', title: 'Discovery', body: "We start with a conversation — your goals, your brand, your users. I listen before I sketch." },
    { n: '02', title: 'Design',    body: "A visual direction built around your identity. No templates, no guesswork, no compromise." },
    { n: '03', title: 'Build',     body: "Every interaction, every animation, every detail — crafted to last and perform at the highest level." },
    { n: '04', title: 'Launch',    body: "Deployed, tested, and handed off with care. Post-launch support is part of the process." },
  ];

  const dotColor   = isDark ? '#F0EDE8' : undefined;
  const lineColor  = isDark ? 'rgba(240,237,232,0.12)' : 'rgba(0,0,0,0.08)';
  const fillColor  = isDark ? '#F0EDE8' : '#0A0A0A';
  const labelColor = isDark ? 'rgba(240,237,232,0.28)' : undefined;
  const headColor  = isDark ? '#F0EDE8' : undefined;
  const bodyColor  = isDark ? 'rgba(240,237,232,0.45)' : undefined;

  return (
    <div className="px-8 md:px-14 py-28 md:py-36 border-t" style={{ borderColor: isDark ? 'rgba(240,237,232,0.06)' : 'rgba(0,0,0,0.06)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-16 md:mb-20"
        >
          <div className="w-5 h-px opacity-40" style={{ backgroundColor: isDark ? '#F0EDE8' : '#7A7A7A' }} />
          <span
            className="font-sans text-[11px] tracking-[0.22em] uppercase"
            style={{ color: isDark ? 'rgba(240,237,232,0.38)' : '#7A7A7A' }}
          >
            Process
          </span>
        </motion.div>

        {/* Track */}
        <div className="relative mb-14 md:mb-16">
          {/* Ghost line */}
          <div className="absolute left-0 right-0 top-[5px] h-px" style={{ backgroundColor: lineColor }} />
          {/* Animated fill */}
          <motion.div
            className="absolute left-0 top-[5px] h-px origin-left"
            style={{ backgroundColor: fillColor }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 2.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Dots */}
          <div className="relative flex justify-between">
            {steps.map((_, i) => (
              <motion.div
                key={i}
                className="w-[11px] h-[11px] rounded-full border-2"
                style={{
                  borderColor: dotColor ?? (isDark ? '#F0EDE8' : '#0A0A0A'),
                  backgroundColor: isDark ? '#080808' : 'var(--bg-page, #F8F6F1)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.48, duration: 0.4, ease }}
              />
            ))}
          </div>
        </div>

        {/* Step text */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease }}
            >
              <span className="font-sans text-[9px] tracking-[0.28em] uppercase" style={{ color: labelColor ?? 'rgba(0,0,0,0.25)' }}>
                {step.n}
              </span>
              <h3
                className="font-display font-semibold"
                style={{
                  fontSize: 'clamp(18px, 1.8vw, 24px)',
                  letterSpacing: '-0.015em',
                  lineHeight: 1.2,
                  color: headColor ?? '#0A0A0A',
                }}
              >
                {step.title}
              </h3>
              <p
                className="font-sans text-[13px] leading-[1.85]"
                style={{ color: bodyColor ?? '#7A7A7A' }}
              >
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function ServicesPage() {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const isDark = active === 2;

  const canvasRef = useRef<HTMLDivElement>(null);
  const mx  = useMotionValue(0.5);
  const my  = useMotionValue(0.5);
  const smx = useSpring(mx, { stiffness: 40, damping: 20 });
  const smy = useSpring(my, { stiffness: 40, damping: 20 });
  const px  = useTransform(smx, [0, 1], [-10, 10]);
  const py  = useTransform(smy, [0, 1], [-5, 5]);

  return (
    <div className="min-h-screen">

      {/* ── Opening ── */}
      <section className="pt-44 pb-16 md:pb-24 px-8 md:px-14 border-b border-black/[0.06] dark:border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-14 md:mb-16"
          >
            <div className="w-5 h-px bg-[#7A7A7A] dark:bg-[#6B6B6B] opacity-40" />
            <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
              {t.services.label}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-24 items-end">
            <div className="md:col-span-3">
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.88, delay: 0.08, ease }}
                className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
                style={{ fontSize: 'clamp(40px, 5.5vw, 88px)', letterSpacing: '-0.03em', lineHeight: 1.04 }}
              >
                {t.services.heading}
              </motion.h1>
            </div>
            <div className="md:col-span-2">
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.22, ease }}
                className="font-sans text-[14px] md:text-[15px] leading-[1.85] text-[#7A7A7A] dark:text-[#6B6B6B]"
              >
                {t.services.pricing}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interactive service explorer ── */}
      <section className="px-8 md:px-14 py-20 md:py-28 relative overflow-hidden">
        {/* Dark overlay when Signature active */}
        <AnimatePresence>
          {isDark && (
            <motion.div
              className="absolute inset-0 bg-[#080808] z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            />
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 items-start">

            {/* Service selector */}
            <div className="md:col-span-2 flex flex-col">
              {t.services.tiers.map((tier, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="text-left relative flex flex-col gap-1.5 py-7 pl-5"
                  style={{ borderTop: `1px solid ${isDark ? 'rgba(240,237,232,0.07)' : 'rgba(0,0,0,0.07)'}` }}
                >
                  {/* Active indicator bar */}
                  {active === i && (
                    <motion.div
                      layoutId="activeBar"
                      className="absolute left-0 top-0 bottom-0 w-px"
                      style={{ backgroundColor: isDark ? ACCENTS_DARK[i] : ACCENTS[i] }}
                      transition={{ duration: 0.4, ease }}
                    />
                  )}

                  <span
                    className="font-sans text-[9px] tracking-[0.3em] uppercase transition-colors duration-500"
                    style={{ color: isDark ? 'rgba(240,237,232,0.25)' : 'rgba(0,0,0,0.25)' }}
                  >
                    {tier.number}
                  </span>

                  <span
                    className="font-display font-semibold transition-all duration-500"
                    style={{
                      fontSize: 'clamp(20px, 2.4vw, 34px)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                      color: active === i
                        ? (isDark ? ACCENTS_DARK[i] : ACCENTS[i])
                        : (isDark ? 'rgba(240,237,232,0.2)' : 'rgba(0,0,0,0.2)'),
                    }}
                  >
                    {tier.name}
                  </span>

                  <AnimatePresence>
                    {active === i && (
                      <motion.p
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{ opacity: 1, maxHeight: 140 }}
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{ duration: 0.4, ease }}
                        className="font-sans text-[13px] leading-[1.75] overflow-hidden"
                        style={{ color: isDark ? 'rgba(240,237,232,0.45)' : 'rgba(0,0,0,0.45)' }}
                      >
                        {tier.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              ))}
            </div>

            {/* Canvas + chips */}
            <div className="md:col-span-3 flex flex-col gap-6">
              <div
                ref={canvasRef}
                className="relative w-full overflow-hidden"
                style={{
                  aspectRatio: '4/3',
                  background: isDark ? '#080808' : undefined,
                }}
                onMouseMove={(e) => {
                  const r = canvasRef.current?.getBoundingClientRect();
                  if (!r) return;
                  mx.set((e.clientX - r.left) / r.width);
                  my.set((e.clientY - r.top) / r.height);
                }}
                onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
              >
                {/* Canvas border */}
                <div
                  className="absolute inset-0 border z-10 pointer-events-none"
                  style={{ borderColor: isDark ? 'rgba(240,237,232,0.06)' : 'rgba(0,0,0,0.06)' }}
                />

                {/* Background tint for non-dark states */}
                {!isDark && (
                  <motion.div
                    className="absolute inset-0"
                    animate={{ backgroundColor: active === 0 ? '#F4F2EE' : '#F8F5EC' }}
                    transition={{ duration: 0.6 }}
                  />
                )}

                <AnimatePresence mode="wait">
                  {active === 0 && <CanvasLanding px={px} py={py} />}
                  {active === 1 && <CanvasCustom  px={px} py={py} />}
                  {active === 2 && <CanvasSignature px={px} py={py} />}
                </AnimatePresence>
              </div>

              {/* Feature chips */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {FEATURES[active].map((feat, i) => (
                    <motion.span
                      key={feat}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.055, duration: 0.35, ease }}
                      className="font-sans text-[9px] tracking-[0.16em] uppercase px-3 py-1.5 border"
                      style={{
                        borderColor: isDark ? 'rgba(240,237,232,0.1)' : 'rgba(0,0,0,0.08)',
                        color: isDark ? 'rgba(240,237,232,0.38)' : 'rgba(0,0,0,0.38)',
                      }}
                    >
                      {feat}
                    </motion.span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process timeline ── */}
      <ProcessTimeline isDark={isDark} />

      {/* ── Dark CTA ── */}
      <section className="px-8 md:px-14 py-40 md:py-56 bg-[#0a0a0a] text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center gap-5"
          >
            <div className="w-8 h-px bg-[#F0EDE8]/[0.14]" />
            <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#F0EDE8]/[0.35]">
              {t.cta.label}
            </span>
            <div className="w-8 h-px bg-[#F0EDE8]/[0.14]" />
          </motion.div>

          <h2
            className="font-display font-semibold text-[#F0EDE8]"
            style={{ fontSize: 'clamp(40px, 5.5vw, 88px)', letterSpacing: '-0.03em', lineHeight: 1.04 }}
          >
            {t.cta.heading.map((line, i) => (
              <motion.span
                key={i}
                className="block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.85, delay: i * 0.1, ease }}
              >
                {line}
              </motion.span>
            ))}
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/inquiry"
              className="inline-flex items-center gap-2.5 font-sans text-[10px] tracking-[0.28em] uppercase text-[#F0EDE8] hover:opacity-50 transition-opacity duration-300"
            >
              <span className="border-b border-current pb-px">{t.cta.primary}</span>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 9.5 9.5 1.5M9.5 1.5H3.5M9.5 1.5V7.5" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
