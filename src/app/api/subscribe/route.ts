import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Подписка / отписка на канал. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { channelId } = await request.json();
  if (!channelId) return NextResponse.json({ error: 'Нет канала' }, { status: 400 });
  if (channelId === user.id)
    return NextResponse.json({ error: 'Нельзя подписаться на себя' }, { status: 400 });

  const existing = await prisma.subscription.findUnique({
    where: { subscriberId_channelId: { subscriberId: user.id, channelId } },
  });

  if (existing) {
    await prisma.subscription.delete({ where: { id: existing.id } });
  } else {
    await prisma.subscription.create({
      data: { subscriberId: user.id, channelId },
    });
  }

  const count = await prisma.subscription.count({ where: { channelId } });
  return NextResponse.json({ subscribed: !existing, subscribers: count });
}
