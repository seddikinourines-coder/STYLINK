import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border py-16 bg-background text-foreground">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1 flex flex-col items-start">
            <h2 className="font-serif text-3xl tracking-[0.2em] uppercase mb-6">
              STYLINK
            </h2>
            <p className="text-muted-foreground text-sm font-sans font-light mb-6">
              La destination de choix pour la haute couture algérienne. L'élégance à la rencontre de l'artisanat.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-medium uppercase tracking-[0.2em] text-xs mb-2">Maison</h3>
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">Accueil</Link>
            <Link href="/shop" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">La Boutique</Link>
            <Link href="/designers" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">Nos Créateurs</Link>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-medium uppercase tracking-[0.2em] text-xs mb-2">Découvrir</h3>
            <Link href="/map" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">Carte de la Mode</Link>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">Journal</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-light">Savoir-Faire</a>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-medium uppercase tracking-[0.2em] text-xs mb-2">Rejoindre la liste</h3>
            <p className="text-muted-foreground text-sm font-light mb-2">Inscrivez-vous pour découvrir nos dernières collections et événements exclusifs.</p>
            <form className="flex w-full" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="flex-1 bg-transparent border-b border-border py-2 text-sm font-light focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
              />
              <button 
                type="submit"
                className="border-b border-border py-2 px-4 uppercase tracking-[0.1em] text-xs hover:text-primary hover:border-primary transition-colors"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/50 text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-sans">
          <div>&copy; {new Date().getFullYear()} STYLINK. TOUS DROITS RÉSERVÉS.</div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
