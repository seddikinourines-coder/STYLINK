import { useTranslation } from "react-i18next";
import { Mail, Phone } from "lucide-react";

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

      <div className="mt-32 pt-16 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
            {t('about.contact_title')}
          </h2>
          <p className="text-muted-foreground font-light mb-12">
            {t('about.contact_subtitle')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-border bg-card/30 rounded-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Mail size={20} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-sans">
                {t('about.email_label')}
              </p>
              <a href="mailto:support@stylink.com" className="text-lg font-serif hover:text-primary transition-colors">
                support@stylink.com
              </a>
            </div>
            
            <div className="p-8 border border-border bg-card/30 rounded-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Phone size={20} />
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 font-sans">
                {t('about.phone_label')}
              </p>
              <a href="tel:+213555123456" className="text-lg font-serif hover:text-primary transition-colors">
                +213 (0) 555 12 34 56
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
