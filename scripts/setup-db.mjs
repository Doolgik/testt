// Подготовка базы во время сборки на Vercel.
// Если Postgres ещё не подключён — НЕ роняем сборку, просто пропускаем шаг,
// чтобы сайт всё равно задеплоился. Когда базу подключат и пересоберут —
// таблицы и демо-данные создадутся автоматически.
import { execSync } from 'node:child_process';

const hasDb =
  !!process.env.POSTGRES_PRISMA_URL || !!process.env.POSTGRES_URL_NON_POOLING;

if (!hasDb) {
  console.log('⚠️  Переменные Postgres не найдены — пропускаю создание таблиц.');
  console.log('    Подключи Postgres в Vercel → Storage и пересобери проект.');
  process.exit(0);
}

try {
  console.log('📦 Создаю/обновляю таблицы (prisma db push)…');
  execSync('prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
  });

  console.log('🌱 Заполняю демо-данными (если база пустая)…');
  execSync('tsx prisma/seed.ts', { stdio: 'inherit' });
} catch (err) {
  // Не валим сборку из-за БД — сайт задеплоится, контент появится после фикса.
  console.log('⚠️  Не удалось подготовить базу:', err?.message ?? err);
  console.log('    Сборка продолжится; проверь подключение Postgres.');
}

process.exit(0);
