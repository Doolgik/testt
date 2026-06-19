'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { GoogleIcon, UploadIcon } from './Icons';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (status === 'loading') {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-surface-2" />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn('google')}
        className="btn rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-sky-300 hover:bg-white/10 sm:px-4"
      >
        <GoogleIcon />
        <span className="hidden sm:inline">Войти</span>
      </button>
    );
  }

  const user = session.user;
  return (
    <div className="flex items-center gap-1 sm:gap-2" ref={ref}>
      <Link
        href="/upload"
        className="btn-ghost rounded-full px-2.5 py-2 sm:px-4"
        title="Загрузить видео"
      >
        <UploadIcon width={20} height={20} />
        <span className="hidden md:inline">Создать</span>
      </Link>

      <div className="relative">
        <button onClick={() => setOpen((v) => !v)} className="block">
          <Image
            src={user.image || '/avatar.svg'}
            alt={user.name || 'Профиль'}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full ring-2 ring-transparent transition hover:ring-white/30"
          />
        </button>
        {open && (
          <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl">
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <Image
                src={user.image || '/avatar.svg'}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <Link
              href={`/channel/${user.id}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm hover:bg-white/5"
            >
              Мой канал
            </Link>
            <Link
              href="/upload"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm hover:bg-white/5"
            >
              Загрузить видео
            </Link>
            <button
              onClick={() => signOut()}
              className="block w-full px-4 py-3 text-left text-sm text-rose-300 hover:bg-white/5"
            >
              Выйти
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
