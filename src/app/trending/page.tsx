import { prisma } from '@/lib/prisma';
import { VideoGrid } from '@/components/VideoGrid';

export const dynamic = 'force-dynamic';

export default async function TrendingPage() {
  // В тренде: много просмотров за последние 2 недели
  const since = new Date(Date.now() - 14 * 86_400_000);
  const videos = await prisma.video.findMany({
    where: { visibility: 'public', createdAt: { gte: since } },
    orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
    take: 48,
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-5 flex items-center gap-2 text-2xl font-bold">🔥 В тренде</h1>
      <VideoGrid videos={videos} />
    </div>
  );
}
