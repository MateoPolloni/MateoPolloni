'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <section
      id="about"
      className="px-8 md:px-14 py-32 md:py-40 border-t border-black/[0.06] dark:border-white/[0.04]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-sans text-[9px] tracking-[0.32em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B] mb-20 md:mb-24"
        >
          {t.about.label}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-16 md:gap-24 items-start">
          {/* Heading */}
          <div className="md:col-span-2">
            <h2
              className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
              style={{ fontSize: 'clamp(32px, 4vw, 60px)', letterSpacing: '-0.03em', lineHeight: 1.1 }}
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
          <div className="md:col-span-3 flex flex-col gap-7">
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
