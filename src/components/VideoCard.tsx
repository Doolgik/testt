import Image from 'next/image';
import Link from 'next/link';
import { formatViews, formatTimeAgo, formatDuration } from '@/lib/format';

export interface VideoCardData {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  duration: number;
  views: number;
  createdAt: Date | string;
  user: { id: string; name: string | null; image: string | null };
}

export function VideoCard({ video }: { video: VideoCardData }) {
  return (
    <div className="group">
      <Link href={`/watch/${video.id}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-surface-2">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-surface-2 to-bg text-4xl">
              🎬
            </div>
          )}
          {video.duration > 0 && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-xs font-medium tabular-nums">
              {formatDuration(video.duration)}
            </span>
          )}
          <div className="pointer-events-none absolute inset-0 ring-0 ring-white/0 transition group-hover:ring-1 group-hover:ring-white/10" />
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        <Link href={`/channel/${video.user.id}`} className="shrink-0">
          <Image
            src={video.user.image || '/avatar.svg'}
            alt={video.user.name || ''}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full"
          />
        </Link>
        <div className="min-w-0">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {video.title}
            </h3>
          </Link>
          <Link
            href={`/channel/${video.user.id}`}
            className="mt-1 block truncate text-sm text-muted hover:text-white"
          >
            {video.user.name || 'Без имени'}
          </Link>
          <p className="text-xs text-muted">
            {formatViews(video.views)} просмотров · {formatTimeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
