import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Добавить комментарий. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { videoId, text } = await request.json();
  if (!videoId || !text?.trim())
    return NextResponse.json({ error: 'Пустой комментарий' }, { status: 400 });

  const comment = await prisma.comment.create({
    data: { videoId, text: String(text).slice(0, 2000), userId: user.id },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(comment);
}
