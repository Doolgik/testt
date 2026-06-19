'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { formatViews } from '@/lib/format';
import { LikeIcon, DislikeIcon } from './Icons';

export function LikeButton({
  videoId,
  initialLikes,
  initialDislikes,
  initialMine,
}: {
  videoId: string;
  initialLikes: number;
  initialDislikes: number;
  initialMine: 'like' | 'dislike' | null;
}) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [mine, setMine] = useState(initialMine);
  const [busy, setBusy] = useState(false);

  async function react(type: 'like' | 'dislike') {
    if (!session?.user) return signIn('google');
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setMine(data.mine);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center overflow-hidden rounded-full bg-surface-2">
      <button
        onClick={() => react('like')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-white/10 ${
          mine === 'like' ? 'text-sky-400' : ''
        }`}
      >
        <LikeIcon
          width={20}
          height={20}
          fill={mine === 'like' ? 'currentColor' : 'none'}
        />
        {formatViews(likes)}
      </button>
      <span className="h-6 w-px bg-white/15" />
      <button
        onClick={() => react('dislike')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-white/10 ${
          mine === 'dislike' ? 'text-rose-400' : ''
        }`}
      >
        <DislikeIcon
          width={20}
          height={20}
          fill={mine === 'dislike' ? 'currentColor' : 'none'}
        />
      </button>
    </div>
  );
}
