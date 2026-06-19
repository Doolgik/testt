'use client';

import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function CategoryChips({ active }: { active?: string }) {
  return (
    <div className="sticky top-14 z-30 -mx-3 mb-4 flex gap-2 overflow-x-auto bg-bg/80 px-3 py-3 backdrop-blur-xl [scrollbar-width:none] sm:top-14 [&::-webkit-scrollbar]:hidden">
      <Link href="/" className={`chip ${!active ? 'chip-active' : ''}`}>
        Все
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c}
          href={`/?category=${encodeURIComponent(c)}`}
          className={`chip ${active === c ? 'chip-active' : ''}`}
        >
          {c}
        </Link>
      ))}
    </div>
  );
}
