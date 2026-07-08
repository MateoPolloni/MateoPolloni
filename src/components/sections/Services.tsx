'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function ServiceTier({
  tier,
  index,
}: {
  tier: { number: string; name: string; tagline: string; description: string };
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.85, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-16 py-10 md:py-12 border-t border-black/10 dark:border-white/[0.06] items-start"
    >
      <div className="md:col-span-2 flex flex-col gap-3">
        <span className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#B0ADB8] dark:text-[#333333]">
          {tier.number}
        </span>
        <h3
          className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
          style={{ fontSize: 'clamp(22px, 2.6vw, 38px)', letterSpacing: '-0.02em', lineHeight: 1.15 }}
        >
          {tier.name}
        </h3>
        <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
          {tier.tagline}
        </p>
      </div>

      <div className="md:col-span-3">
        <p className="font-sans text-[14px] md:text-[15px] leading-[1.85] text-[#7A7A7A] dark:text-[#6B6B6B]">
          {tier.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function Services() {
  const { t } = useLanguage();

  return (
    <section
      id="services"
      className="px-8 md:px-14 py-32 md:py-40 border-t border-black/[0.06] dark:border-white/[0.04]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-sans text-[9px] tracking-[0.32em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B] mb-12 md:mb-14"
        >
          {t.services.label}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8]"
          style={{ fontSize: 'clamp(28px, 3.5vw, 52px)', letterSpacing: '-0.025em', lineHeight: 1.15 }}
        >
          {t.services.heading}
        </motion.h2>

        <div className="mt-2">
          {t.services.tiers.map((tier, i) => (
            <ServiceTier key={tier.number} tier={tier} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-sans text-[12px] leading-[1.8] tracking-[0.04em] text-[#7A7A7A] dark:text-[#6B6B6B] mt-14 md:mt-18 border-t border-black/[0.06] dark:border-white/[0.04] pt-10"
        >
          {t.services.pricing}
        </motion.p>
      </div>
    </section>
  );
}
