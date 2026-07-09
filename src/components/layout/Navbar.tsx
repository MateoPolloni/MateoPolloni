'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`font-sans text-[9px] tracking-[0.26em] uppercase transition-opacity duration-300 ${
        active
          ? 'text-[#0A0A0A] dark:text-[#F0EDE8] opacity-100'
          : 'text-[#0A0A0A] dark:text-[#F0EDE8] opacity-40 hover:opacity-75'
      }`}
    >
      {children}
    </Link>
  );
}

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
        {/* Logo */}
        <Link
          href="/"
          className="font-display font-semibold text-[13px] tracking-[0.18em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] hover:opacity-60 transition-opacity duration-300"
        >
          {t.nav.name}
        </Link>

        {/* Center nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink href="/#work">{t.nav.work}</NavLink>
          <NavLink href="/about">{t.nav.about}</NavLink>
          <NavLink href="/services">{t.nav.services}</NavLink>
        </nav>

        {/* Right: CTA + toggles */}
        <div className="flex items-center gap-8">
          <Link
            href="/inquiry"
            className="hidden md:inline-flex items-center gap-2 font-sans text-[9px] tracking-[0.28em] uppercase text-[#0A0A0A] dark:text-[#F0EDE8] hover:opacity-50 transition-opacity duration-300"
          >
            <span className="border-b border-current pb-px">{t.nav.cta}</span>
          </Link>
          <div className="flex items-center gap-6">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
