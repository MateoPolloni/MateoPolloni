'use client';

import { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* ─── Scale: iframe renders at 1/SCALE of the container width ─── */
const SCALE = 0.28;
const INV = `${(100 / SCALE).toFixed(2)}%`; // "357.14%"

/* ─── SVG idle logos — scale perfectly in any screen size ─── */

function SoundBuyIdleSVG() {
  const uid = useId();
  const gid = `sbg-${uid.replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 260 38" width="68%" aria-label="SOUNDBUY">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eeeeff" />
          <stop offset="45%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <text
        x="130" y="27"
        textAnchor="middle"
        style={{ fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)", fontWeight: 800 }}
        fontSize="19"
        letterSpacing="3.5"
        fill={`url(#${gid})`}
      >
        SOUNDBUY
      </text>
    </svg>
  );
}

function DettagliIdleSVG() {
  return (
    <svg viewBox="0 0 240 38" width="68%" aria-label="DETTAGLI">
      <text
        x="120" y="28"
        textAnchor="middle"
        style={{ fontFamily: "var(--font-cormorant, 'Cormorant', serif)", fontWeight: 500 }}
        fontSize="22"
        letterSpacing="5.5"
        fill="#f2f1ed"
      >
        DETTAGLI
      </text>
    </svg>
  );
}

/* ─── Card logos (large, above the device mockup) ─── */

function SoundBuyCardLogo() {
  return (
    <span
      style={{
        fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)",
        fontWeight: 800,
        fontSize: '22px',
        letterSpacing: '0.16em',
        textTransform: 'uppercase' as const,
        background: 'linear-gradient(135deg, #eeeeff 0%, #c084fc 45%, #7c3aed 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1.2,
        display: 'inline-block',
      }}
    >
      SOUNDBUY
    </span>
  );
}

function DettagliCardLogo() {
  return (
    <span
      className="text-[#0A0A0A] dark:text-[#f2f1ed]"
      style={{
        fontFamily: "var(--font-cormorant, 'Cormorant', serif)",
        fontWeight: 500,
        fontSize: '26px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        lineHeight: 1.2,
        display: 'inline-block',
      }}
    >
      DETTAGLI
    </span>
  );
}

/* ─── Device screen: iframe behind dark overlay ─── */

