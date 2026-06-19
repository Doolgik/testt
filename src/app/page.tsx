import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRecommendations } from '@/lib/recommendations';
import { CategoryChips } from '@/components/CategoryChips';
import { VideoGrid } from '@/components/VideoGrid';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const user = await getCurrentUser();
  const category = searchParams.category;

  let videos;
  if (category) {
    videos = await prisma.video.findMany({
      where: { visibility: 'public', category },
      orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
      take: 48,
      include: { user: { select: { id: true, name: true, image: true } } },
    });
  } else {
    videos = await getRecommendations(user?.id ?? null, { limit: 48 });
  }

  return (
    <div className="mx-auto max-w-content">
      <CategoryChips active={category} />
      {!category && user && (
        <p className="mb-4 px-1 text-sm text-muted">
          ⚡ Рекомендации подобраны под тебя на основе просмотров, лайков и подписок.
        </p>
      )}
      <VideoGrid videos={videos} />
    </div>
  );
}
