import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';
import { DataVisual, AIVisual, ConsultVisual } from '@/components/Visuals';
import { cases } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Кейсы',
  description:
    'Концептуальные кейсы NOVA Consulting Group: задача, подход и результат в проектах по BI-аналитике, внедрению AI и корпоративной автоматизации.',
};

const visuals = [
  { C: DataVisual, alt: 'Современный центр аналитики данных.' },
  { C: AIVisual, alt: 'Визуализация искусственного интеллекта в бизнесе.' },
  { C: ConsultVisual, alt: 'Консультант обсуждает стратегию развития бизнеса.' },
];

export default function CasesPage() {
  return (
    <>
      <PageHero
        eyebrow="Кейсы"
        title="Как выглядит результат на практике"
        lead="Концептуальные истории проектов: как мы переходим от задачи к подходу и устойчивому результату для бизнеса."
      />

      <div>
        {cases.map((c, idx) => {
          const { C, alt } = visuals[idx % visuals.length];
          const flip = idx % 2 === 1;
          return (
            <section key={c.id} className="section-tight border-t border-line">
              <div className="container-x">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                  <div className={`lg:col-span-5 ${flip ? 'lg:order-2' : ''}`}>
                    <Reveal delay={80}>
                      <C className="aspect-[4/3] w-full shadow-card" alt={alt} />
                    </Reveal>
                  </div>

                  <div className={`lg:col-span-7 ${flip ? 'lg:order-1' : ''}`}>
                    <Reveal as="span" className="eyebrow text-accent">
                      {c.sector}
                    </Reveal>
                    <Reveal as="h2" delay={60} className="display mt-5 text-balance text-[clamp(1.85rem,3.4vw,3rem)] font-semibold leading-[1.05] tracking-tightest">
                      {c.title}
                    </Reveal>

                    <dl className="mt-9 space-y-7">
                      {[
                        ['Задача', c.task],
                        ['Подход', c.approach],
                        ['Результат', c.result],
                      ].map(([label, body], i) => (
                        <Reveal key={label} delay={120 + i * 70} className="grid gap-2 border-t border-line pt-5 sm:grid-cols-[140px_1fr] sm:gap-6">
                          <dt className="eyebrow pt-1">{label}</dt>
                          <dd className="text-pretty leading-relaxed text-ink/80">{body}</dd>
                        </Reveal>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="border-t border-line py-24 md:py-32">
        <CTASection title="Хотите похожий результат в своей компании?" />
      </div>
    </>
  );
}
