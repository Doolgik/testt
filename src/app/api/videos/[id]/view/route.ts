import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Засчитать просмотр (+ запись в историю для рекомендаций). */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const video = await prisma.video.findUnique({ where: { id }, select: { id: true } });
  if (!video) return NextResponse.json({ error: 'Нет видео' }, { status: 404 });

  await prisma.video.update({ where: { id }, data: { views: { increment: 1 } } });

  const user = await getCurrentUser();
  if (user) {
    const body = await request.json().catch(() => ({}));
    await prisma.view.create({
      data: {
        userId: user.id,
        videoId: id,
        watchSeconds: Number(body?.watchSeconds) || 0,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
