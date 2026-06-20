import Reveal from './Reveal';
import { testimonials } from '@/lib/content';

function Stars() {
  return (
    <div className="flex gap-1" aria-label="Оценка 5 из 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M8 1l2.06 4.18 4.61.67-3.34 3.25.79 4.6L8 11.6l-4.12 2.1.79-4.6L1.33 5.85l4.61-.67L8 1Z"
            fill="#0F5EFF"
          />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <Reveal
          key={t.name}
          as="figure"
          delay={i * 90}
          className="flex flex-col rounded-[20px] border border-line bg-surface p-8 shadow-card"
        >
          <Stars />
          <blockquote className="mt-6 flex-1 text-pretty text-lg leading-relaxed text-ink">
            «{t.quote}»
          </blockquote>
          <figcaption className="mt-8 border-t border-line pt-5">
            <span className="display block font-semibold tracking-tightest text-ink">
              {t.name}
            </span>
            <span className="text-sm text-muted">{t.role}</span>
          </figcaption>
        </Reveal>
      ))}
    </div>
  );
}
