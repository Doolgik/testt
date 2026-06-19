import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VideoGrid } from '@/components/VideoGrid';
import { SignInPrompt } from '@/components/SignInPrompt';

export const dynamic = 'force-dynamic';

export default async function SubscriptionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <SignInPrompt text="Войди, чтобы видеть свежие видео с каналов, на которые ты подписан." />
    );
  }

  const subs = await prisma.subscription.findMany({
    where: { subscriberId: user.id },
    select: { channelId: true },
  });
  const channelIds = subs.map((s) => s.channelId);

  const videos = channelIds.length
    ? await prisma.video.findMany({
        where: { visibility: 'public', userId: { in: channelIds } },
        orderBy: { createdAt: 'desc' },
        take: 48,
        include: { user: { select: { id: true, name: true, image: true } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-5 text-2xl font-bold">Подписки</h1>
      {channelIds.length === 0 ? (
        <p className="py-20 text-center text-muted">
          Ты ещё ни на кого не подписан. Открой любой канал и нажми «Подписаться».
        </p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  );
}
