import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';
import { DataVisual, AIVisual } from '@/components/Visuals';
import { services } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Услуги',
  description:
    'Аудит бизнес-процессов, внедрение AI, BI-аналитика, цифровая трансформация и корпоративная автоматизация — направления NOVA Consulting Group.',
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Направления"
        title="Комплексные услуги от стратегии до внедрения"
        lead="Пять направлений, которые мы соединяем в единую программу под задачу вашего бизнеса — с измеримым результатом на каждом этапе."
      />

      <section className="container-x">
        <div className="hairline grid gap-3 py-6 text-sm text-muted sm:grid-cols-2 lg:grid-cols-5">
          {services.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 transition-colors hover:text-ink"
            >
              <span className="display font-bold text-accent">{s.num}</span>
              {s.title}
            </a>
          ))}
        </div>
      </section>

      {/* Each service — own screen */}
      <div>
        {services.map((s, idx) => {
          const flip = idx % 2 === 1;
          return (
            <section
              key={s.id}
              id={s.id}
              className="section-tight scroll-mt-24 border-t border-line"
            >
              <div className="container-x">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                  {/* Text */}
                  <div className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
                    <Reveal as="span" className="display text-sm font-bold text-accent">
                      {s.num} — {s.short}
                    </Reveal>
                    <Reveal as="h2" delay={60} className="display mt-5 text-balance text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.05] tracking-tightest">
                      {s.title}
                    </Reveal>
                    <Reveal as="p" delay={120} className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted">
                      {s.description}
                    </Reveal>

                    <div className="mt-10 grid gap-10 sm:grid-cols-2">
                      <Reveal delay={160}>
                        <h3 className="eyebrow">Этапы</h3>
                        <ol className="mt-4 space-y-3">
                          {s.stages.map((st, i) => (
                            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
                              <span className="display shrink-0 font-bold text-accent">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              {st}
                            </li>
                          ))}
                        </ol>
                      </Reveal>
                      <Reveal delay={220}>
                        <h3 className="eyebrow">Ожидаемые результаты</h3>
                        <ul className="mt-4 space-y-3">
                          {s.outcomes.map((o, i) => (
                            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
                              <span aria-hidden="true" className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </Reveal>
                    </div>

                    <Reveal delay={260} className="mt-10 flex flex-wrap items-center gap-6">
                      <span className="display text-2xl font-semibold tracking-tightest text-ink">
                        {s.price}
                      </span>
                      <Link href="/contacts" className="btn btn-secondary text-sm">
                        Обсудить задачу
                        <span className="btn-arrow" aria-hidden="true">→</span>
                      </Link>
                    </Reveal>
                  </div>

                  {/* Visual */}
                  <div className={`lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
                    <Reveal delay={100}>
                      {idx % 2 === 0 ? (
                        <DataVisual
                          className="aspect-[4/3] w-full shadow-card"
                          alt="Современный центр аналитики данных."
                        />
                      ) : (
                        <AIVisual
                          className="aspect-[4/3] w-full shadow-card"
                          alt="Визуализация искусственного интеллекта в бизнесе."
                        />
                      )}
                    </Reveal>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="py-24 md:py-32">
        <CTASection title="Готовы обсудить вашу задачу?" />
      </div>
    </>
  );
}
