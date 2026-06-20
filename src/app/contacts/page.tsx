import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import ContactForm from '@/components/ContactForm';
import { company } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Контакты',
  description:
    'Свяжитесь с NOVA Consulting Group во Франкфурте-на-Майне. Телефон, email, адрес и форма заявки на консультацию.',
};

const mapQuery = encodeURIComponent(
  `${company.address.street}, ${company.address.city}, ${company.address.country}`
);

export default function ContactsPage() {
  return (
    <>
      <PageHero
        eyebrow="Контакты"
        title="Начнём с разговора о вашей задаче"
        lead="Оставьте заявку или свяжитесь напрямую — ответим в течение одного рабочего дня и согласуем удобное время консультации."
      />

      <section className="container-x pb-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Contact info */}
          <div className="lg:col-span-5">
            <Reveal>
              <dl className="space-y-8">
                <div>
                  <dt className="eyebrow">Телефон</dt>
                  <dd className="mt-2">
                    <a href={`tel:${company.phoneHref}`} className="display text-2xl font-semibold tracking-tightest text-ink transition-colors hover:text-accent">
                      {company.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Email</dt>
                  <dd className="mt-2">
                    <a href={`mailto:${company.email}`} className="display text-2xl font-semibold tracking-tightest text-ink transition-colors hover:text-accent">
                      {company.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Адрес</dt>
                  <dd className="mt-2">
                    <address className="not-italic text-lg leading-relaxed text-ink/80">
                      {company.address.street}
                      <br />
                      {company.address.city}
                      <br />
                      {company.address.country}
                    </address>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Часы работы</dt>
                  <dd className="mt-3 max-w-xs space-y-2">
                    {company.hours.map((h) => (
                      <div key={h.d} className="flex justify-between border-b border-line pb-2 text-[15px]">
                        <span className="text-muted">{h.d}</span>
                        <span className="text-ink">{h.t}</span>
                      </div>
                    ))}
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <Reveal delay={100}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="container-x pb-24 md:pb-32">
        <Reveal className="overflow-hidden rounded-[20px] border border-line shadow-card">
          <iframe
            title={`Карта: ${company.address.street}, ${company.address.city}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=8.655%2C50.107%2C8.685%2C50.118&layer=mapnik&marker=50.1126%2C8.6700`}
            className="h-[380px] w-full md:h-[460px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="flex flex-col gap-3 border-t border-line bg-surface px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-muted">
              {company.address.street}, {company.address.city}, {company.address.country}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-medium text-accent transition-opacity hover:opacity-70"
            >
              Открыть в картах →
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
