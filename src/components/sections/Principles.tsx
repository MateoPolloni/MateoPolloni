'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function PrincipleCard({
  number,
  title,
  body,
  index,
}: {
  number: string;
  title: string;
  body: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.9,
        delay: index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="flex flex-col gap-6 pt-6 border-t border-black/10 dark:border-white/[0.06]"
    >
      <span className="font-sans text-[9px] tracking-[0.28em] uppercase text-[#B0ADB8] dark:text-[#333333]">
        {number}
      </span>

      <h3
        className="font-display font-semibold text-[#0A0A0A] dark:text-[#F0EDE8] leading-tight"
        style={{ fontSize: 'clamp(22px, 2.5vw, 30px)', letterSpacing: '-0.02em' }}
      >
        {title}
      </h3>

      <p className="font-sans text-[14px] md:text-[15px] leading-[1.85] text-[#7A7A7A] dark:text-[#6B6B6B]">
        {body}
      </p>
    </motion.div>
  );
}

export default function Principles() {
  const { t } = useLanguage();

  return (
    <section className="px-8 md:px-14 py-40 md:py-52">
      <div className="max-w-7xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-20 md:mb-28"
        >
          <div className="w-5 h-px bg-[#7A7A7A] dark:bg-[#6B6B6B] opacity-40" />
          <span className="font-sans text-[11px] tracking-[0.22em] uppercase text-[#7A7A7A] dark:text-[#6B6B6B]">
            {t.principles.label}
          </span>
        </motion.div>

        {/* Three principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
          {t.principles.items.map((item, i) => (
            <PrincipleCard key={item.number} {...item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
