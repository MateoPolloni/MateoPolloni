'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <section
      id="about"
      className="px-8 md:px-14 py-40 md:py-56 border-t border-black/[0.06] dark:border-white/[0.04]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section label with marker */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-20 md:mb-28"
        >
          <div className="w-5 h-px bg-[#7A7A7A] dark:bg-[#6B6B6B] opacity-40" />
          <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
            {t.about.label}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-16 md:gap-24 items-start">
          {/* Heading */}
          <div className="md:col-span-2">
            <h2
              className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
              style={{ fontSize: 'clamp(36px, 4.5vw, 68px)', letterSpacing: '-0.03em', lineHeight: 1.08 }}
            >
              {t.about.heading.map((line, i) => (
                <motion.span
                  key={i}
                  className="block"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.05 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                >
                  {line}
                </motion.span>
              ))}
            </h2>
          </div>

          {/* Body */}
          <div className="md:col-span-3 flex flex-col gap-7 md:pt-2">
            {t.about.paragraphs.map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.85, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-sans text-[14px] md:text-[15px] leading-[1.9] text-[#7A7A7A] dark:text-[#6B6B6B]"
              >
                {para}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
