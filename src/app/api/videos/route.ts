import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Создать видео (после загрузки файла в Blob). */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await request.json();
  const { title, description, videoUrl, thumbnailUrl, duration, category, tags, visibility } =
    body ?? {};

  if (!title || !videoUrl) {
    return NextResponse.json({ error: 'Нужны название и видео' }, { status: 400 });
  }

  const video = await prisma.video.create({
    data: {
      title: String(title).slice(0, 200),
      description: description ? String(description).slice(0, 5000) : null,
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
      duration: Number(duration) || 0,
      category: category || 'Разное',
      tags: Array.isArray(tags)
        ? tags.map((t: string) => String(t).trim()).filter(Boolean).slice(0, 15)
        : [],
      visibility: ['public', 'unlisted', 'private'].includes(visibility)
        ? visibility
        : 'public',
      userId: user.id,
    },
  });

  return NextResponse.json({ id: video.id });
}
