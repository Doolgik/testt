import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-6xl">🛰️</span>
      <h1 className="mt-4 text-2xl font-bold">Страница не найдена</h1>
      <p className="mt-2 text-muted">Видео могло быть удалено или ссылка неверна.</p>
      <Link href="/" className="btn-primary mt-6">
        На главную
      </Link>
    </div>
  );
}
