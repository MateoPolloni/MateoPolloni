'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* ─────────────────────────────────────────────
   SOUNDBUY CANVAS
   Floating particles with mouse repulsion +
   animated equalizer bars — runs in own RAF loop
───────────────────────────────────────────── */

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; a: number; c: string;
}

const PURPLES = ['#7c3aed', '#9d5af5', '#c084fc', '#6d28d9', '#a78bfa', '#ddd6fe'];

function SoundBuyCanvas({
  mouseRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let W = 0, H = 0, t = 0;
    let ps: Particle[] = [];

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = el.offsetWidth;
      H = el.offsetHeight;
      el.width = W * dpr;
      el.height = H * dpr;
      el.style.width = W + 'px';
      el.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ps = Array.from({ length: 62 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.38,
        vy: -(Math.random() * 0.26 + 0.04),
        r: Math.random() * 1.65 + 0.35,
        a: Math.random() * 0.48 + 0.07,
        c: PURPLES[Math.floor(Math.random() * PURPLES.length)],
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.016;

      // Ambient purple glow
      const glow = ctx.createRadialGradient(W * 0.34, H * 0.52, 0, W * 0.34, H * 0.52, W * 0.78);
      glow.addColorStop(0, 'rgba(109,40,217,.13)');
      glow.addColorStop(0.5, 'rgba(124,58,237,.04)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Secondary shimmer top-right
      const shimmer = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, W * 0.4);
      shimmer.addColorStop(0, 'rgba(192,132,252,.05)');
      shimmer.addColorStop(1, 'transparent');
      ctx.fillStyle = shimmer;
      ctx.fillRect(0, 0, W, H);

      const mx = mouseRef.current.x * W;
      const my = mouseRef.current.y * H;

      ps.forEach(p => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 115 && dist > 0) {
          const force = (115 - dist) / 115;
          p.vx += (dx / dist) * force * 0.11;
          p.vy += (dy / dist) * force * 0.08;
        }
        p.vx *= 0.978;
        p.vy *= 0.978;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += W;
        if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H;
        if (p.y > H) p.y -= H;

        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      // Equalizer bars
      const bars = 30;
      const step = W / bars;
      for (let i = 0; i < bars; i++) {
        const bh = (Math.sin(t * 1.85 + i * 0.48) * 0.5 + 0.5) * H * 0.1 + 3;
        const bx = i * step + step * 0.2;
        const alpha = 0.08 + (Math.sin(t * 1.25 + i * 0.32) * 0.5 + 0.5) * 0.09;
        const bg = ctx.createLinearGradient(0, H - bh, 0, H);
        bg.addColorStop(0, `rgba(192,132,252,${(alpha * 2.4).toFixed(3)})`);
        bg.addColorStop(1, 'rgba(124,58,237,0)');
        ctx.fillStyle = bg;
        ctx.fillRect(bx, H - bh, step * 0.5, bh);
      }
    };

    const loop = () => {
      if (!document.hidden) frame();
      raf = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(init);
    init();
    loop();
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [mouseRef]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}

/* ─────────────────────────────────────────────
   DETTAGLI PANEL
   Layered CSS atmosphere: automotive spotlight,
   chrome crease lines, headlight rings.
   Two parallax depths driven by mouse.
───────────────────────────────────────────── */

function DettagliPanel({
  mx,
  my,
}: {
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const lx = useTransform(mx, [0, 1], [7, -7]);
  const ly = useTransform(my, [0, 1], [4, -4]);
  const fx = useTransform(mx, [0, 1], [14, -14]);
  const fy = useTransform(my, [0, 1], [8, -8]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#0a0a0c' }}>

      {/* Layer 1 — deep atmospheric light */}
      <motion.div className="absolute inset-0" style={{ x: lx, y: ly }}>
        {/* Main spotlight — premium automotive studio lighting */}
        <div style={{
          position: 'absolute',
          top: '-18%', right: '-6%',
          width: '88%', height: '88%',
          background: 'radial-gradient(ellipse at 68% 28%, rgba(228,218,196,.058) 0%, rgba(178,158,118,.02) 38%, transparent 62%)',
        }} />
        {/* Warm floor reflection */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(200,169,81,.026) 0%, transparent 38%)',
        }} />
      </motion.div>

      {/* Layer 2 — precision detail elements */}
      <motion.div className="absolute inset-0" style={{ x: fx, y: fy }}>
        {/* Body crease lines — three staggered */}
        {[
          { top: '29%', left: '4%',  width: '64%', rot: '-6.5deg', o: 0.088 },
          { top: '35%', left: '16%', width: '50%', rot: '-6.5deg', o: 0.052 },
          { top: '41%', left: '26%', width: '36%', rot: '-6.5deg', o: 0.028 },
        ].map((l, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: l.top, left: l.left,
            width: l.width, height: '1px',
            background: `linear-gradient(to right, transparent, rgba(242,241,237,${l.o}), rgba(242,241,237,${l.o * 0.4}), transparent)`,
            transform: `rotate(${l.rot})`,
          }} />
        ))}

        {/* Headlight outer ring */}
        <div style={{
          position: 'absolute',
          top: '20%', right: '19%',
          width: '100px', height: '100px',
          borderRadius: '50%',
          border: '1px solid rgba(242,241,237,.046)',
          boxShadow: '0 0 42px rgba(222,212,192,.032), inset 0 0 18px rgba(222,212,192,.022)',
        }} />
        {/* Headlight inner ring */}
        <div style={{
          position: 'absolute',
          top: 'calc(20% + 22px)', right: 'calc(19% + 22px)',
          width: '56px', height: '56px',
          borderRadius: '50%',
          border: '1px solid rgba(242,241,237,.028)',
        }} />
        {/* Headlight core glow */}
        <div style={{
          position: 'absolute',
          top: 'calc(20% + 36px)', right: 'calc(19% + 36px)',
          width: '28px', height: '28px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(240,234,220,.04) 0%, transparent 100%)',
        }} />

        {/* Fine vertical accent lines — suggest panel gaps */}
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            position: 'absolute',
            left: `${33 + i * 9}%`, top: '63%',
            width: '1px', height: `${7 + i * 2}%`,
            background: `rgba(242,241,237,${0.026 + i * 0.008})`,
          }} />
        ))}

        {/* Horizontal base line — ground plane suggestion */}
        <div style={{
          position: 'absolute',
          bottom: '22%', left: '8%', right: '8%',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(242,241,237,.035) 20%, rgba(242,241,237,.035) 80%, transparent)',
        }} />
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */

