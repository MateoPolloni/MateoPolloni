'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const lineVariant = {
  hidden: { y: '105%', opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 1.0,
      delay: 0.5 + i * 0.13,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
};

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-8 md:px-14 pt-24 pb-16">
      {/* Radial glow — subtle depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(240,237,232,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full flex flex-col justify-between min-h-[calc(100vh-6rem)]">
        {/* Top — eyebrow + headline */}
        <div className="pt-[12vh]">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-sans text-[9px] tracking-[0.32em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B] mb-10 md:mb-14"
          >
            {t.hero.eyebrow}
          </motion.p>

          {/* Headline — line-by-line lift */}
          <h1 className="mb-10 md:mb-14">
            {t.hero.headline.map((line, i) => (
              <div key={i} className="overflow-hidden leading-none">
                <motion.span
                  className="block font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
                  style={{
                    fontSize: 'clamp(50px, 7.5vw, 112px)',
                    lineHeight: '1.02',
                    letterSpacing: '-0.03em',
                  }}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={lineVariant}
                >
                  {line}
                </motion.span>
              </div>
            ))}
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-sans text-[15px] md:text-[17px] leading-[1.8] text-[#7A7A7A] dark:text-[#6B6B6B] max-w-[500px]"
          >
            {t.hero.sub}
          </motion.p>
        </div>

        {/* Bottom — scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.7 }}
          className="flex items-center gap-4 pb-2"
        >
          <div className="relative h-10 w-px overflow-hidden">
            <div className="absolute inset-0 bg-[#0A0A0A]/20 dark:bg-[#F0EDE8]/20" />
            <div className="absolute inset-0 bg-[#0A0A0A]/60 dark:bg-[#F0EDE8]/60 animate-scroll-indicator" />
          </div>
          <span className="text-[8px] tracking-[0.3em] uppercase font-sans text-[#0A0A0A]/30 dark:text-[#F0EDE8]/30">
            Scroll
          </span>
        </motion.div>
      </div>
    </section>
  );
}
