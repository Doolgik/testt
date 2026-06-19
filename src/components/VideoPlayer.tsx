'use client';

import { useEffect, useRef, useState } from 'react';

export function VideoPlayer({
  videoId,
  src,
  poster,
}: {
  videoId: string;
  src: string;
  poster?: string | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const counted = useRef(false);

  const [, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const countView = () => {
      if (counted.current) return;
      counted.current = true;
      fetch(`/api/videos/${videoId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchSeconds: Math.floor(el.currentTime) }),
      }).catch(() => {});
    };

    // засчитываем просмотр после 3 секунд воспроизведения
    const onTime = () => {
      if (el.currentTime >= 3) countView();
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', countView);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', countView);
    };
  }, [videoId]);

  return (
    <div className="overflow-hidden rounded-none bg-black sm:rounded-2xl">
      <video
        ref={ref}
        src={src}
        poster={poster || undefined}
        controls
        playsInline
        onLoadedData={() => setReady(true)}
        className="aspect-video w-full bg-black"
      />
    </div>
  );
}