function DeviceScreen({
  url,
  IdleLogo,
  isRevealed,
  offsetTop = '0%',
}: {
  url: string;
  IdleLogo: React.FC;
  isRevealed: boolean;
  offsetTop?: string;
}) {
  return (
    <div className="absolute inset-0" style={{ background: '#000', overflow: 'hidden' }}>
      {/* iframe — always loaded, pointer-events none */}
      <div
        style={{
          position: 'absolute',
          top: offsetTop,
          left: 0,
          width: INV,
          height: INV,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <iframe
          src={url}
          title="Project preview"
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          tabIndex={-1}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      {/* Dark overlay — fades out on hover to reveal iframe */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: '#000' }}
        animate={{ opacity: isRevealed ? 0 : 1 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Subtle ambient glow behind logo */}
          <div
            style={{
              position: 'absolute',
              width: '50%',
              height: '35%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              filter: 'blur(16px)',
            }}
          />
          <IdleLogo />
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Monitor mockup ─── */

function MonitorMockup({
  url,
  IdleLogo,
  isRevealed,
}: {
  url: string;
  IdleLogo: React.FC;
  isRevealed: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full rounded-lg border border-white/[0.07] overflow-hidden"
        style={{ background: '#151515' }}
      >
        {/* Mac-style title bar */}
        <div className="flex items-center gap-1.5 px-3 py-2">
          {['#ff5f57', '#ffbd2e', '#28c941'].map((c, i) => (
            <div key={i} className="w-[7px] h-[7px] rounded-full" style={{ background: c, opacity: 0.85 }} />
          ))}
        </div>
        {/* Screen */}
        <div
          className="relative w-full"
          style={{ aspectRatio: '16 / 10', background: '#000', overflow: 'hidden' }}
        >
          <DeviceScreen url={url} IdleLogo={IdleLogo} isRevealed={isRevealed} />
          {/* Subtle screen glare */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.025) 0%, transparent 50%)' }}
          />
        </div>
      </div>
      {/* Stand */}
      <div style={{ width: '9%', height: '12px', background: '#151515' }} />
      <div
        style={{
          width: '26%',
          height: '3px',
          background: '#151515',
          borderRadius: '99px',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      />
    </div>
  );
}

/* ─── Phone mockup ─── */

function PhoneMockup({
  url,
  IdleLogo,
  isRevealed,
}: {
  url: string;
  IdleLogo: React.FC;
  isRevealed: boolean;
}) {
  return (
    <div
      className="border border-white/[0.07] overflow-hidden"
      style={{
        background: '#151515',
        borderRadius: '13%',
        aspectRatio: '9 / 19.5',
        padding: '4px',
      }}
    >
      {/* Screen with rounded corners */}
      <div
        className="relative h-full overflow-hidden"
        style={{ background: '#000', borderRadius: '10%' }}
      >
        {/* Dynamic island */}
        <div
          style={{
            position: 'absolute',
            top: '4%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '23%',
            height: '4.5%',
            background: '#151515',
            borderRadius: '99px',
            zIndex: 10,
          }}
        />
        <DeviceScreen url={url} IdleLogo={IdleLogo} isRevealed={isRevealed} offsetTop="9%" />
      </div>
    </div>
  );
}

/* ─── Project card ─── */

interface ProjectConfig {
  url: string;
  tag: string;
  CardLogo: React.FC;
  IdleLogo: React.FC;
}

function ProjectCard({
  config,
  viewLabel,
  index,
}: {
  config: ProjectConfig;
  viewLabel: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col gap-7"
    >
      {/* Logo + tag — fixed height so device mockups align across both cards */}
      <div className="flex flex-col gap-1.5" style={{ minHeight: '64px' }}>
        <config.CardLogo />
        <span className="font-sans text-[10px] tracking-[0.22em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
          {config.tag}
        </span>
      </div>

      {/* Devices */}
      <div className="relative select-none">
        {/* Monitor — 75% of card width */}
        <div style={{ width: '75%' }}>
          <MonitorMockup url={config.url} IdleLogo={config.IdleLogo} isRevealed={hovered} />
        </div>
        {/* Phone — absolute right, vertically centered on monitor */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20%',
          }}
        >
          <PhoneMockup url={config.url} IdleLogo={config.IdleLogo} isRevealed={hovered} />
        </div>
      </div>

      {/* View project link — appears on hover */}
      <div style={{ minHeight: '28px' }}>
        <AnimatePresence>
          {hovered && (
            <motion.a
              href={config.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2.5 font-sans text-[10px] tracking-[0.22em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] hover:opacity-50 transition-opacity duration-300"
            >
              <span className="border-b border-current pb-px">{viewLabel}</span>
              <svg
                width="11"
                height="11"
                viewBox="0 0 11 11"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1.5 9.5 9.5 1.5M9.5 1.5H3.5M9.5 1.5V7.5" />
              </svg>
            </motion.a>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Section ─── */

export default function Portfolio() {
  const { t } = useLanguage();

  const projects: ProjectConfig[] = [
    {
      url: t.portfolio.projects[0].url,
      tag: t.portfolio.projects[0].tag,
      CardLogo: SoundBuyCardLogo,
      IdleLogo: SoundBuyIdleSVG,
    },
    {
      url: t.portfolio.projects[1].url,
      tag: t.portfolio.projects[1].tag,
      CardLogo: DettagliCardLogo,
      IdleLogo: DettagliIdleSVG,
    },
  ];

  return (
    <section className="px-8 md:px-14 py-24 md:py-32 pb-32 md:pb-48">
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-sans text-[9px] tracking-[0.32em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B] mb-20 md:mb-24"
        >
          {t.portfolio.label}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
          {projects.map((config, i) => (
            <ProjectCard
              key={i}
              config={config}
              viewLabel={t.portfolio.viewProject}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
