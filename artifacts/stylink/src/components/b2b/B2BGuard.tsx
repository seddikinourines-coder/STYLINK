import { Link } from "wouter";
import { Package } from "lucide-react";
import type { ReactNode } from "react";
import { useAppStore } from "@/contexts/AppStore";
import { Button } from "@/components/ui/button";

export function B2BGuard({ children }: { children: ReactNode }) {
  const { user } = useAppStore();
  if (!user || user.type !== "business") {
    return (
      <section className="container mx-auto px-4 md:px-8 py-32 text-center max-w-xl">
        <Package
          className="w-16 h-16 mx-auto mb-8 text-muted-foreground/40"
          strokeWidth={1}
        />
        <h1 className="font-serif text-4xl text-foreground mb-4">
          Espace réservé aux professionnels
        </h1>
        <p className="text-muted-foreground font-light mb-10">
          Cet espace est exclusivement accessible aux comptes business —
          designers, ateliers, boutiques et fournisseurs de tissus.
        </p>
        <Button asChild>
          <Link href="/" data-testid="link-b2b-home">
            Retour à l'accueil
          </Link>
        </Button>
      </section>
    );
  }
  return <>{children}</>;
}

export default B2BGuard;
