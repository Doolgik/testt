import Link from 'next/link';
import Logo from './Logo';
import { company, nav } from '@/lib/content';

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="container-x section-tight">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-6 max-w-sm text-pretty text-lg leading-relaxed text-muted">
              Премиальный консалтинг по цифровой трансформации: AI, автоматизация,
              аналитика и стратегия — от аудита до устойчивого результата.
            </p>
            <Link href="/contacts" className="btn btn-primary mt-8">
              Запланировать консультацию
              <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h3 className="eyebrow">Навигация</h3>
              <ul className="mt-5 space-y-3">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-[15px] text-muted transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="eyebrow">Контакты</h3>
              <ul className="mt-5 space-y-3 text-[15px]">
                <li>
                  <a href={`tel:${company.phoneHref}`} className="text-muted transition-colors hover:text-ink">
                    {company.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${company.email}`} className="text-muted transition-colors hover:text-ink">
                    {company.email}
                  </a>
                </li>
              </ul>
              <h3 className="eyebrow mt-8">Часы работы</h3>
              <ul className="mt-5 space-y-2 text-[15px] text-muted">
                {company.hours.map((h) => (
                  <li key={h.d} className="flex justify-between gap-4">
                    <span>{h.d}</span>
                    <span className="text-ink">{h.t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="eyebrow">Офис</h3>
              <address className="mt-5 not-italic text-[15px] leading-relaxed text-muted">
                {company.address.street}
                <br />
                {company.address.city}
                <br />
                {company.address.country}
              </address>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-line pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}. Все права защищены.</p>
          <p>Frankfurt am Main · Germany</p>
        </div>
      </div>
    </footer>
  );
}
