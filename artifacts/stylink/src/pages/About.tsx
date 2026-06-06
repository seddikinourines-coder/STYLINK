export default function About() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-24 max-w-4xl">
      <header className="text-center mb-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          About Us
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6">
          Notre Manifeste
        </h1>
        <p className="text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
          STYLINK est la première plateforme dédiée à la haute couture algérienne
          indépendante — un trait d'union entre créateurs, ateliers, fournisseurs
          de tissus et boutiques d'exception.
        </p>
      </header>

      <div className="prose prose-lg max-w-none font-sans text-foreground/90 leading-relaxed space-y-6">
        <p>
          Née d'une obsession pour le savoir-faire et d'une conviction que
          l'Algérie regorge de talents trop discrets, STYLINK rassemble en un
          même lieu les acteurs essentiels de la mode locale : designers
          visionnaires, ateliers gardiens de gestes ancestraux, fournisseurs de
          matières précieuses et boutiques curatées.
        </p>
        <p>
          Notre mission est simple — révéler. Donner à voir, donner à toucher,
          donner à acheter. Permettre à une cliente de Constantine de découvrir
          un caftan brodé à Tlemcen, à un styliste algérois de sourcer une soie
          rare à Tizi Ouzou, à une mariée de rencontrer la maison qui réalisera
          sa robe.
        </p>
        <p>
          STYLINK est une maison digitale exigeante, sélective, fière de son
          héritage et résolument tournée vers le futur. Chaque profil est
          vérifié, chaque pièce est singulière, chaque rencontre est une
          promesse.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 pt-16 border-t border-border">
        <div className="text-center">
          <p className="font-serif text-4xl text-primary mb-2">2026</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Année de Fondation
          </p>
        </div>
        <div className="text-center">
          <p className="font-serif text-4xl text-primary mb-2">48</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Wilayas Représentées
          </p>
        </div>
        <div className="text-center">
          <p className="font-serif text-4xl text-primary mb-2">+200</p>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Maisons Partenaires
          </p>
        </div>
      </div>
    </section>
  );
}
