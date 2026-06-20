'use client';

import { useState, type FormEvent } from 'react';
import { services } from '@/lib/content';

type Status = 'idle' | 'submitting' | 'success';

const fieldClass =
  'mt-2 w-full rounded-xl border border-line bg-canvas px-4 py-3.5 text-[15px] text-ink outline-none transition-all duration-300 placeholder:text-muted/70 focus:border-accent focus:bg-surface focus:ring-2 focus:ring-accent/15';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    // Demo-only: simulate submission without a backend.
    window.setTimeout(() => setStatus('success'), 700);
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex min-h-[420px] flex-col items-start justify-center rounded-[20px] border border-line bg-surface p-8 shadow-card md:p-10"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="display mt-7 text-2xl font-semibold tracking-tightest">
          Заявка отправлена
        </h3>
        <p className="mt-3 max-w-sm text-pretty leading-relaxed text-muted">
          Спасибо! Мы свяжемся с вами в течение одного рабочего дня, чтобы согласовать
          время консультации.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="btn btn-secondary mt-8 text-sm"
        >
          Отправить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[20px] border border-line bg-surface p-7 shadow-card md:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-ink">
            Имя <span className="text-accent">*</span>
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" placeholder="Александр Морозов" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="company" className="text-sm font-medium text-ink">
            Компания
          </label>
          <input id="company" name="company" type="text" autoComplete="organization" placeholder="Название компании" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-ink">
            Email <span className="text-accent">*</span>
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-ink">
            Телефон
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+49 …" className={fieldClass} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="service" className="text-sm font-medium text-ink">
          Интересующее направление
        </label>
        <select id="service" name="service" defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Выберите услугу
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
          <option value="other">Другое / не уверен</option>
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="message" className="text-sm font-medium text-ink">
          Задача <span className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Коротко опишите задачу или ситуацию, с которой нужна помощь."
          className={`${fieldClass} resize-none`}
        />
      </div>

      <button type="submit" disabled={status === 'submitting'} className="btn btn-primary mt-7 w-full disabled:opacity-70">
        {status === 'submitting' ? 'Отправляем…' : 'Отправить заявку'}
        {status !== 'submitting' && (
          <span className="btn-arrow" aria-hidden="true">→</span>
        )}
      </button>
      <p className="mt-4 text-center text-xs leading-relaxed text-muted">
        Нажимая «Отправить», вы соглашаетесь на обработку данных для связи по заявке.
      </p>
    </form>
  );
}