export default function Hero() {
  const { t, lang } = useLanguage();

  // Normalized mouse position 0–1
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      mouseRef.current = { x, y };
      mx.set(x);
      my.set(y);
    };
    const onTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      const x = touch.clientX / window.innerWidth;
      const y = touch.clientY / window.innerHeight;
      mouseRef.current = { x, y };
      mx.set(x);
      my.set(y);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [mx, my]);

  // Divider: mouse maps to [43%, 57%] with spring physics
  const rawDivider = useTransform(mx, [0, 1], [43, 57]);
  const divider = useSpring(rawDivider, { stiffness: 38, damping: 19, mass: 1.2 });

  const leftClip  = useTransform(divider, v => `polygon(0 0, ${v}% 0, ${v}% 100%, 0 100%)`);
  const rightClip = useTransform(divider, v => `polygon(${v}% 0, 100% 0, 100% 100%, ${v}% 100%)`);
  const dividerPos = useTransform(divider, v => `${v}%`);

  // Subtle text parallax — opposite to cursor
  const textX = useTransform(mx, [0, 1], [7, -7]);
  const textY = useTransform(my, [0, 1], [3.5, -3.5]);

  return (
    <motion.section
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100dvh - 4rem)', minHeight: '560px' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
    >
      {/* ── SoundBuy world ── */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: leftClip, background: '#06060a' }}
      >
        <SoundBuyCanvas mouseRef={mouseRef} />
      </motion.div>

      {/* ── Dettagli world ── */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: rightClip }}
      >
        <DettagliPanel mx={mx} my={my} />
      </motion.div>

      {/* ── Divider line ── */}
      <motion.div
        className="absolute top-0 bottom-0 w-px pointer-events-none"
        style={{
          left: dividerPos,
          background: 'linear-gradient(to bottom, transparent 4%, rgba(255,255,255,.09) 26%, rgba(255,255,255,.2) 50%, rgba(255,255,255,.09) 74%, transparent 96%)',
          boxShadow: '0 0 10px rgba(255,255,255,.045), 0 0 28px rgba(255,255,255,.022)',
        }}
      />

      {/* ── Central headline ── */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-8">
        <motion.div
          className="text-center"
          style={{ x: textX, y: textY }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.25, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'clamp(36px, 5.6vw, 90px)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#F0EDE8',
            }}
          >
            {lang === 'en' ? (
              <>
                I design websites<br />
                that{' '}
                <em style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  letterSpacing: '0.01em',
                }}>
                  feel
                </em>
                {' '}like something.
              </>
            ) : (
              <>
                Diseño sitios web<br />
                que{' '}
                <em style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  letterSpacing: '0.01em',
                }}>
                  transmiten
                </em>
                {' '}algo.
              </>
            )}
          </h1>

          <p
            style={{
              marginTop: '1.4rem',
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(12px, 1.05vw, 15px)',
              lineHeight: 1.75,
              letterSpacing: '0.01em',
              color: '#60608a',
              maxWidth: '360px',
              margin: '1.4rem auto 0',
            }}
          >
            {t.hero.sub}
          </p>
        </motion.div>
      </div>

      {/* ── Bottom bar: labels + scroll ── */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-10 md:px-14 pb-9 pointer-events-none">

        {/* SoundBuy label */}
        <motion.div
          className="flex flex-col gap-2.5 pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2">
            {/* Mini waveform icon */}
            <svg width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden="true">
              {([[3,4],[6,8],[9,13],[12,8],[15,4]] as [number,number][]).map(([x, h], i) => (
                <rect key={i} x={x - 1} y={(13 - h) / 2} width="2" height={h}
                  rx="1" fill="rgba(192,132,252,.6)" />
              ))}
            </svg>
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.15em',
              background: 'linear-gradient(135deg, #eeeeff 0%, #c084fc 45%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              SOUNDBUY
            </span>
          </div>
          <a
            href="https://soundbuy-ten.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300"
            style={{ fontFamily: 'var(--font-sans)', fontSize: '8.5px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#5050a0' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#c084fc')}
            onMouseLeave={e => (e.currentTarget.style.color = '#5050a0')}
          >
            Explore Project
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 8.5 8.5 1.5M8.5 1.5H3M8.5 1.5V7" />
            </svg>
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="flex flex-col items-center gap-2 pb-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '7.5px',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: 'rgba(240,237,232,.2)',
          }}>
            SCROLL
          </span>
          <div className="w-px h-7" style={{
            background: 'linear-gradient(to bottom, rgba(240,237,232,.22), transparent)',
          }} />
        </motion.div>

        {/* Dettagli label */}
        <motion.div
          className="flex flex-col gap-2.5 items-end pointer-events-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <span style={{
            fontFamily: "'Cormorant', serif",
            fontWeight: 500,
            fontSize: '16px',
            letterSpacing: '0.15em',
            color: '#f2f1ed',
            textTransform: 'uppercase',
          }}>
            DETTAGLI
          </span>
          <a
            href="https://dettagli-six.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors duration-300"
            style={{ fontFamily: 'var(--font-sans)', fontSize: '8.5px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#606068' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f2f1ed')}
            onMouseLeave={e => (e.currentTarget.style.color = '#606068')}
          >
            Explore Project
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 8.5 8.5 1.5M8.5 1.5H3M8.5 1.5V7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
