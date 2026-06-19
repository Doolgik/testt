import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatViews } from '@/lib/format';
import { VideoGrid } from '@/components/VideoGrid';
import { SubscribeButton } from '@/components/SubscribeButton';

export const dynamic = 'force-dynamic';

export default async function ChannelPage({ params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  const channel = await prisma.user.findUnique({ where: { id: params.id } });
  if (!channel) notFound();

  const isOwner = me?.id === channel.id;

  const [videos, subscribers, mySub, totalViews] = await Promise.all([
    prisma.video.findMany({
      where: { userId: channel.id, visibility: isOwner ? undefined : 'public' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
    prisma.subscription.count({ where: { channelId: channel.id } }),
    me
      ? prisma.subscription.findUnique({
          where: {
            subscriberId_channelId: { subscriberId: me.id, channelId: channel.id },
          },
        })
      : null,
    prisma.video.aggregate({
      where: { userId: channel.id },
      _sum: { views: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-content">
      {/* Баннер */}
      <div className="h-28 w-full rounded-2xl bg-gradient-to-r from-brand/40 via-fuchsia-600/30 to-sky-600/30 sm:h-40" />

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <Image
          src={channel.image || '/avatar.svg'}
          alt={channel.name || ''}
          width={112}
          height={112}
          className="h-24 w-24 rounded-full ring-4 ring-bg sm:h-28 sm:w-28"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold sm:text-3xl">{channel.name || 'Без имени'}</h1>
          <p className="mt-1 text-sm text-muted">
            {formatViews(subscribers)} подписчиков · {videos.length} видео ·{' '}
            {formatViews(totalViews._sum.views ?? 0)} просмотров
          </p>
          {channel.description && (
            <p className="mt-1 text-sm text-white/80">{channel.description}</p>
          )}
        </div>
        <SubscribeButton
          channelId={channel.id}
          initialSubscribed={!!mySub}
          initialCount={subscribers}
          isOwner={isOwner}
        />
      </div>

      <div className="my-6 border-b border-white/10" />

      <VideoGrid videos={videos} />
    </div>
  );
}
