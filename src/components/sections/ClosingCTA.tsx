'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const EMAIL = 'matupoll.com@gmail.com';

export default function ClosingCTA() {
  const { t } = useLanguage();

  return (
    <section
      id="contact"
      className="px-8 md:px-14 py-40 md:py-56 border-t border-black/[0.06] dark:border-white/[0.04] text-center"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-10">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-sans text-[9px] tracking-[0.32em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]"
        >
          {t.cta.label}
        </motion.p>

        <h2
          className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
          style={{ fontSize: 'clamp(44px, 6vw, 96px)', letterSpacing: '-0.03em', lineHeight: 1.05 }}
        >
          {t.cta.heading.map((line, i) => (
            <motion.span
              key={i}
              className="block"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {line}
            </motion.span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-[14px] md:text-[15px] leading-[1.8] text-[#7A7A7A] dark:text-[#6B6B6B] max-w-sm"
        >
          {t.cta.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
        >
          <a
            href="#inquiry"
            className="inline-flex items-center gap-2.5 font-sans text-[10px] tracking-[0.28em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] hover:opacity-50 transition-opacity duration-300"
          >
            <span className="border-b border-current pb-px">{t.cta.primary}</span>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 9.5 9.5 1.5M9.5 1.5H3.5M9.5 1.5V7.5" />
            </svg>
          </a>

          <span className="hidden sm:block text-[#C0BDB8] dark:text-[#2A2A2A] text-[12px]">·</span>

          <a
            href={`mailto:${EMAIL}`}
            className="font-sans text-[10px] tracking-[0.28em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B] hover:text-[#0A0A0A] dark:hover:text-[#F0EDE8] transition-colors duration-300"
          >
            {t.cta.secondary}
          </a>
        </motion.div>

        <motion.a
          href={`mailto:${EMAIL}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="font-sans text-[11px] tracking-[0.04em] text-[#C0BDB8] dark:text-[#3A3A3A] hover:text-[#7A7A7A] dark:hover:text-[#6B6B6B] transition-colors duration-300 mt-2"
        >
          {EMAIL}
        </motion.a>
      </div>
    </section>
  );
}
