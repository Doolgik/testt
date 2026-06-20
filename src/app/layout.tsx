import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://novaconsulting.eu'),
  title: {
    default: 'NOVA Consulting Group — Цифровая трансформация бизнеса',
    template: '%s — NOVA Consulting Group',
  },
  description:
    'Премиальный консалтинг для среднего и крупного бизнеса: внедрение AI, автоматизация процессов, аналитика и BI-системы. От аудита и стратегии до внедрения и поддержки.',
  keywords: [
    'цифровая трансформация',
    'AI-внедрение',
    'автоматизация бизнеса',
    'BI-аналитика',
    'консалтинг',
    'NOVA Consulting',
  ],
  openGraph: {
    title: 'NOVA Consulting Group',
    description:
      'Технологии, которые превращают данные в конкурентное преимущество.',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${manrope.variable} ${inter.variable}`}>
      <body className="bg-canvas text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white"
        >
          Перейти к содержанию
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
