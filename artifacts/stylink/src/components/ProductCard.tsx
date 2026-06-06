import { Link } from "wouter";
import { Heart } from "lucide-react";
import { Product, getDesignerById } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/contexts/AppStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const { isFavorite, toggleFavorite, addToCart } = useAppStore();
  const designer = getDesignerById(product.designerId);
  const wished = isFavorite("wishlist", product.id);

  return (
    <div
      className="group relative flex flex-col"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted mb-4">
        <Link href={`/products/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-background text-foreground text-[10px] font-sans uppercase tracking-[0.2em] px-3 py-1">
            Nouveau
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite("wishlist", product.id);
            toast({
              title: wished ? "Retiré de la wishlist" : "Ajouté à la wishlist",
              description: product.name,
            });
          }}
          className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          data-testid={`button-wishlist-${product.id}`}
          aria-label={wished ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
        >
          <Heart
            className={`w-4 h-4 ${wished ? "fill-primary text-primary" : "text-foreground"}`}
            strokeWidth={1.5}
          />
        </button>
        <button
          onClick={() => {
            addToCart(product.id);
            toast({
              title: "Ajouté au panier",
              description: product.name,
            });
          }}
          className="absolute bottom-0 left-0 right-0 bg-foreground text-background py-3 text-xs uppercase tracking-[0.25em] font-sans translate-y-full group-hover:translate-y-0 transition-transform duration-500"
          data-testid={`button-shop-${product.id}`}
        >
          Shop
        </button>
      </div>
      {designer && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">
          {designer.name}
        </p>
      )}
      <Link href={`/products/${product.id}`}>
        <h3
          className="font-serif text-lg text-foreground mb-1 leading-tight hover:underline cursor-pointer"
          data-testid={`text-product-name-${product.id}`}
        >
          {product.name}
        </h3>
      </Link>
      <p
        className="text-sm text-muted-foreground font-sans"
        data-testid={`text-product-price-${product.id}`}
      >
        {product.price.toLocaleString("fr-DZ")} DA
      </p>
    </div>
  );
}
