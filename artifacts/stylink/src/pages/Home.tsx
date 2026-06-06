import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import Hero from "@/components/home/Hero";
import ProductCard from "@/components/ProductCard";
import FashionMap from "@/components/FashionMap";
import { mockProducts, mockDesigners } from "@/data/mockData";

export default function Home() {
  const newArrivals = mockProducts.filter((p) => p.isNew).slice(0, 4);
  const featuredDesigners = mockDesigners.slice(0, 3);

  return (
    <>
      <Hero />

      {/* New Arrivals — slides up over the hero for depth */}
      <section className="relative z-10 -mt-[18vh] md:-mt-[22vh] bg-background rounded-t-[2rem] md:rounded-t-[3rem] shadow-[0_-30px_60px_-15px_rgba(0,0,0,0.25)] container mx-auto px-4 md:px-8 pt-24 pb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
              Nouveautés
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">
              La nouvelle saison
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-foreground hover:text-primary transition-colors border-b border-border hover:border-primary pb-1 self-start md:self-end"
            data-testid="link-shop-all"
          >
            Voir toute la boutique <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Featured Designers */}
      <section className="bg-muted py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
              Maisons à découvrir
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              Les créateurs en lumière
            </h2>
            <p className="text-muted-foreground font-light max-w-xl mx-auto">
              Trois maisons qui réinventent l'élégance algérienne, entre tradition
              et avant-garde.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-12">
            {featuredDesigners.map((d) => (
              <Link
                key={d.id}
                href={`/designers/${d.id}`}
                className="group"
                data-testid={`card-featured-designer-${d.id}`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-background mb-5">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {d.type} · {d.city}
                </p>
                <h3 className="font-serif text-2xl text-foreground mb-1 group-hover:text-primary transition-colors">
                  {d.name}
                </h3>
                <p className="text-sm font-light italic text-muted-foreground">
                  {d.specialty}
                </p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link
              href="/designers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background text-xs uppercase tracking-[0.3em] hover:bg-primary transition-colors"
              data-testid="link-all-designers"
            >
              Tous les créateurs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <FashionMap />
    </>
  );
}
