import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VideoGrid } from '@/components/VideoGrid';
import { SignInPrompt } from '@/components/SignInPrompt';

export const dynamic = 'force-dynamic';

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <SignInPrompt text="Войди, чтобы видеть историю просмотров." />;
  }

  const views = await prisma.view.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    distinct: ['videoId'],
    take: 48,
    include: {
      video: { include: { user: { select: { id: true, name: true, image: true } } } },
    },
  });

  const videos = views.map((v) => v.video).filter(Boolean);

  return (
    <div className="mx-auto max-w-content">
      <h1 className="mb-5 text-2xl font-bold">История просмотров</h1>
      <VideoGrid videos={videos} />
    </div>
  );
}
