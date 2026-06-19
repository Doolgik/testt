import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'РуТуб — видеоплатформа',
  description: 'Смотри, загружай и делись видео. Своя видеоплатформа с рекомендациями.',
};

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-bg text-white antialiased">
        <Providers>
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="min-w-0 flex-1 px-3 pb-20 pt-2 sm:px-6">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
