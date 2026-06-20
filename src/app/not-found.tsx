import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-start justify-center py-32">
      <span className="eyebrow">Ошибка 404</span>
      <h1 className="display mt-5 text-balance text-section">
        Такой страницы не существует
      </h1>
      <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted">
        Возможно, ссылка устарела или была введена неверно. Вернитесь на главную или
        перейдите к нашим услугам.
      </p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary">
          На главную
        </Link>
        <Link href="/services" className="btn btn-secondary">
          Смотреть услуги
        </Link>
      </div>
    </section>
  );
}
