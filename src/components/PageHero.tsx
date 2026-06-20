import Reveal from './Reveal';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
};

export default function PageHero({ eyebrow, title, lead }: PageHeroProps) {
  return (
    <section className="container-x pb-12 pt-36 md:pb-20 md:pt-48">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Reveal as="p" className="eyebrow">
            {eyebrow}
          </Reveal>
          <Reveal as="h1" delay={80} className="display mt-6 text-balance text-section">
            {title}
          </Reveal>
        </div>
        <div className="lg:col-span-4 lg:self-end">
          <Reveal
            as="p"
            delay={160}
            className="text-pretty text-lg leading-relaxed text-muted"
          >
            {lead}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
