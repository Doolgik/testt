import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBar } from './SearchBar';
import { UserMenu } from './UserMenu';
import { PlayIcon } from './Icons';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-content items-center gap-3 px-3 sm:px-5">
        {/* Логотип */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-fuchsia-600 shadow-lg shadow-brand/30">
            <PlayIcon width={18} height={18} className="text-white" />
          </span>
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            Ру<span className="text-brand">Туб</span>
          </span>
        </Link>

        {/* Поиск */}
        <div className="mx-auto hidden w-full max-w-xl sm:block">
          <Suspense fallback={<div className="h-10" />}>
            <SearchBar />
          </Suspense>
        </div>

        <div className="flex-1 sm:hidden" />

        {/* Профиль */}
        <UserMenu />
      </div>

      {/* Поиск на мобильных — отдельной строкой */}
      <div className="px-3 pb-2 sm:hidden">
        <Suspense fallback={<div className="h-10" />}>
          <SearchBar />
        </Suspense>
      </div>
    </header>
  );
}
