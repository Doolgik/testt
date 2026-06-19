# РуТуб — своя видеоплатформа 🎬

YouTube-подобная платформа: просмотр, загрузка видео, лайки, подписки,
комментарии и **умная система рекомендаций**. Сделано на Next.js 14 и
рассчитано на бесплатный деплой в **Vercel**.

## Возможности

- 🔐 Вход через **Google** (NextAuth)
- ⬆️ Загрузка видео прямо в браузере в **Vercel Blob** (до 2 ГБ), с
  авто-генерацией превью и определением длительности
- ▶️ Просмотр видео, подсчёт просмотров и истории
- 👍 Лайки / дизлайки, 🔔 подписки на каналы, 💬 комментарии
- 🧠 **Рекомендации**: лента подбирается по истории просмотров, лайкам,
  подпискам, популярности и свежести (см. `src/lib/recommendations.ts`)
- 🔥 Разделы «В тренде», «Подписки», «История», поиск, страницы каналов
- 📱 Полная **мобильная адаптация** (нижняя навигация, адаптивные сетки)

## Технологии

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma ·
Vercel Postgres · Vercel Blob · NextAuth.

---

## 🚀 Деплой на Vercel — пошагово

### 1. Залить код на GitHub
Код уже в этом репозитории, ветка `claude/youtube-clone-platform-oaosda`.

### 2. Импортировать проект в Vercel
1. Зайди на [vercel.com](https://vercel.com) → **Add New → Project**.
2. Выбери этот GitHub-репозиторий → **Import**.
3. Framework определится сам (Next.js). Пока **не нажимай Deploy** — сначала
   подключим хранилища (шаги 3–4), либо задеплой и добавь их потом.

### 3. Подключить базу данных (Vercel Postgres)
1. В проекте → вкладка **Storage** → **Create Database** → **Postgres**.
2. Создай и привяжи к проекту. Vercel сам добавит переменные
   `POSTGRES_PRISMA_URL` и `POSTGRES_URL_NON_POOLING`.

### 4. Подключить хранилище видео (Vercel Blob)
1. **Storage** → **Create** → **Blob** → привязать к проекту.
2. Появится переменная `BLOB_READ_WRITE_TOKEN`.

### 5. Настроить вход через Google
1. Открой [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. **Create Credentials → OAuth client ID → Web application**.
3. В **Authorized redirect URIs** добавь:
   `https://ТВОЙ-ДОМЕН.vercel.app/api/auth/callback/google`
4. Скопируй **Client ID** и **Client Secret**.
5. В Vercel → **Settings → Environment Variables** добавь:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET` — сгенерируй: `openssl rand -base64 32`
   - `NEXTAUTH_URL` = `https://ТВОЙ-ДОМЕН.vercel.app`

### 6. Создать таблицы в базе
Один раз создай схему. Локально (с переменными из Vercel в `.env`):
```bash
npm install
npm run db:push      # создаёт таблицы
npm run db:seed      # (необязательно) демо-видео и каналы
```
Либо через Vercel CLI: `vercel env pull .env` → затем команды выше.

### 7. Деплой
Нажми **Deploy**. После сборки сайт будет доступен на твоём
`*.vercel.app` домене. Заходи, жми «Войти», загружай видео. 🎉

> ⚠️ Важно: после изменения `NEXTAUTH_URL`/redirect URI нужно, чтобы домен в
> Google Console и в `NEXTAUTH_URL` совпадал с реальным адресом сайта.

---

## 💻 Локальный запуск

```bash
npm install
cp .env.example .env      # заполни переменными из Vercel
npm run db:push
npm run db:seed           # по желанию
npm run dev               # http://localhost:3000
```

Для локального входа через Google добавь в Google Console redirect URI:
`http://localhost:3000/api/auth/callback/google` и поставь
`NEXTAUTH_URL=http://localhost:3000`.

---

## 🧠 Как работают рекомендации

Файл `src/lib/recommendations.ts`. Для каждого видео считается итоговый рейтинг
из сигналов:

| Сигнал | Что значит | Вес |
|---|---|---|
| Релевантность | совпадение тегов/категории с историей и лайками | ×4 |
| Подписки | видео с каналов, на которые подписан | +6 |
| Вовлечённость | доля лайков на просмотр | ×3 |
| Свежесть | новизна с затуханием (период полураспада 7 дней) | ×2 |
| Популярность | логарифм просмотров | ×1 |

Плюс **диверсификация** (не больше 2 видео подряд от одного канала) и
исключение уже просмотренного. Для гостей лента превращается в «тренды».
