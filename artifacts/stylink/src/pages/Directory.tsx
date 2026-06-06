import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Star, Heart } from "lucide-react";
import { mockDesigners, type DesignerType } from "@/data/mockData";
import { useAppStore, type FavoriteCategory } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";

interface DirectoryProps {
  type: DesignerType;
  eyebrow: string;
  title: string;
  subtitle: string;
  emptyTitle?: string;
}

const categoryFor: Record<DesignerType, FavoriteCategory> = {
  Boutique: "boutiques",
  Designer: "designers",
  Atelier: "ateliers",
  Fournisseur: "fabric-retailers",
};

export default function Directory({
  type,
  eyebrow,
  title,
  subtitle,
  emptyTitle = "Aucun résultat trouvé",
}: DirectoryProps) {
  const [query, setQuery] = useState("");
  const { isFavorite, toggleFavorite } = useAppStore();
  const { toast } = useToast();
  const favCategory = categoryFor[type];

  const items = useMemo(() => {
    return mockDesigners
      .filter((d) => d.type === type)
      .filter((d) => {
        if (query.trim() === "") return true;
        const q = query.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q)
        );
      });
  }, [query, type]);

  return (
    <section className="container mx-auto px-4 md:px-8 py-20">
      <header className="text-center mb-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          {eyebrow}
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4">
          {title}
        </h1>
        <p className="text-muted-foreground font-light max-w-xl mx-auto">
          {subtitle}
        </p>
      </header>

      <div className="flex justify-center mb-16">
        <div className="w-full max-w-xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, ville ou spécialité..."
            data-testid={`input-search-${type.toLowerCase()}`}
            className="w-full h-14 pl-12 pr-4 bg-transparent border-b border-border focus:outline-none focus:border-primary transition-colors font-sans"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-32 text-center">
          <h3 className="font-serif text-2xl text-foreground mb-3">
            {emptyTitle}
          </h3>
          <p className="text-muted-foreground font-light">
            Essayez un autre nom ou une autre ville.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {items.map((d) => {
            const fav = isFavorite(favCategory, d.id);
            return (
              <div key={d.id} className="group relative">
                <Link
                  href={`/designers/${d.id}`}
                  data-testid={`card-${type.toLowerCase()}-${d.id}`}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-background/90 text-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1 z-10">
                      {d.type}
                    </span>

                    {/* Permanent gradient + name on image */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                    {/* Description overlay - peek + reveal on hover */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/70 mb-1">
                        {d.city}
                      </p>
                      <h3 className="font-serif text-2xl leading-tight mb-2">
                        {d.name}
                      </h3>
                      <p className="font-serif italic text-sm text-white/85 mb-3">
                        {d.specialty}
                      </p>
                      <p
                        className="text-xs font-light leading-relaxed text-white/90 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-out line-clamp-3"
                        data-testid={`text-bio-${d.id}`}
                      >
                        {d.bio}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Découvrir
                    </p>
                    <div className="flex items-center gap-1 text-xs text-foreground">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span>{d.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(favCategory, d.id);
                    toast({
                      title: fav
                        ? "Retiré des favoris"
                        : "Ajouté aux favoris",
                      description: d.name,
                    });
                  }}
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10"
                  data-testid={`button-fav-${d.id}`}
                  aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Heart
                    className={`w-4 h-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`}
                    strokeWidth={1.5}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
