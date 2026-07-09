'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ease = [0.16, 1, 0.3, 1] as const;

function ServiceRow({
  tier,
  index,
}: {
  tier: { number: string; name: string; tagline: string; description: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay: 0.3 + index * 0.12, ease }}
      className="group grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-16 py-12 md:py-16 border-t border-black/[0.07] dark:border-white/[0.06] hover:border-black/[0.15] dark:hover:border-white/[0.1] transition-colors duration-500 items-start cursor-default"
    >
      <div className="md:col-span-2 flex flex-col gap-4">
        <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#B0ADB8] dark:text-[#333333]">
          {tier.number}
        </span>
        <h2
          className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8] transition-opacity duration-400 group-hover:opacity-75"
          style={{ fontSize: 'clamp(28px, 3.2vw, 48px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          {tier.name}
        </h2>
        <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
          {tier.tagline}
        </p>
      </div>

      <div className="md:col-span-3 md:pt-1">
        <p className="font-sans text-[15px] md:text-[16px] leading-[1.9] text-[#5A5A5A] dark:text-[#8A8A8A]">
          {tier.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* ── Opening ── */}
      <section className="pt-44 pb-24 md:pb-32 px-8 md:px-14 border-b border-black/[0.06] dark:border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-16 md:mb-20"
          >
            <div className="w-5 h-px bg-[#7A7A7A] dark:bg-[#6B6B6B] opacity-40" />
            <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
              {t.services.label}
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-24 items-end">
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
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.22, ease }}
                className="font-sans text-[14px] md:text-[15px] leading-[1.85] text-[#7A7A7A] dark:text-[#6B6B6B]"
              >
                {t.services.pricing}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="px-8 md:px-14 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          {t.services.tiers.map((tier, i) => (
            <ServiceRow key={tier.number} tier={tier} index={i} />
          ))}
        </div>
      </section>

      {/* ── Process ── */}
      <section className="px-8 md:px-14 py-20 md:py-28 border-t border-black/[0.06] dark:border-white/[0.04]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {[
            { n: '01', title: 'Discovery', body: 'We start with a conversation — your goals, your brand, your users. I listen first.' },
            { n: '02', title: 'Design', body: 'A visual direction tailored to your identity. No templates, no guesswork.' },
            { n: '03', title: 'Build', body: 'Every interaction, every animation, every detail — built to last and built to perform.' },
            { n: '04', title: 'Launch', body: 'Deployed, tested, and handed off with care. Post-launch support included.' },
          ].map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.75, delay: i * 0.1, ease }}
              className="flex flex-col gap-4"
            >
              <span className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#B0ADB8] dark:text-[#333333]">
                {step.n}
              </span>
              <h3
                className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
                style={{ fontSize: 'clamp(20px, 2vw, 28px)', letterSpacing: '-0.015em', lineHeight: 1.2 }}
              >
                {step.title}
              </h3>
              <p className="font-sans text-[13px] md:text-[14px] leading-[1.85] text-[#7A7A7A] dark:text-[#6B6B6B]">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Dark closing CTA ── */}
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
