'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const EMAIL = 'mateopollonistudio@gmail.com';

export default function ClosingCTA() {
  const { t } = useLanguage();

  return (
    <section
      id="contact"
      className="px-8 md:px-14 py-52 md:py-72 text-center bg-[#0a0a0a]"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-12">
        {/* Label with flanking lines — signals a new chapter */}
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

        {/* Heading */}
        <h2
          className="font-display font-semibold text-[#F0EDE8]"
          style={{ fontSize: 'clamp(52px, 7vw, 112px)', letterSpacing: '-0.03em', lineHeight: 1.02 }}
        >
          {t.cta.heading.map((line, i) => (
            <motion.span
              key={i}
              className="block"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              {line}
            </motion.span>
          ))}
        </h2>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-sans text-[14px] md:text-[15px] leading-[1.8] text-[#F0EDE8]/[0.45] max-w-sm"
        >
          {t.cta.sub}
        </motion.p>

        {/* CTA links */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8"
        >
          <a
            href="#inquiry"
            className="inline-flex items-center gap-2.5 font-sans text-[10px] tracking-[0.28em] uppercase text-[#F0EDE8] hover:opacity-50 transition-opacity duration-300"
          >
            <span className="border-b border-current pb-px">{t.cta.primary}</span>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1.5 9.5 9.5 1.5M9.5 1.5H3.5M9.5 1.5V7.5" />
            </svg>
          </a>

          <span className="hidden sm:block text-[12px] text-[#F0EDE8]/[0.14]">·</span>

          <a
            href={`mailto:${EMAIL}`}
            className="font-sans text-[10px] tracking-[0.28em] uppercase text-[#F0EDE8]/[0.42] hover:text-[#F0EDE8] transition-colors duration-300"
          >
            {t.cta.secondary}
          </a>
        </motion.div>

        {/* Email address */}
        <motion.a
          href={`mailto:${EMAIL}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="font-sans text-[11px] tracking-[0.04em] text-[#F0EDE8]/[0.2] hover:text-[#F0EDE8]/[0.48] transition-colors duration-300 mt-2"
        >
          {EMAIL}
        </motion.a>
      </div>
    </section>
  );
}
