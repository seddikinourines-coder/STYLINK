import { useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import B2BPage from "@/components/b2b/B2BPage";
import ConnectDialog from "@/components/b2b/ConnectDialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import {
  mockDesigners,
  opportunityRoleLabels,
  opportunityTypeLabels,
} from "@/data/mockData";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("fr-DZ").format(n) + " DA";

function authorName(authorId: string, currentBusinessId: string | null): string {
  if (currentBusinessId && authorId === currentBusinessId) return "Vous";
  return mockDesigners.find((d) => d.id === authorId)?.name ?? authorId;
}

function authorCity(
  authorId: string,
  currentBusinessId: string | null,
): string | undefined {
  if (currentBusinessId && authorId === currentBusinessId) return undefined;
  return mockDesigners.find((d) => d.id === authorId)?.city;
}

export default function B2BOpportunityDetail() {
  const [, params] = useRoute("/b2b/feed/:id");
  const {
    opportunities,
    user,
    toggleShortlist,
    isShortlisted,
    closeOpportunity,
    currentBusinessId,
  } = useAppStore();
  const [connectOpen, setConnectOpen] = useState(false);

  const opp = opportunities.find((o) => o.id === params?.id);

  if (!opp) {
    return (
      <B2BPage>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-black/5 p-12 text-center">
          <h2 className="font-serif text-2xl text-foreground mb-3">
            Opportunité introuvable
          </h2>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/b2b/feed">Retour au feed</Link>
          </Button>
        </div>
      </B2BPage>
    );
  }

  const isOwn =
    currentBusinessId !== null && opp.authorId === currentBusinessId;
  const saved = isShortlisted(opp.id);
  const author = authorName(opp.authorId, currentBusinessId);
  const city = authorCity(opp.authorId, currentBusinessId);

  return (
    <B2BPage>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back */}
        <Link
          href="/b2b/feed"
          data-testid="link-back-feed"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3 h-3" /> Retour au feed
        </Link>

        {/* Cover + meta card */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="aspect-[5/4] overflow-hidden bg-muted">
              <img
                src={opp.coverImage}
                alt={opp.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-medium">
                  {opportunityTypeLabels[opp.type]}
                </p>
                {opp.status === "closed" && (
                  <span
                    className="text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 bg-foreground text-background rounded-full"
                    data-testid="badge-closed"
                  >
                    Clôturée
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground leading-tight mb-4">
                {opp.title}
              </h1>
              <p className="text-sm text-muted-foreground font-light tracking-[0.1em] uppercase mb-6">
                {opportunityRoleLabels[opp.authorRole]} · {author}
                {city && <span className="ml-2">· {city}</span>}
              </p>

              <p className="text-base text-foreground font-light leading-relaxed mb-6">
                {opp.description}
              </p>

              {/* Meta grid */}
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 border-y border-black/5 py-6">
                {(opp.budgetMin || opp.budgetMax) && (
                  <MetaCell label="Budget">
                    {opp.budgetMin && opp.budgetMax
                      ? `${fmtPrice(opp.budgetMin)} – ${fmtPrice(opp.budgetMax)}`
                      : opp.budgetMin
                        ? `Dès ${fmtPrice(opp.budgetMin)}`
                        : `Jusqu'à ${fmtPrice(opp.budgetMax!)}`}
                  </MetaCell>
                )}
                {opp.quantity && (
                  <MetaCell label="Quantité">{opp.quantity} pièces</MetaCell>
                )}
                {opp.timeline && (
                  <MetaCell label="Échéance">{opp.timeline}</MetaCell>
                )}
                <MetaCell label="Publiée le">{opp.createdAt}</MetaCell>
              </dl>

              {/* Tags */}
              {opp.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {opp.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 bg-[#F5F3EE] text-foreground rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto flex flex-wrap gap-3">
                {opp.status === "open" && !isOwn && (
                  <Button
                    onClick={() => setConnectOpen(true)}
                    className="gap-2 flex-1 rounded-full"
                    data-testid="button-connect"
                    disabled={!user || user.type !== "business"}
                  >
                    <Sparkles className="w-4 h-4" /> Connect
                  </Button>
                )}
                {!isOwn && (
                  <Button
                    variant="outline"
                    onClick={() => toggleShortlist(opp.id)}
                    className="gap-2 rounded-full"
                    data-testid="button-shortlist-detail"
                  >
                    {saved ? (
                      <>
                        <BookmarkCheck className="w-4 h-4" /> Shortlistée
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4" /> Shortlist
                      </>
                    )}
                  </Button>
                )}
                {!isOwn && (
                  <Button variant="outline" asChild className="gap-2 rounded-full">
                    <Link
                      href={`/b2b/messages?with=${encodeURIComponent(opp.authorId)}&context=opportunity&opp=${encodeURIComponent(opp.id)}`}
                      data-testid="link-message-author"
                    >
                      <MessageCircle className="w-4 h-4" /> Message
                    </Link>
                  </Button>
                )}
                {isOwn && opp.status === "open" && (
                  <Button
                    variant="outline"
                    onClick={() => closeOpportunity(opp.id)}
                    className="gap-2 rounded-full"
                    data-testid="button-close-opportunity"
                  >
                    <X className="w-4 h-4" /> Clôturer
                  </Button>
                )}
                {isOwn && opp.status === "closed" && (
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground self-center">
                    Cette opportunité a été clôturée.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConnectDialog
        opportunity={opp}
        open={connectOpen}
        onOpenChange={setConnectOpen}
      />
    </B2BPage>
  );
}

function MetaCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-1 font-medium">
        {label}
      </dt>
      <dd className="font-serif text-base text-foreground">{children}</dd>
    </div>
  );
}
