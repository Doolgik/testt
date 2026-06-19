import { prisma } from '@/lib/prisma';
import { VideoGrid } from '@/components/VideoGrid';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? '').trim();

  const videos = q
    ? await prisma.video.findMany({
        where: {
          visibility: 'public',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { tags: { has: q.toLowerCase() } },
          ],
        },
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
        take: 48,
        include: { user: { select: { id: true, name: true, image: true } } },
      })
    : [];

  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-5 text-xl font-semibold">
        {q ? `Результаты по запросу «${q}»` : 'Введите запрос'}
      </h1>
      <VideoGrid videos={videos} />
    </div>
  );
}
