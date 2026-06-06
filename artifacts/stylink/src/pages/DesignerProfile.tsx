import { Link, useRoute } from "wouter";
import { Star, ArrowLeft, MessageCircle } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { getDesignerById, getProductsByDesigner } from "@/data/mockData";
import NotFound from "@/pages/not-found";

export default function DesignerProfile() {
  const [, params] = useRoute<{ id: string }>("/designers/:id");
  const designer = params ? getDesignerById(params.id) : undefined;

  if (!designer) return <NotFound />;

  const products = getProductsByDesigner(designer.id);

  const backTarget =
    designer.type === "Boutique"
      ? { href: "/boutiques", label: "Toutes les boutiques" }
      : designer.type === "Atelier"
        ? { href: "/ateliers", label: "Tous les ateliers" }
        : designer.type === "Fournisseur"
          ? { href: "/fabric-retailers", label: "Tous les fournisseurs" }
          : { href: "/designers", label: "Tous les designers" };

  return (
    <article>
      {/* Hero — split editorial layout, image kept at natural framing */}
      <section className="relative bg-muted">
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
          <div className="md:col-span-5 lg:col-span-5 relative aspect-[3/4] md:aspect-auto overflow-hidden">
            <img
              src={designer.image}
              alt={designer.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-end px-6 md:px-12 lg:px-16 py-12 md:py-16">
          <Link
            href={backTarget.href}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/80 hover:text-primary mb-6 self-start"
            data-testid="link-back"
          >
            <ArrowLeft className="w-4 h-4" /> {backTarget.label}
          </Link>
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
            {designer.type} · {designer.city}
          </p>
          <h1
            className="font-serif text-5xl md:text-7xl text-foreground mb-4"
            data-testid="text-designer-name"
          >
            {designer.name}
          </h1>
          <p className="font-serif italic text-2xl text-muted-foreground">
            {designer.specialty}
          </p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="container mx-auto px-4 md:px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-border">
        <div className="md:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-4">
            La Maison
          </p>
          <p className="font-serif text-2xl md:text-3xl text-foreground leading-relaxed">
            {designer.bio}
          </p>
        </div>
        <aside className="space-y-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Fondée en
            </p>
            <p className="font-serif text-2xl">{designer.founded}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Atelier
            </p>
            <p className="font-serif text-2xl">{designer.city}, Algérie</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Note
            </p>
            <div className="flex items-center gap-2 font-serif text-2xl">
              <Star className="w-5 h-5 fill-primary text-primary" />
              <span data-testid="text-designer-rating">
                {designer.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-foreground text-background text-xs uppercase tracking-[0.2em] hover:bg-primary transition-colors"
            data-testid="button-contact-designer"
          >
            <MessageCircle className="w-4 h-4" /> Contacter
          </Link>
        </aside>
      </section>

      {/* Collection */}
      <section className="container mx-auto px-4 md:px-8 py-20">
        <header className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
            La Collection
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            Pièces de la maison
          </h2>
        </header>

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground font-light py-16">
            Aucune pièce disponible pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
