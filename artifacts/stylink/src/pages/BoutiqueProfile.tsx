import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Package, MapPin, Tag } from "lucide-react";
import NotFound from "@/pages/not-found";

const API = "/api";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  image_url: string | null;
}

interface BusinessDetail {
  id: number;
  name: string;
  contact_name: string | null;
  city: string | null;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  products: Product[];
}

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return [raw]; }
}

export default function BoutiqueProfile() {
  const [, params] = useRoute<{ id: string }>("/boutiques/:id");
  const [business, setBusiness] = useState<BusinessDetail | null | "loading">("loading");

  useEffect(() => {
    if (!params?.id) return;
    fetch(`${API}/businesses/${params.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setBusiness)
      .catch(() => setBusiness(null));
  }, [params?.id]);

  if (business === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-light">Chargement…</p>
      </div>
    );
  }

  if (!business) return <NotFound />;

  return (
    <article>
      {/* Hero */}
      <section className="relative bg-muted">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
          {/* Avatar / cover */}
          <div className="md:col-span-5 relative aspect-[3/4] md:aspect-auto overflow-hidden">
            {business.avatar_url ? (
              <img
                src={business.avatar_url}
                alt={business.name}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <span className="font-serif text-[12rem] text-muted-foreground/20 select-none leading-none">
                  {business.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:col-span-7 flex flex-col justify-end px-6 md:px-12 lg:px-16 py-12 md:py-16">
            <Link
              href="/boutiques"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/80 hover:text-primary mb-6 self-start"
            >
              <ArrowLeft className="w-4 h-4" /> Toutes les boutiques
            </Link>

            <div className="flex flex-wrap gap-3 mb-4">
              {business.role && (
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-primary border border-primary/30 px-3 py-1">
                  <Tag className="w-3 h-3" />
                  {business.role}
                </span>
              )}
              {business.city && (
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground border border-border px-3 py-1">
                  <MapPin className="w-3 h-3" />
                  {business.city}
                </span>
              )}
            </div>

            <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-4">
              {business.name}
            </h1>

            {business.bio && (
              <p className="font-serif italic text-xl text-muted-foreground max-w-xl">
                {business.bio}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 md:px-8 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-2 font-sans">
              Collection
            </p>
            <h2 className="font-serif text-4xl text-foreground">
              Articles en boutique
            </h2>
          </div>
          <span className="text-sm text-muted-foreground font-light">
            {business.products.length} article{business.products.length !== 1 ? "s" : ""}
          </span>
        </div>

        {business.products.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-border">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" strokeWidth={1} />
            <h3 className="font-serif text-2xl text-foreground mb-2">
              Aucun article pour l'instant
            </h3>
            <p className="text-muted-foreground font-light text-sm">
              {business.name} n'a pas encore ajouté d'articles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {business.products.map((p) => {
              const images = parseImages(p.image_url);
              const thumb = images[0] ?? null;
              return (
                <Link key={p.id} href={`/products/${p.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-muted mb-4 relative">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground/20" strokeWidth={1} />
                      </div>
                    )}
                    {images.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5">
                        +{images.length - 1}
                      </span>
                    )}
                    {p.category && (
                      <span className="absolute top-3 left-3 bg-background/90 text-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1">
                        {p.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                  )}
                  <p className="text-sm font-medium">
                    {Number(p.price).toLocaleString("fr-DZ")} DZD
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </article>
  );
}
