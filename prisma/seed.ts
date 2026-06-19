import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLES = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

const CHANNELS = [
  { name: 'Кинохроника', email: 'demo-cinema@example.com' },
  { name: 'Гик Таймс', email: 'demo-tech@example.com' },
  { name: 'Музыкальный движ', email: 'demo-music@example.com' },
];

const VIDEOS = [
  { title: 'Большой кролик — короткометражка', category: 'Фильмы', tags: ['анимация', 'кино', 'короткометражка'] },
  { title: 'Мечта слона: классика анимации', category: 'Фильмы', tags: ['анимация', 'кино'] },
  { title: 'Огонь и пламя в 4K', category: 'Технологии', tags: ['4k', 'обзор', 'техно'] },
  { title: 'Побег: динамичный трейлер', category: 'Игры', tags: ['трейлер', 'экшн', 'игры'] },
  { title: 'Веселье на полную: подборка', category: 'Юмор', tags: ['юмор', 'подборка'] },
  { title: 'Поездки и приключения', category: 'Путешествия', tags: ['путешествия', 'природа'] },
  { title: 'Sintel — эпичная история', category: 'Фильмы', tags: ['анимация', 'кино', 'драма'] },
  { title: 'Стальные слёзы: фантастика', category: 'Фильмы', tags: ['фантастика', 'кино', 'sci-fi'] },
  { title: 'Топ музыкальных новинок недели', category: 'Музыка', tags: ['музыка', 'хиты', 'новинки'] },
  { title: 'Обзор новой видеокарты', category: 'Технологии', tags: ['обзор', 'железо', 'техно'] },
  { title: 'Геймплей: первый взгляд', category: 'Игры', tags: ['геймплей', 'игры', 'обзор'] },
  { title: 'Готовим за 10 минут', category: 'Еда', tags: ['рецепт', 'еда', 'быстро'] },
];

async function main() {
  // Идемпотентность: если в базе уже есть видео — не дублируем демо-контент.
  const existing = await prisma.video.count();
  if (existing > 0) {
    console.log(`ℹ️  В базе уже ${existing} видео — сид пропущен.`);
    return;
  }

  console.log('🌱 Заполняем демо-данными…');

  const users = [];
  for (const c of CHANNELS) {
    const u = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        image: `https://picsum.photos/seed/${encodeURIComponent(c.name)}/200`,
        description: `Демо-канал «${c.name}». Здесь будут ваши видео.`,
      },
    });
    users.push(u);
  }

  for (let i = 0; i < VIDEOS.length; i++) {
    const v = VIDEOS[i];
    const owner = users[i % users.length];
    await prisma.video.create({
      data: {
        title: v.title,
        description: `${v.title}. Демонстрационное видео платформы РуТуб.`,
        videoUrl: SAMPLES[i % SAMPLES.length],
        thumbnailUrl: `https://picsum.photos/seed/vid${i}/640/360`,
        duration: 60 + ((i * 37) % 540),
        category: v.category,
        tags: v.tags,
        views: Math.floor(Math.random() * 250_000),
        userId: owner.id,
        createdAt: new Date(Date.now() - i * 36 * 3_600_000),
      },
    });
  }

  // взаимные подписки между демо-каналами
  for (const a of users) {
    for (const b of users) {
      if (a.id !== b.id) {
        await prisma.subscription.upsert({
          where: { subscriberId_channelId: { subscriberId: a.id, channelId: b.id } },
          update: {},
          create: { subscriberId: a.id, channelId: b.id },
        });
      }
    }
  }

  console.log(`✅ Готово: ${users.length} каналов, ${VIDEOS.length} видео.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
