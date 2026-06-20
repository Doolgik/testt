import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';
import { ConsultVisual } from '@/components/Visuals';

export const metadata: Metadata = {
  title: 'О компании',
  description:
    'NOVA Consulting Group — премиальный экспертный консалтинг по цифровой трансформации для среднего и крупного бизнеса. История, подход, принципы и команда.',
};

const principles = [
  {
    num: '01',
    title: 'Сначала задача, потом технология',
    body: 'Мы начинаем с бизнес-цели и узких мест, а не с модного инструмента. Технология — это средство, а не самоцель.',
  },
  {
    num: '02',
    title: 'Прозрачность на каждом шаге',
    body: 'Вы всегда понимаете, что делается, зачем и к какому результату это ведёт. Без чёрных ящиков и размытых обещаний.',
  },
  {
    num: '03',
    title: 'Ответственность за результат',
    body: 'Мы доводим решения до устойчивой работы в реальных условиях, а не останавливаемся на красивой презентации.',
  },
  {
    num: '04',
    title: 'Долгосрочное партнёрство',
    body: 'Сопровождаем компании по мере роста, развивая технологический контур вместе с бизнесом.',
  },
];

const team = [
  { name: 'Стратегия и трансформация', role: 'Strategy', count: 'Партнёры и стратеги' },
  { name: 'AI и инженерия данных', role: 'Engineering', count: 'AI- и data-инженеры' },
  { name: 'Аналитика и BI', role: 'Analytics', count: 'BI-аналитики' },
  { name: 'Внедрение и поддержка', role: 'Delivery', count: 'Менеджеры внедрения' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="О компании"
        title="Экспертный партнёр по цифровой зрелости бизнеса"
        lead="NOVA Consulting Group помогает компаниям внедрять современные технологии, сокращать издержки и принимать решения на основе данных."
      />

      <section className="container-x">
        <Reveal>
          <ConsultVisual
            className="aspect-[16/9] w-full shadow-card"
            alt="Консультант обсуждает стратегию развития бизнеса."
          />
        </Reveal>
      </section>

      {/* History / narrative */}
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <Reveal as="span" className="eyebrow">История</Reveal>
            <Reveal as="h2" delay={60} className="display mt-5 text-balance text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.05] tracking-tightest">
              Консалтинг, выросший из практики
            </Reveal>
          </div>
          <div className="space-y-6 text-pretty text-lg leading-relaxed text-muted lg:col-span-7 lg:col-start-6">
            <Reveal as="p">
              NOVA Consulting Group объединяет стратегов, инженеров и аналитиков,
              которые годами работали на стыке бизнеса и технологий. Мы видели, как
              дорогие внедрения не приносят результата, потому что не меняют способ,
              которым компания принимает решения.
            </Reveal>
            <Reveal as="p" delay={80}>
              Поэтому мы сопровождаем проекты целиком — от аудита и стратегии до
              внедрения и поддержки. Такой подход убирает разрывы между «придумали» и
              «работает», а ответственность за результат остаётся в одних руках.
            </Reveal>
            <Reveal as="p" delay={160}>
              Сегодня мы работаем со средним и крупным бизнесом в Европе, помогая
              руководителям получить прозрачность, контроль и скорость в управлении.
            </Reveal>
          </div>
        </div>
      </section>

      {/* Approach band */}
      <section className="section-tight bg-ink">
        <div className="container-x">
          <Reveal as="span" className="eyebrow text-accent-soft">Подход</Reveal>
          <Reveal as="p" delay={60} className="display mt-6 max-w-4xl text-balance text-[clamp(1.6rem,3vw,2.6rem)] font-medium leading-[1.12] tracking-tightest text-white">
            Мы соединяем стратегическое мышление консалтинга с инженерной
            дисциплиной внедрения — и доводим решения до измеримого результата.
          </Reveal>
        </div>
      </section>

      {/* Principles */}
      <section className="section">
        <div className="container-x">
          <div className="max-w-2xl">
            <Reveal as="span" className="eyebrow">Принципы</Reveal>
            <Reveal as="h2" delay={60} className="display mt-5 text-balance text-section">
              Во что мы верим
            </Reveal>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line md:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.num} delay={i * 80} className="bg-surface p-8 md:p-10">
                <span className="display text-sm font-bold text-accent">{p.num}</span>
                <h3 className="display mt-6 text-xl font-semibold tracking-tightest md:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-3 text-pretty leading-relaxed text-muted">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section pt-0">
        <div className="container-x">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal as="span" className="eyebrow">Команда</Reveal>
              <Reveal as="h2" delay={60} className="display mt-5 text-balance text-section">
                Мультидисциплинарная экспертиза
              </Reveal>
            </div>
            <Reveal as="p" delay={120} className="text-pretty text-lg leading-relaxed text-muted lg:col-span-6 lg:col-start-7 lg:self-end">
              В каждом проекте участвуют специалисты разных дисциплин — это позволяет
              видеть задачу целиком: от стратегии до инженерии и эксплуатации.
            </Reveal>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((t, i) => (
              <Reveal
                key={t.name}
                delay={i * 80}
                className="rounded-[20px] border border-line bg-surface p-7 shadow-card"
              >
                <span className="eyebrow text-accent">{t.role}</span>
                <h3 className="display mt-5 text-lg font-semibold leading-tight tracking-tightest">
                  {t.name}
                </h3>
                <p className="mt-2 text-sm text-muted">{t.count}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="pb-24 md:pb-32">
        <CTASection title="Познакомимся ближе?" />
      </div>
    </>
  );
}
