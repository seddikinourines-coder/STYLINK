import { Link } from "wouter";
import { Bookmark } from "lucide-react";
import B2BPage from "@/components/b2b/B2BPage";
import OpportunityCard from "@/components/b2b/OpportunityCard";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import { mockDesigners } from "@/data/mockData";

function authorName(
  authorId: string,
  currentBusinessId: string | null,
): string | undefined {
  if (currentBusinessId && authorId === currentBusinessId) return undefined;
  return mockDesigners.find((d) => d.id === authorId)?.name;
}

export default function B2BShortlist() {
  const { opportunities, shortlist, currentBusinessId } = useAppStore();
  const items = opportunities.filter((o) => shortlist.includes(o.id));

  return (
    <B2BPage>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2 font-medium">
            Sélection privée
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            Shortlist
          </h2>
          <p className="text-muted-foreground font-light mt-3 max-w-2xl">
            Les opportunités que vous avez mises de côté pour les explorer plus
            tard.
          </p>
        </header>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 py-16 text-center">
            <Bookmark
              className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40"
              strokeWidth={1}
            />
            <p className="font-serif text-xl text-foreground mb-2">
              Aucune opportunité shortlistée
            </p>
            <p className="text-sm text-muted-foreground font-light mb-6">
              Parcourez le feed et marquez les annonces qui vous intéressent.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/b2b/feed" data-testid="link-browse-feed">
                Explorer le feed
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden"
              >
                <OpportunityCard
                  opp={opp}
                  authorName={authorName(opp.authorId, currentBusinessId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </B2BPage>
  );
}
