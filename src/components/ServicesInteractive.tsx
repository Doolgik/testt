'use client';

import { useState } from 'react';
import Link from 'next/link';
import { services } from '@/lib/content';

export default function ServicesInteractive() {
  const [active, setActive] = useState<string>(services[0].id);

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      {/* List */}
      <ul className="lg:col-span-7">
        {services.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id} className="border-t border-line last:border-b">
              <button
                type="button"
                onMouseEnter={() => setActive(s.id)}
                onFocus={() => setActive(s.id)}
                onClick={() => setActive(s.id)}
                aria-expanded={isActive}
                className="group block w-full py-7 text-left md:py-8"
              >
                <div className="flex items-baseline gap-5 md:gap-8">
                  <span
                    className={`display text-sm font-bold transition-colors duration-300 ${
                      isActive ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {s.num}
                  </span>
                  <span className="flex-1">
                    <span
                      className={`display block text-balance text-2xl font-semibold tracking-tightest transition-colors duration-300 md:text-[2rem] ${
                        isActive ? 'text-ink' : 'text-ink/55 group-hover:text-ink'
                      }`}
                    >
                      {s.title}
                    </span>
                    <span
                      className={`grid transition-all duration-500 ease-premium ${
                        isActive
                          ? 'mt-3 grid-rows-[1fr] opacity-100'
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <span className="overflow-hidden">
                        <span className="block max-w-xl text-pretty text-base leading-relaxed text-muted">
                          {s.description}
                        </span>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
                          {s.price}
                        </span>
                      </span>
                    </span>
                  </span>
                  <span
                    className={`hidden shrink-0 text-2xl transition-all duration-500 ease-premium md:block ${
                      isActive ? 'translate-x-1 text-accent' : 'text-muted'
                    }`}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Detail panel */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          {services.map((s) => (
            <div
              key={s.id}
              className={`rounded-[20px] border border-line bg-surface p-8 shadow-card transition-all duration-500 ease-premium ${
                active === s.id ? 'block' : 'hidden'
              }`}
            >
              <span className="eyebrow">Этапы работы</span>
              <ol className="mt-5 space-y-4">
                {s.stages.map((st, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="display mt-0.5 text-sm font-bold text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink/80">{st}</span>
                  </li>
                ))}
              </ol>
              <Link
                href="/services"
                className="btn btn-secondary mt-8 w-full text-sm"
              >
                Подробнее об услуге
                <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
