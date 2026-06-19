import Image from 'next/image';
import Link from 'next/link';
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/format';
import type { VideoCardData } from './VideoCard';

export function RelatedList({ videos }: { videos: VideoCardData[] }) {
  return (
    <div className="flex flex-col gap-2">
      {videos.map((v) => (
        <Link
          key={v.id}
          href={`/watch/${v.id}`}
          className="flex gap-2 rounded-xl p-1 transition hover:bg-white/5"
        >
          <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-surface-2">
            {v.thumbnailUrl ? (
              <Image src={v.thumbnailUrl} alt={v.title} fill sizes="160px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl">🎬</div>
            )}
            {v.duration > 0 && (
              <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1 text-[11px] tabular-nums">
                {formatDuration(v.duration)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug">{v.title}</h3>
            <p className="mt-1 truncate text-xs text-muted">{v.user.name}</p>
            <p className="text-xs text-muted">
              {formatViews(v.views)} просм. · {formatTimeAgo(v.createdAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
