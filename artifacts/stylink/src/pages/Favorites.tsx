import { useState } from "react";
import { Link } from "wouter";
import { Heart, Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppStore, type FavoriteCategory } from "@/contexts/AppStore";
import {
  mockProducts,
  mockDesigners,
  type DesignerType,
} from "@/data/mockData";
import ProductCard from "@/components/ProductCard";

const tabs: { value: FavoriteCategory; label: string; type?: DesignerType }[] = [
  { value: "wishlist", label: "Wishlist" },
  { value: "boutiques", label: "Boutiques", type: "Boutique" },
  { value: "designers", label: "Designers", type: "Designer" },
  { value: "ateliers", label: "Ateliers", type: "Atelier" },
  { value: "fabric-retailers", label: "Fabric Retailers", type: "Fournisseur" },
];

export default function Favorites() {
  const { favorites } = useAppStore();
  const [active, setActive] = useState<FavoriteCategory>("wishlist");

  const wishlistProducts = mockProducts.filter((p) =>
    favorites.wishlist.includes(p.id),
  );

  return (
    <section className="container mx-auto px-4 md:px-8 py-20">
      <header className="text-center mb-12">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          Mes Favoris
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4">
          Wishlist & Coups de Cœur
        </h1>
        <p className="text-muted-foreground font-light max-w-xl mx-auto">
          Retrouvez ici toutes les pièces et maisons que vous avez sauvegardées.
        </p>
      </header>

      <Tabs
        value={active}
        onValueChange={(v) => setActive(v as FavoriteCategory)}
        className="w-full"
      >
        <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent border-b border-border rounded-none h-auto p-0 mb-12">
          {tabs.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="text-xs uppercase tracking-[0.2em] py-3 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent"
              data-testid={`tab-fav-${t.value}`}
            >
              {t.label}
              <span className="ml-2 text-[10px] text-muted-foreground">
                ({favorites[t.value].length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="wishlist">
          {wishlistProducts.length === 0 ? (
            <EmptyState label="Aucun article sauvegardé pour le moment." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {wishlistProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </TabsContent>

        {tabs
          .filter((t) => t.type)
          .map((t) => {
            const items = mockDesigners.filter(
              (d) => d.type === t.type && favorites[t.value].includes(d.id),
            );
            return (
              <TabsContent key={t.value} value={t.value}>
                {items.length === 0 ? (
                  <EmptyState
                    label={`Aucun favori dans ${t.label.toLowerCase()}.`}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {items.map((d) => (
                      <Link
                        key={d.id}
                        href={`/designers/${d.id}`}
                        className="group"
                        data-testid={`fav-card-${d.id}`}
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                          <img
                            src={d.image}
                            alt={d.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 bg-background/90 text-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1">
                            {d.type}
                          </span>
                          <span className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-background/90">
                            <Heart className="w-4 h-4 fill-primary text-primary" />
                          </span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                          {d.city}
                        </p>
                        <h3 className="font-serif text-xl text-foreground mb-1 group-hover:text-primary transition-colors">
                          {d.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-light italic mb-2">
                          {d.specialty}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-foreground">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span>{d.rating.toFixed(1)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
      </Tabs>
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-32 text-center">
      <Heart
        className="w-12 h-12 mx-auto mb-6 text-muted-foreground/40"
        strokeWidth={1}
      />
      <p className="text-muted-foreground font-light">{label}</p>
    </div>
  );
}
