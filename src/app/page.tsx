import Link from 'next/link';
import Reveal from '@/components/Reveal';
import ServicesInteractive from '@/components/ServicesInteractive';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import { HeroVisual, AIVisual } from '@/components/Visuals';
import { processSteps, businessEffects } from '@/lib/content';

export default function HomePage() {
  return (
    <>
      {/* ============ HERO (editorial, asymmetric) ============ */}
      <section className="container-x pb-16 pt-36 md:pb-24 md:pt-44">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal as="p" className="eyebrow flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              Цифровая трансформация бизнеса
            </Reveal>
            <Reveal as="h1" delay={60} className="display mt-7 text-balance text-hero">
              Технологии, которые превращают данные в конкурентное преимущество
            </Reveal>
          </div>
          <div className="lg:col-span-5 lg:pb-3">
            <Reveal as="p" delay={140} className="max-w-md text-pretty text-sub text-muted">
              Помогаем компаниям внедрять AI, автоматизировать процессы и принимать
              решения быстрее.
            </Reveal>
            <Reveal delay={220} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/contacts" className="btn btn-primary">
                Получить консультацию
                <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link href="/about" className="btn btn-secondary">
                Посмотреть подход
              </Link>
            </Reveal>
          </div>
        </div>

        <Reveal delay={120} className="mt-14 md:mt-20">
          <HeroVisual
            className="aspect-[16/9] w-full shadow-card"
            alt="Руководители обсуждают стратегию цифровой трансформации."
          />
        </Reveal>

        {/* trust strip */}
        <Reveal className="mt-12 grid grid-cols-2 gap-y-8 border-t border-line pt-10 md:grid-cols-4">
          {[
            ['Комплексный подход', 'от стратегии до внедрения'],
            ['Экспертиза в AI', 'и автоматизации процессов'],
            ['Прозрачные процессы', 'на каждом этапе'],
            ['Долгосрочное', 'сопровождение'],
          ].map(([a, b]) => (
            <div key={a} className="pr-6">
              <p className="display text-base font-semibold tracking-tightest text-ink">{a}</p>
              <p className="mt-1 text-sm text-muted">{b}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ============ INTRO — the key thought ============ */}
      <section className="section-tight">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12">
            <Reveal as="p" className="eyebrow lg:col-span-3">
              Точка зрения
            </Reveal>
            <div className="lg:col-span-9">
              <Reveal
                as="p"
                className="display text-balance text-[clamp(1.75rem,3.4vw,3rem)] font-medium leading-[1.1] tracking-tightest"
              >
                Большинство компаний покупают технологии.{' '}
                <span className="text-muted">
                  Лидеры перестраивают систему принятия решений.
                </span>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROCESS — how the result is created ============ */}
      <section className="section">
        <div className="container-x">
          <div className="max-w-2xl">
            <Reveal as="span" className="eyebrow">Метод</Reveal>
            <Reveal as="h2" delay={60} className="display mt-5 text-balance text-section">
              Как создаётся результат
            </Reveal>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line md:grid-cols-3 md:mt-20">
            {processSteps.map((step, i) => (
              <Reveal
                key={step.num}
                delay={i * 100}
                className="group bg-surface p-8 transition-colors duration-500 hover:bg-canvas md:p-10"
              >
                <span className="display text-sm font-bold text-accent">{step.num}</span>
                <h3 className="display mt-8 text-2xl font-semibold tracking-tightest md:text-[1.75rem]">
                  {step.title}
                </h3>
                <p className="mt-4 text-pretty leading-relaxed text-muted">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES — interactive ============ */}
      <section className="section pt-0">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal as="span" className="eyebrow">Направления</Reveal>
              <Reveal as="h2" delay={60} className="display mt-5 text-balance text-section">
                Услуги под конкретные бизнес-задачи
              </Reveal>
            </div>
            <Reveal
              as="p"
              delay={120}
              className="text-pretty text-lg leading-relaxed text-muted lg:col-span-5 lg:self-end"
            >
              Наведите на направление, чтобы увидеть подход и этапы работы. Каждый
              проект мы ведём от анализа до устойчивого результата.
            </Reveal>
          </div>

          <div className="mt-16 md:mt-20">
            <ServicesInteractive />
          </div>
        </div>
      </section>

      {/* ============ BUSINESS EFFECTS ============ */}
      <section className="section pt-0">
        <div className="container-x">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Reveal as="span" className="eyebrow">Что меняется</Reveal>
              <Reveal as="h2" delay={60} className="display mt-5 text-balance text-section">
                Эффект, который чувствует весь бизнес
              </Reveal>
              <Reveal
                delay={120}
                className="mt-10 hidden lg:block lg:sticky lg:top-28"
              >
                <AIVisual
                  className="aspect-[16/10] w-full"
                  alt="Визуализация искусственного интеллекта в бизнесе."
                />
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2">
                {businessEffects.map((e, i) => (
                  <Reveal
                    key={e.title}
                    delay={i * 80}
                    className="bg-surface p-8 md:p-9"
                  >
                    <h3 className="display text-xl font-semibold tracking-tightest md:text-2xl">
                      {e.title}
                    </h3>
                    <p className="mt-3 text-pretty leading-relaxed text-muted">{e.body}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PHILOSOPHY — editorial quote ============ */}
      <section className="section bg-ink pt-0">
        <div className="container-x">
          <div className="border-t border-white/10 pt-20 md:pt-28">
            <Reveal as="span" className="eyebrow text-accent-soft">
              Философия NOVA
            </Reveal>
            <Reveal
              as="blockquote"
              delay={80}
              className="display mt-8 max-w-5xl text-balance text-[clamp(2rem,4.5vw,4rem)] font-medium leading-[1.08] tracking-tightest text-white"
            >
              «Технологии имеют ценность только тогда, когда меняют способ принятия
              решений.»
            </Reveal>
            <Reveal delay={160} className="mt-12 max-w-xl text-pretty text-lg leading-relaxed text-white/60">
              Мы не внедряем технологии ради технологий. Каждое решение существует,
              чтобы дать руководству больше ясности, контроля и скорости.
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="section">
        <div className="container-x">
          <div className="max-w-2xl">
            <Reveal as="span" className="eyebrow">Отзывы</Reveal>
            <Reveal as="h2" delay={60} className="display mt-5 text-balance text-section">
              Нам доверяют принятие важных решений
            </Reveal>
          </div>
          <div className="mt-16 md:mt-20">
            <Testimonials />
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <div className="pb-24 md:pb-32">
        <CTASection />
      </div>
    </>
  );
}
