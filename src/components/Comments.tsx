'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { formatTimeAgo } from '@/lib/format';

interface CommentItem {
  id: string;
  text: string;
  createdAt: string | Date;
  user: { id: string; name: string | null; image: string | null };
}

export function Comments({
  videoId,
  initial,
}: {
  videoId: string;
  initial: CommentItem[];
}) {
  const { data: session } = useSession();
  const [items, setItems] = useState<CommentItem[]>(initial);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) return signIn('google');
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, text }),
      });
      if (res.ok) {
        const c = await res.json();
        setItems((prev) => [c, ...prev]);
        setText('');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6">
      <h2 className="mb-4 text-lg font-bold">{items.length} комментариев</h2>

      <form onSubmit={submit} className="mb-6 flex gap-3">
        <Image
          src={session?.user?.image || '/avatar.svg'}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-full"
        />
        <div className="flex-1">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={session?.user ? 'Оставьте комментарий…' : 'Войдите, чтобы комментировать'}
            className="w-full border-b border-white/15 bg-transparent pb-1 text-sm outline-none focus:border-white"
          />
          {text.trim() && (
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setText('')} className="btn-ghost">
                Отмена
              </button>
              <button type="submit" disabled={busy} className="btn-primary">
                Отправить
              </button>
            </div>
          )}
        </div>
      </form>

      <ul className="space-y-5">
        {items.map((c) => (
          <li key={c.id} className="flex gap-3">
            <Image
              src={c.user.image || '/avatar.svg'}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full"
            />
            <div>
              <p className="text-sm">
                <span className="font-medium">{c.user.name || 'Аноним'}</span>{' '}
                <span className="text-xs text-muted">{formatTimeAgo(c.createdAt)}</span>
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-white/90">{c.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
