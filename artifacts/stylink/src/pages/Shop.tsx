import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import ProductCard from "@/components/ProductCard";
import { mockProducts, mockDesigners } from "@/data/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API = "/api";

interface UserProduct {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  image_url: string | null;
  created_at: string;
  seller_name: string;
  seller_role: string | null;
}

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return [raw]; }
}

const categories = ["Toutes", "Robes", "Caftans", "Tissus", "Accessoires"];

export default function Shop() {
  const [category, setCategory] = useState("Toutes");
  const [designerFilter, setDesignerFilter] = useState("all");
  const [sort, setSort] = useState("nouveautes");
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setUserProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let list = mockProducts.slice();
    if (category !== "Toutes") list = list.filter((p) => p.category === category);
    if (designerFilter !== "all")
      list = list.filter((p) => p.designerId === designerFilter);
    if (sort === "asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [category, designerFilter, sort]);

  const filteredUserProducts = useMemo(() => {
    return userProducts.filter((p) => {
      if (category !== "Toutes" && p.category !== category) return false;
      return true;
    });
  }, [userProducts, category]);

  return (
    <section className="container mx-auto px-4 md:px-8 py-20">
      <header className="text-center mb-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          La Boutique
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4">
          Pièces d'exception
        </h1>
        <p className="text-muted-foreground font-light max-w-xl mx-auto">
          Une sélection rare de créations algériennes, du prêt-à-porter aux
          tissus précieux.
        </p>
      </header>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-y border-border py-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`text-xs uppercase tracking-[0.2em] py-2 transition-colors ${
                category === cat
                  ? "text-primary border-b border-primary"
                  : "text-foreground hover:text-primary"
              }`}
              data-testid={`button-category-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={designerFilter} onValueChange={setDesignerFilter}>
            <SelectTrigger
              className="w-full sm:w-[200px] rounded-none border-x-0 border-t-0 border-b border-border bg-transparent text-xs uppercase tracking-[0.2em]"
              data-testid="select-designer"
            >
              <SelectValue placeholder="Designer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les créateurs</SelectItem>
              {mockDesigners.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger
              className="w-full sm:w-[200px] rounded-none border-x-0 border-t-0 border-b border-border bg-transparent text-xs uppercase tracking-[0.2em]"
              data-testid="select-sort"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nouveautes">Nouveautés</SelectItem>
              <SelectItem value="asc">Prix croissant</SelectItem>
              <SelectItem value="desc">Prix décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredUserProducts.length > 0 && (
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-sans whitespace-nowrap">
              Créations des membres
            </p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filteredUserProducts.map((p) => {
              const images = parseImages(p.image_url);
              const thumb = images[0] ?? undefined;
              return (
                <Link key={`u-${p.id}`} href={`/products/${p.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden bg-muted mb-4 relative">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest">
                        Pas de photo
                      </div>
                    )}
                    {images.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
                        +{images.length - 1}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    {p.seller_name}{p.category ? ` · ${p.category}` : ""}
                  </p>
                  <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                  )}
                  <p className="text-sm font-medium text-foreground">
                    {Number(p.price).toLocaleString("fr-DZ")} DZD
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 && filteredUserProducts.length === 0 ? (
        <div className="py-32 text-center">
          <h3 className="font-serif text-2xl text-foreground mb-3">
            Aucun produit trouvé
          </h3>
          <p className="text-muted-foreground font-light">
            Essayez d'autres filtres pour découvrir nos pièces.
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <>
          {filteredUserProducts.length > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-sans whitespace-nowrap">
                Sélection éditoriale
              </p>
              <div className="flex-1 h-px bg-border" />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
