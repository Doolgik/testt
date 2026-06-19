import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRelatedVideos } from '@/lib/recommendations';
import { formatViews, formatTimeAgo } from '@/lib/format';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LikeButton } from '@/components/LikeButton';
import { SubscribeButton } from '@/components/SubscribeButton';
import { Comments } from '@/components/Comments';
import { RelatedList } from '@/components/RelatedList';
import { ShareIcon } from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function WatchPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();

  const video = await prisma.video.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      comments: {
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });

  if (!video || (video.visibility === 'private' && video.userId !== user?.id)) {
    notFound();
  }

  const [likes, dislikes, mine, subscribers, mySub, related] = await Promise.all([
    prisma.like.count({ where: { videoId: video.id, type: 'like' } }),
    prisma.like.count({ where: { videoId: video.id, type: 'dislike' } }),
    user
      ? prisma.like.findUnique({
          where: { userId_videoId: { userId: user.id, videoId: video.id } },
          select: { type: true },
        })
      : null,
    prisma.subscription.count({ where: { channelId: video.userId } }),
    user
      ? prisma.subscription.findUnique({
          where: {
            subscriberId_channelId: { subscriberId: user.id, channelId: video.userId },
          },
        })
      : null,
    getRelatedVideos(video.id, user?.id ?? null, 12),
  ]);

  return (
    <div className="mx-auto flex max-w-content flex-col gap-6 lg:flex-row">
      {/* Левая колонка */}
      <div className="min-w-0 flex-1">
        <div className="-mx-3 sm:mx-0">
          <VideoPlayer videoId={video.id} src={video.videoUrl} poster={video.thumbnailUrl} />
        </div>

        <h1 className="mt-4 text-lg font-bold leading-snug sm:text-xl">{video.title}</h1>

        {/* Канал + действия */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/channel/${video.user.id}`}>
              <Image
                src={video.user.image || '/avatar.svg'}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-full"
              />
            </Link>
            <div>
              <Link href={`/channel/${video.user.id}`} className="font-semibold hover:text-white">
                {video.user.name || 'Без имени'}
              </Link>
              <p className="text-xs text-muted">{formatViews(subscribers)} подписчиков</p>
            </div>
            <div className="ml-2">
              <SubscribeButton
                channelId={video.userId}
                initialSubscribed={!!mySub}
                initialCount={subscribers}
                isOwner={video.userId === user?.id}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LikeButton
              videoId={video.id}
              initialLikes={likes}
              initialDislikes={dislikes}
              initialMine={(mine?.type as 'like' | 'dislike' | null) ?? null}
            />
            <button className="btn-ghost rounded-full">
              <ShareIcon width={20} height={20} />
              <span className="hidden sm:inline">Поделиться</span>
            </button>
          </div>
        </div>

        {/* Описание */}
        <div className="mt-4 rounded-2xl bg-surface p-4 text-sm">
          <p className="font-medium">
            {formatViews(video.views)} просмотров · {formatTimeAgo(video.createdAt)} ·{' '}
            <span className="text-muted">{video.category}</span>
          </p>
          {video.description && (
            <p className="mt-2 whitespace-pre-wrap text-white/90">{video.description}</p>
          )}
          {video.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {video.tags.map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="text-sky-400 hover:underline"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>

        <Comments
          videoId={video.id}
          initial={video.comments.map((c) => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </div>

      {/* Похожие видео */}
      <aside className="w-full shrink-0 lg:w-[400px]">
        <h2 className="mb-3 text-sm font-semibold text-muted">Похожие видео</h2>
        <RelatedList videos={related} />
      </aside>
    </div>
  );
}
