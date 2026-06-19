import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Лайк / дизлайк (повторное нажатие снимает). type: 'like' | 'dislike'. */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { type } = await request.json();
  const reaction = type === 'dislike' ? 'dislike' : 'like';
  const videoId = params.id;

  const existing = await prisma.like.findUnique({
    where: { userId_videoId: { userId: user.id, videoId } },
  });

  if (existing && existing.type === reaction) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else if (existing) {
    await prisma.like.update({ where: { id: existing.id }, data: { type: reaction } });
  } else {
    await prisma.like.create({ data: { userId: user.id, videoId, type: reaction } });
  }

  const [likes, dislikes, mine] = await Promise.all([
    prisma.like.count({ where: { videoId, type: 'like' } }),
    prisma.like.count({ where: { videoId, type: 'dislike' } }),
    prisma.like.findUnique({
      where: { userId_videoId: { userId: user.id, videoId } },
      select: { type: true },
    }),
  ]);

  return NextResponse.json({ likes, dislikes, mine: mine?.type ?? null });
}
