'use client';

import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

export default function Navbar() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const bg = scrolled
    ? theme === 'dark'
      ? 'rgba(8,8,8,0.92)'
      : 'rgba(248,246,241,0.92)'
    : 'transparent';

  const shadow = scrolled
    ? theme === 'dark'
      ? 'inset 0 -1px 0 rgba(255,255,255,0.05)'
      : 'inset 0 -1px 0 rgba(0,0,0,0.06)'
    : 'inset 0 -1px 0 transparent';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 will-change-transform backdrop-blur-xl"
      style={{
        backgroundColor: bg,
        boxShadow: shadow,
        transition: 'background-color 0.55s ease, box-shadow 0.55s ease',
      }}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-14 h-16 flex items-center justify-between">
        <a
          href="#"
          className="font-display font-semibold text-[13px] tracking-[0.18em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] hover:opacity-60 transition-opacity duration-300"
        >
          {t.nav.name}
        </a>

        <div className="flex items-center gap-8">
          <a
            href="#inquiry"
            className="hidden md:inline-flex items-center gap-2 font-sans text-[9px] tracking-[0.28em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] hover:opacity-50 transition-opacity duration-300"
          >
            <span className="border-b border-current pb-px">{t.nav.cta}</span>
          </a>
          <div className="flex items-center gap-6">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
