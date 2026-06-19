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
  const category = searchParams.category;

  let videos;
  let signedIn = false;
  try {
    const user = await getCurrentUser();
    signedIn = !!user;
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
  } catch {
    // База ещё не подключена / нет таблиц — показываем подсказку вместо ошибки.
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl">🛠️</span>
        <h1 className="mt-4 text-xl font-bold">Платформа почти готова</h1>
        <p className="mt-2 text-sm text-muted">
          Сайт развёрнут, но база данных ещё не подключена. Подключи Postgres в
          Vercel → Storage и нажми Redeploy — после этого здесь появятся видео.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content">
      <CategoryChips active={category} />
      {!category && signedIn && (
        <p className="mb-4 px-1 text-sm text-muted">
          ⚡ Рекомендации подобраны под тебя на основе просмотров, лайков и подписок.
        </p>
      )}
      <VideoGrid videos={videos} />
    </div>
  );
}
