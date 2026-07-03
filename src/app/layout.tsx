import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Cormorant } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import SmoothScroll from '@/components/ui/SmoothScroll';
import { ThemeProvider } from '@/lib/ThemeContext';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
});

const cormorant = Cormorant({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mateo Polloni — Web Designer & Developer',
  description: 'I design websites that feel like something. Digital experiences with mood, motion, and a level of craft you can feel in the details.',
};

export const viewport: Viewport = {
  themeColor: '#080808',
};

const antiFlicker = `(function(){try{var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${bricolage.variable} ${cormorant.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: antiFlicker }} />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=satoshi@300,400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#F8F6F1] dark:bg-[#080808] text-[#0A0A0A] dark:text-[#F0EDE8] transition-colors duration-500">
        <ThemeProvider>
          <LanguageProvider>
            <SmoothScroll>
              <Navbar />
              <main>{children}</main>
            </SmoothScroll>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
