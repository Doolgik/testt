import { prisma } from './prisma';

/**
 * Система рекомендаций.
 *
 * Считаем для каждого кандидата итоговый score из нескольких сигналов:
 *  - personalRelevance : совпадение тегов/категории с тем, что пользователь
 *                        реально смотрел и лайкал (профиль интересов);
 *  - subscriptionBoost : видео от каналов, на которые подписан пользователь;
 *  - popularity        : просмотры (логарифм, чтобы хиты не задавили всё);
 *  - engagement        : доля лайков на просмотр (качество видео);
 *  - freshness         : свежие видео получают буст с затуханием по времени.
 *
 * Уже просмотренные видео и приватные/чужие убираются. Добавлена «диверсификация»:
 * не больше 2 видео подряд от одного канала, чтобы лента не была однообразной.
 */

export type RankedVideo = Awaited<ReturnType<typeof fetchCandidates>>[number] & {
  score: number;
};

const HALF_LIFE_DAYS = 7; // за сколько дней «свежесть» падает вдвое

function freshnessScore(createdAt: Date): number {
  const ageDays = (Date.now() - createdAt.getTime()) / 86_400_000;
  return Math.pow(0.5, ageDays / HALF_LIFE_DAYS); // 1.0 → 0
}

async function fetchCandidates(excludeIds: string[]) {
  return prisma.video.findMany({
    where: {
      visibility: 'public',
      id: { notIn: excludeIds.length ? excludeIds : undefined },
    },
    orderBy: { createdAt: 'desc' },
    take: 500, // пул кандидатов
    include: {
      user: { select: { id: true, name: true, image: true, handle: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

interface InterestProfile {
  tagWeights: Map<string, number>;
  categoryWeights: Map<string, number>;
  subscribedChannelIds: Set<string>;
  watchedVideoIds: Set<string>;
}

/** Собираем профиль интересов по истории просмотров, лайкам и подпискам. */
async function buildProfile(userId: string): Promise<InterestProfile> {
  const [views, likes, subs] = await Promise.all([
    prisma.view.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { video: { select: { tags: true, category: true } } },
    }),
    prisma.like.findMany({
      where: { userId, type: 'like' },
      take: 100,
      include: { video: { select: { tags: true, category: true } } },
    }),
    prisma.subscription.findMany({
      where: { subscriberId: userId },
      select: { channelId: true },
    }),
  ]);

  const tagWeights = new Map<string, number>();
  const categoryWeights = new Map<string, number>();
  const watchedVideoIds = new Set<string>();

  const add = (map: Map<string, number>, key: string, w: number) =>
    map.set(key, (map.get(key) ?? 0) + w);

  views.forEach((v, i) => {
    // более свежие просмотры весомее
    const recencyWeight = 1 - i / (views.length + 1);
    v.video.tags.forEach((t) => add(tagWeights, t, recencyWeight));
    add(categoryWeights, v.video.category, recencyWeight);
  });

  // лайк — сильный сигнал интереса
  likes.forEach((l) => {
    l.video.tags.forEach((t) => add(tagWeights, t, 2));
    add(categoryWeights, l.video.category, 2);
  });

  // что уже смотрел — исключаем из выдачи
  const seen = await prisma.view.findMany({
    where: { userId },
    select: { videoId: true },
    take: 300,
  });
  seen.forEach((s) => watchedVideoIds.add(s.videoId));

  return {
    tagWeights,
    categoryWeights,
    subscribedChannelIds: new Set(subs.map((s) => s.channelId)),
    watchedVideoIds,
  };
}

function personalRelevance(
  tags: string[],
  category: string,
  profile: InterestProfile
): number {
  let score = 0;
  for (const t of tags) score += profile.tagWeights.get(t) ?? 0;
  score += (profile.categoryWeights.get(category) ?? 0) * 0.5;
  return score;
}

/**
 * Главная функция: возвращает ранжированный список рекомендаций.
 * Работает и для гостя (userId = null) — тогда это «тренды».
 */
export async function getRecommendations(
  userId: string | null,
  opts: { limit?: number; excludeVideoId?: string } = {}
): Promise<RankedVideo[]> {
  const { limit = 24, excludeVideoId } = opts;

  const profile = userId ? await buildProfile(userId) : null;
  const exclude = new Set<string>(profile?.watchedVideoIds ?? []);
  if (excludeVideoId) exclude.add(excludeVideoId);

  const candidates = await fetchCandidates(
    // частично исключаем просмотренные на уровне запроса
    Array.from(exclude).slice(0, 100)
  );

  const ranked = candidates
    .filter((v) => !exclude.has(v.id))
    .map((v) => {
      const popularity = Math.log10(v.views + 1); // 0..~
      const engagement =
        v.views > 0 ? v._count.likes / v.views : v._count.likes > 0 ? 0.5 : 0;
      const freshness = freshnessScore(v.createdAt);

      let score =
        popularity * 1.0 +
        engagement * 3.0 +
        freshness * 2.0;

      if (profile) {
        score += personalRelevance(v.tags, v.category, profile) * 4.0;
        if (profile.subscribedChannelIds.has(v.userId)) score += 6.0;
      }

      return { ...v, score };
    })
    .sort((a, b) => b.score - a.score);

  // Диверсификация: не больше 2 видео подряд от одного канала
  const result: RankedVideo[] = [];
  const perChannel = new Map<string, number>();
  const deferred: RankedVideo[] = [];

  for (const v of ranked) {
    const used = perChannel.get(v.userId) ?? 0;
    if (used < 2) {
      result.push(v);
      perChannel.set(v.userId, used + 1);
    } else {
      deferred.push(v);
    }
    if (result.length >= limit) break;
  }
  // добиваем добор отложенными, если не хватило
  for (const v of deferred) {
    if (result.length >= limit) break;
    result.push(v);
  }

  return result.slice(0, limit);
}

/** Похожие видео для страницы просмотра (по тегам/категории текущего видео). */
export async function getRelatedVideos(
  videoId: string,
  userId: string | null,
  limit = 16
): Promise<RankedVideo[]> {
  const base = await prisma.video.findUnique({
    where: { id: videoId },
    select: { tags: true, category: true },
  });
  if (!base) return getRecommendations(userId, { limit, excludeVideoId: videoId });

  const candidates = await fetchCandidates([videoId]);
  const baseTags = new Set(base.tags);

  const ranked = candidates
    .filter((v) => v.id !== videoId)
    .map((v) => {
      const tagOverlap = v.tags.filter((t) => baseTags.has(t)).length;
      const sameCategory = v.category === base.category ? 1 : 0;
      const popularity = Math.log10(v.views + 1);
      const freshness = freshnessScore(v.createdAt);
      const score =
        tagOverlap * 5.0 + sameCategory * 3.0 + popularity * 1.0 + freshness * 1.0;
      return { ...v, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
}
