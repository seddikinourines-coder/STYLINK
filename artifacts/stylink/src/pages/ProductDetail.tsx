import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight, Ruler, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import { mockProducts, getDesignerById } from "@/data/mockData";
import MeasurementGuide from "@/components/MeasurementGuide";

const API = "/api";

interface ProductDetail {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  image_url: string | null;
  sizes: string | null;
  measurements: string | null;
  seller_name: string;
  seller_role: string | null;
  seller_city: string | null;
  seller_avatar: string | null;
}

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return [raw]; }
}

function parseSizes(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return raw.split(",").map(s => s.trim()).filter(Boolean); }
}

const SIZE_CHART = [
  { label: "XS", fr: "34", chest: "80", waist: "60", hips: "86" },
  { label: "S",  fr: "36", chest: "84", waist: "64", hips: "90" },
  { label: "M",  fr: "38", chest: "88", waist: "68", hips: "94" },
  { label: "L",  fr: "40", chest: "92", waist: "72", hips: "98" },
  { label: "XL", fr: "42", chest: "96", waist: "76", hips: "102" },
  { label: "XXL",fr: "44", chest: "100", waist: "80", hips: "106" },
  { label: "3XL",fr: "46", chest: "106", waist: "86", hips: "112" },
];

export default function ProductDetail() {
  const [, params] = useRoute<{ id: string }>("/products/:id");
  const [product, setProduct] = useState<ProductDetail | null | "loading">("loading");
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addToCart } = useAppStore();
  const { toast } = useToast();

  // Check mock data first (designer profile products have string IDs like "d1-p1")
  const mockProduct = params?.id ? mockProducts.find((p) => p.id === params.id) : null;
  const mockDesigner = mockProduct ? getDesignerById(mockProduct.designerId) : null;

  useEffect(() => {
    if (!params?.id || mockProduct) return; // skip API if found in mock
    fetch(`${API}/products/item/${params.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [params?.id]);

  // ── Mock product render ──
  if (mockProduct) {
    const handleMockAddToCart = () => {
      addToCart(mockProduct.id, 1);
      toast({ title: "Ajouté au panier", description: mockProduct.name });
    };
    return (
      <article className="min-h-screen pt-28 pb-24">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <Link
            href={mockDesigner ? `/designers/${mockDesigner.id}` : "/shop"}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/60 hover:text-primary mb-10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à la maison
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <img src={mockProduct.image} alt={mockProduct.name} className="w-full h-full object-cover" />
              {mockProduct.isNew && (
                <span className="absolute top-3 left-3 bg-background text-foreground text-[10px] font-sans uppercase tracking-[0.2em] px-3 py-1">
                  Nouveau
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              {mockDesigner && (
                <Link href={`/designers/${mockDesigner.id}`} className="flex items-center gap-3 mb-6 group w-fit">
                  <img src={mockDesigner.image} alt={mockDesigner.name} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary group-hover:underline">{mockDesigner.name}</p>
                    <p className="text-[10px] text-muted-foreground">{mockDesigner.city}</p>
                  </div>
                </Link>
              )}
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{mockProduct.category}</p>
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">{mockProduct.name}</h1>
              <p className="font-serif text-3xl text-foreground mb-6">
                {mockProduct.price.toLocaleString("fr-DZ")} <span className="text-xl text-muted-foreground">DZD</span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-light">{mockProduct.description}</p>
              <Button
                size="lg"
                onClick={handleMockAddToCart}
                className="w-full rounded-none text-xs uppercase tracking-[0.25em] h-14"
              >
                <ShoppingBag className="w-4 h-4 mr-3" />
                Ajouter au panier
              </Button>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center mt-4">
                Contactez le vendeur pour les détails de livraison
              </p>
            </div>
          </div>

          {/* Measurement guide */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-border" />
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-primary" />
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-sans whitespace-nowrap">Guide des tailles</p>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>
            <MeasurementGuide />
          </section>
        </div>
      </article>
    );
  }

  // ── API product render ──
  if (product === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-light">Chargement…</p>
      </div>
    );
  }
  if (!product) return <NotFound />;

  const images = parseImages(product.image_url);
  const sizes = parseSizes(product.sizes);
  const hasSizes = sizes.length > 0;

  const prev = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveImg((i) => (i + 1) % images.length);

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      toast({ title: "Choisissez une taille", description: "Veuillez sélectionner une taille avant d'ajouter au panier.", variant: "destructive" });
      return;
    }
    addToCart(`up-${product.id}`, 1);
    toast({ title: "Ajouté au panier", description: `${product.name}${selectedSize ? ` — Taille ${selectedSize}` : ""}` });
  };

  return (
    <article className="min-h-screen pt-28 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">

        {/* Back */}
        <Link
          href={`/boutiques/${product.user_id}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/60 hover:text-primary mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la boutique
        </Link>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">

          {/* ── Image gallery ── */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              {images.length > 0 ? (
                <>
                  <img
                    key={activeImg}
                    src={images[activeImg]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={next}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImg(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImg ? "bg-foreground" : "bg-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/20" strokeWidth={1} />
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-20 h-20 overflow-hidden border-2 transition-colors ${i === activeImg ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ── */}
          <div className="flex flex-col">

            {/* Seller */}
            <Link href={`/boutiques/${product.user_id}`} className="flex items-center gap-3 mb-6 group w-fit">
              {product.seller_avatar ? (
                <img src={product.seller_avatar} alt={product.seller_name} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <span className="font-serif text-base text-muted-foreground">{product.seller_name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary group-hover:underline">{product.seller_name}</p>
                {product.seller_city && <p className="text-[10px] text-muted-foreground">{product.seller_city}</p>}
              </div>
            </Link>

            {product.category && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">{product.category}</p>
            )}
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">{product.name}</h1>
            <p className="font-serif text-3xl text-foreground mb-6">
              {Number(product.price).toLocaleString("fr-DZ")} <span className="text-xl text-muted-foreground">DZD</span>
            </p>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-8 font-light">{product.description}</p>
            )}

            {/* Size selector */}
            {hasSizes && (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.2em] text-foreground mb-3">
                  Taille {selectedSize && <span className="text-primary">— {selectedSize}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                      className={`w-12 h-12 text-sm font-sans border transition-colors ${
                        selectedSize === s
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Measurements note */}
            {product.measurements && (
              <div className="mb-8 p-4 bg-muted/50 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Mensurations spécifiques</p>
                </div>
                <p className="text-sm text-foreground font-light">{product.measurements}</p>
              </div>
            )}

            {/* Add to cart */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full rounded-none text-xs uppercase tracking-[0.25em] h-14"
            >
              <ShoppingBag className="w-4 h-4 mr-3" />
              Ajouter au panier
            </Button>

            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center mt-4">
              Contactez le vendeur pour les détails de livraison
            </p>
          </div>
        </div>

        {/* ── Size chart ── */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-border" />
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary font-sans whitespace-nowrap">
                Guide des tailles
              </p>
            </div>
            <div className="flex-1 h-px bg-border" />
          </div>
          <MeasurementGuide />
        </section>

      </div>
    </article>
  );
}
