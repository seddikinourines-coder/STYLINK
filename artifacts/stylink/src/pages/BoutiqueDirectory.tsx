import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Search, Heart } from "lucide-react";
import { useAppStore } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";

const API = "/api";

interface Business {
  id: number;
  name: string;
  contact_name: string | null;
  city: string | null;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
}

function Avatar({ business }: { business: Business }) {
  if (business.avatar_url) {
    return (
      <img
        src={business.avatar_url}
        alt={business.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <span className="font-serif text-7xl text-muted-foreground/40 select-none">
        {business.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export default function BoutiqueDirectory() {
  const [query, setQuery] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/businesses`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter((b) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.city ?? "").toLowerCase().includes(q) ||
      (b.role ?? "").toLowerCase().includes(q) ||
      (b.bio ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <section className="container mx-auto px-4 md:px-8 py-20">
      <header className="text-center mb-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          Boutiques
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4">
          Adresses d'Exception
        </h1>
        <p className="text-muted-foreground font-light max-w-xl mx-auto">
          Découvrez les créateurs, ateliers et boutiques algériennes inscrits sur STYLINK.
        </p>
      </header>

      <div className="flex justify-center mb-16">
        <div className="w-full max-w-xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, ville ou catégorie…"
            className="w-full h-14 pl-12 pr-4 bg-transparent border-b border-border focus:outline-none focus:border-primary transition-colors font-sans"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <p className="text-muted-foreground font-light">Chargement…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center">
          <h3 className="font-serif text-2xl text-foreground mb-3">
            {businesses.length === 0
              ? "Aucun compte professionnel encore"
              : "Aucun résultat trouvé"}
          </h3>
          <p className="text-muted-foreground font-light">
            {businesses.length === 0
              ? "Les professionnels qui créent un compte apparaîtront ici."
              : "Essayez un autre nom ou une autre ville."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filtered.map((b) => {
            const favId = String(b.id);
            const fav = isFavorite("boutiques", favId);
            return (
              <div key={b.id} className="group relative">
                <Link href={`/boutiques/${b.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                    <Avatar business={b} />

                    <span className="absolute top-3 left-3 bg-background/90 text-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1 z-10">
                      {b.role ?? "Professionnel"}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      {b.city && (
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/70 mb-1">
                          {b.city}
                        </p>
                      )}
                      <h3 className="font-serif text-2xl leading-tight mb-2">
                        {b.name}
                      </h3>
                      {b.bio && (
                        <p className="text-xs font-light leading-relaxed text-white/90 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-out line-clamp-3">
                          {b.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Voir la boutique
                  </p>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite("boutiques", favId);
                    toast({
                      title: fav ? "Retiré des favoris" : "Ajouté aux favoris",
                      description: b.name,
                    });
                  }}
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10"
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
