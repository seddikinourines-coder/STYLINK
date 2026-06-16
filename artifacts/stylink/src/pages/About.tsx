import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 md:px-8 py-24 max-w-4xl">
      <header className="text-center mb-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          {t('about.eyebrow')}
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6">
          {t('about.title')}
        </h1>
        <p className="text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
          {t('about.p1')}
        </p>
      </header>

      <div className="prose prose-lg max-w-none font-sans text-foreground/90 leading-relaxed space-y-6">
        <p>
          {t('about.p2')}
        </p>
        <p>
          {t('about.p3')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 pt-16 border-t border-border">
        <div className="text-center">
          <p className="font-serif text-4xl text-primary mb-2">2026</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {t('about.stat_year')}
          </p>
        </div>
        <div className="text-center">
          <p className="font-serif text-4xl text-primary mb-2">58</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {t('about.stat_wilayas')}
          </p>
        </div>
        <div className="text-center">
          <p className="font-serif text-4xl text-primary mb-2">+200</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {t('about.stat_partners')}
          </p>
        </div>
      </div>
    </section>
  );
}
