'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      {(['en', 'es'] as const).map((l, i) => (
        <span key={l} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-[#333] dark:text-[#333] text-[8px]">/</span>
          )}
          <button
            onClick={() => setLang(l)}
            className={`text-[9px] tracking-[0.22em] uppercase font-sans transition-colors duration-300 ${
              lang === l
                ? 'text-[#0A0A0A] dark:text-[#F0EDE8]'
                : 'text-[#7A7A7A] dark:text-[#6B6B6B] hover:text-[#0A0A0A] dark:hover:text-[#F0EDE8]'
            }`}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
