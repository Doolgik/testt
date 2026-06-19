'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, FireIcon, SubsIcon, HistoryIcon, UploadIcon } from './Icons';

const items = [
  { href: '/', label: 'Главная', Icon: HomeIcon },
  { href: '/trending', label: 'В тренде', Icon: FireIcon },
  { href: '/subscriptions', label: 'Подписки', Icon: SubsIcon },
  { href: '/history', label: 'История', Icon: HistoryIcon },
  { href: '/upload', label: 'Загрузить', Icon: UploadIcon },
];

export function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));

  return (
    <>
      {/* Десктоп: левая колонка */}
      <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto px-3 py-4 sm:block">
        <nav className="flex flex-col gap-1">
          {items.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive(href)
                  ? 'bg-white/10 font-semibold'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon width={22} height={22} />
              {label}
            </Link>
          ))}
        </nav>
        <p className="mt-6 px-3 text-xs leading-relaxed text-muted">
          РуТуб © {new Date().getFullYear()}
          <br />
          Своя видеоплатформа с рекомендациями.
        </p>
      </aside>

      {/* Мобильные: нижняя навигация */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-white/10 bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        {items.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
              isActive(href) ? 'text-white' : 'text-muted'
            }`}
          >
            <Icon width={22} height={22} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
