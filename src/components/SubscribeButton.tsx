'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { formatViews } from '@/lib/format';
import { CheckIcon } from './Icons';

export function SubscribeButton({
  channelId,
  initialSubscribed,
  initialCount,
  isOwner,
}: {
  channelId: string;
  initialSubscribed: boolean;
  initialCount: number;
  isOwner: boolean;
}) {
  const { data: session } = useSession();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  if (isOwner) {
    return (
      <span className="text-sm text-muted">
        {formatViews(count)} подписчиков
      </span>
    );
  }

  async function toggle() {
    if (!session?.user) return signIn('google');
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      const data = await res.json();
      setSubscribed(data.subscribed);
      setCount(data.subscribers);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={
        subscribed
          ? 'btn-ghost'
          : 'btn-primary'
      }
    >
      {subscribed ? (
        <>
          <CheckIcon width={18} height={18} />
          Вы подписаны
        </>
      ) : (
        'Подписаться'
      )}
    </button>
  );
}
