'use client';

import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="flex items-center gap-2.5 group"
    >
      {/* Toggle pill */}
      <span className="relative flex h-4 w-7 rounded-full border border-white/10 dark:border-white/10 items-center transition-colors duration-500">
        <span
          className={`absolute h-2 w-2 rounded-full transition-all duration-500 ${
            isDark
              ? 'left-[3px] bg-[#F0EDE8]'
              : 'left-[calc(100%-11px)] bg-[#0A0A0A]'
          }`}
        />
      </span>
      <span className="text-[9px] tracking-[0.22em] uppercase font-sans text-[#6B6B6B] dark:text-[#6B6B6B] group-hover:text-[#F0EDE8] dark:group-hover:text-[#F0EDE8] group-hover:text-[#0A0A0A] transition-colors duration-300">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
