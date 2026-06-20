import Link from 'next/link';
import Reveal from './Reveal';

type CTASectionProps = {
  title?: string;
  buttonLabel?: string;
};

export default function CTASection({
  title = 'Начните трансформацию бизнеса с разговора.',
  buttonLabel = 'Запланировать консультацию',
}: CTASectionProps) {
  return (
    <section className="container-x">
      <Reveal className="relative overflow-hidden rounded-[28px] bg-ink px-7 py-20 md:px-16 md:py-28">
        {/* subtle accent field */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(15,94,255,0.5), transparent 70%)' }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="relative max-w-3xl">
          <span className="eyebrow text-accent-soft">Следующий шаг</span>
          <h2 className="display mt-5 text-balance text-section text-white">
            {title}
          </h2>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-white/70">
            30 минут разговора, чтобы понять вашу задачу и наметить путь к результату.
            Без обязательств и шаблонных презентаций.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/contacts" className="btn btn-primary">
              {buttonLabel}
              <span className="btn-arrow" aria-hidden="true">→</span>
            </Link>
            <Link
              href="/cases"
              className="btn border border-white/20 bg-transparent text-white hover:border-white/60"
            >
              Посмотреть кейсы
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
