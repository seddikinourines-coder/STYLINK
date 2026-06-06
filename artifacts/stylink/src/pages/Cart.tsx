import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Minus, Plus, X, Package } from "lucide-react";
import { useAppStore } from "@/contexts/AppStore";
import { mockProducts, getDesignerById } from "@/data/mockData";
import { Button } from "@/components/ui/button";

const API = "/api";

interface UserProduct {
  id: number;
  name: string;
  price: string;
  category: string | null;
  image_url: string | null;
  seller_name: string;
  user_id: number;
}

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return [raw]; }
}

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart } = useAppStore();
  const [, navigate] = useLocation();
  const [userProducts, setUserProducts] = useState<Record<string, UserProduct>>({});

  const upIds = cart
    .map((c) => c.productId)
    .filter((id) => id.startsWith("up-"))
    .map((id) => id.replace("up-", ""));

  useEffect(() => {
    if (upIds.length === 0) return;
    const missing = upIds.filter((id) => !userProducts[id]);
    if (missing.length === 0) return;
    Promise.all(
      missing.map((id) =>
        fetch(`${API}/products/item/${id}`)
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then((results) => {
      const map: Record<string, UserProduct> = {};
      results.forEach((p) => { if (p) map[String(p.id)] = p; });
      setUserProducts((prev) => ({ ...prev, ...map }));
    });
  }, [cart.length]);

  const lines = cart.map((c) => {
    if (c.productId.startsWith("up-")) {
      const rawId = c.productId.replace("up-", "");
      const p = userProducts[rawId];
      if (!p) return null;
      const images = parseImages(p.image_url);
      return {
        productId: c.productId,
        qty: c.qty,
        kind: "user" as const,
        name: p.name,
        price: Number(p.price),
        category: p.category ?? "",
        image: images[0] ?? null,
        sellerName: p.seller_name,
        sellerId: p.user_id,
      };
    } else {
      const p = mockProducts.find((mp) => mp.id === c.productId);
      if (!p) return null;
      const designer = getDesignerById(p.designerId);
      return {
        productId: c.productId,
        qty: c.qty,
        kind: "mock" as const,
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.image,
        sellerName: designer?.name ?? "",
        sellerId: null,
      };
    }
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const pendingCount = upIds.filter((id) => !userProducts[id]).length;

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  if (lines.length === 0 && pendingCount === 0) {
    return (
      <section className="container mx-auto px-4 md:px-8 py-32 text-center max-w-xl">
        <ShoppingBag
          className="w-16 h-16 mx-auto mb-8 text-muted-foreground/40"
          strokeWidth={1}
        />
        <h1 className="font-serif text-4xl text-foreground mb-4">
          Votre panier est vide
        </h1>
        <p className="text-muted-foreground font-light mb-10">
          Découvrez nos pièces d'exception et ajoutez vos coups de cœur.
        </p>
        <Button asChild>
          <Link href="/shop" data-testid="link-cart-shop">
            Explorer la Boutique
          </Link>
        </Button>
      </section>
    );
  }

  if (pendingCount > 0 && lines.length === 0) {
    return (
      <section className="container mx-auto px-4 md:px-8 py-32 text-center max-w-xl">
        <p className="text-muted-foreground font-light">Chargement du panier…</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 md:px-8 py-20 max-w-5xl">
      <header className="text-center mb-12">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          Mon Panier
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4">
          Shopping Bag
        </h1>
      </header>

      <div className="border-y border-border divide-y divide-border">
        {lines.map((line) => (
          <div
            key={line.productId}
            className="flex gap-6 py-6"
            data-testid={`cart-line-${line.productId}`}
          >
            <div className="w-28 h-36 bg-muted overflow-hidden flex-shrink-0">
              {line.image ? (
                <img
                  src={line.image}
                  alt={line.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground/20" strokeWidth={1} />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              {line.sellerName && (
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {line.sellerName}
                </p>
              )}
              <h3 className="font-serif text-xl text-foreground mb-1">
                {line.name}
              </h3>
              <p className="text-sm text-muted-foreground font-light italic mb-auto">
                {line.category}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => updateQty(line.productId, line.qty - 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                    data-testid={`button-decrease-${line.productId}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-10 text-center text-sm">{line.qty}</span>
                  <button
                    onClick={() => updateQty(line.productId, line.qty + 1)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-muted transition-colors"
                    data-testid={`button-increase-${line.productId}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(line.productId)}
                  className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  data-testid={`button-remove-${line.productId}`}
                >
                  <X className="w-3 h-3" /> Retirer
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-serif text-lg text-foreground">
                {(line.price * line.qty).toLocaleString("fr-DZ")} DA
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-end mt-10 gap-4">
        <div className="flex items-baseline gap-6">
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Total
          </span>
          <span className="font-serif text-3xl text-foreground">
            {total.toLocaleString("fr-DZ")} DA
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={clearCart}
            data-testid="button-clear-cart"
          >
            Vider le panier
          </Button>
          <Button
            onClick={() => navigate("/checkout")}
            data-testid="button-checkout"
          >
            Passer Commande
          </Button>
        </div>
      </div>
    </section>
  );
}
