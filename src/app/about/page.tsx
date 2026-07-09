'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const ease = [0.16, 1, 0.3, 1] as const;

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* ── Opening hero ── */}
      <section className="pt-44 pb-24 md:pb-36 px-8 md:px-14 border-b border-black/[0.06] dark:border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 mb-16 md:mb-20"
          >
            <div className="w-5 h-px bg-[#7A7A7A] dark:bg-[#6B6B6B] opacity-40" />
            <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
              {t.about.label}
            </span>
          </motion.div>

          {/* Heading */}
          <h1
            className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
            style={{ fontSize: 'clamp(44px, 6vw, 96px)', letterSpacing: '-0.03em', lineHeight: 1.02 }}
          >
            {t.about.heading.map((line, i) => (
              <motion.span
                key={i}
                className="block"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.08 + i * 0.1, ease }}
              >
                {line}
              </motion.span>
            ))}
          </h1>
        </div>
      </section>

      {/* ── Body content ── */}
      <section className="px-8 md:px-14 py-28 md:py-40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-20 md:gap-28">
          {/* Left: sticky context on desktop */}
          <div className="md:col-span-2 md:pt-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease }}
              className="md:sticky md:top-32 flex flex-col gap-8"
            >
              {/* Capabilities */}
              <div>
                <p className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B] mb-6">
                  {t.about.capabilitiesLabel}
                </p>
                <ul className="flex flex-col">
                  {t.about.capabilities.map((cap, i) => (
                    <li
                      key={i}
                      className="font-sans text-[13px] md:text-[14px] text-[#0A0A0A] dark:text-[#F0EDE8] py-4 border-t border-black/[0.06] dark:border-white/[0.05] first:border-t-0"
                    >
                      {cap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA arrow */}
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2.5 font-sans text-[10px] tracking-[0.26em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] hover:opacity-50 transition-opacity duration-300 mt-2"
              >
                <span className="border-b border-current pb-px">{t.nav.cta}</span>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1.5 9.5 9.5 1.5M9.5 1.5H3.5M9.5 1.5V7.5" />
                </svg>
              </Link>
            </motion.div>
          </div>

          {/* Right: paragraphs */}
          <div className="md:col-span-3 flex flex-col gap-9">
            {t.about.paragraphs.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.3 + i * 0.12, ease }}
                className={`font-sans leading-[2] text-[#3A3A3A] dark:text-[#B0ADB8] ${
                  i === 0
                    ? 'text-[17px] md:text-[19px] text-[#1A1A1A] dark:text-[#D8D5D0]'
                    : 'text-[15px] md:text-[16px]'
                }`}
              >
                {para}
              </motion.p>
            ))}

            {/* Pull quote from the last paragraph's spirit */}
            <motion.blockquote
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="mt-6 pl-6 border-l-2 border-[#0A0A0A]/[0.12] dark:border-[#F0EDE8]/[0.12]"
            >
              <p
                className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8] italic"
                style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', letterSpacing: '-0.015em', lineHeight: 1.35 }}
              >
                "The craft is in what most people overlook."
              </p>
            </motion.blockquote>
          </div>
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
