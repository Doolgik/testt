'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { SearchIcon } from './Icons';

export function SearchBar({ className = '' }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className={`flex w-full items-center ${className}`}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск видео"
        className="h-10 w-full rounded-l-full border border-white/15 bg-bg/60 px-4 text-sm outline-none placeholder:text-muted focus:border-sky-500/60"
      />
      <button
        type="submit"
        aria-label="Найти"
        className="flex h-10 items-center rounded-r-full border border-l-0 border-white/15 bg-white/5 px-5 hover:bg-white/10"
      >
        <SearchIcon width={20} height={20} />
      </button>
    </form>
  );
}
