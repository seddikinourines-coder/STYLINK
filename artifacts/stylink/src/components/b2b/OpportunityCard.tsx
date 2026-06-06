import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Clock,
  MessageCircle,
  UserCheck,
  Users,
} from "lucide-react";
import {
  opportunityRoleLabels,
  opportunityTypeLabels,
  type Opportunity,
} from "@/data/mockData";
import { useAppStore } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ApplicantsSheet from "@/components/b2b/ApplicantsSheet";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("fr-DZ").format(n) + " DA";

type Urgency = {
  level: "urgent" | "soon" | "normal" | "passed";
  label: string;
  daysLeft: number;
};

function getUrgency(deadlineIso: string): Urgency {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadlineIso);
  dl.setHours(0, 0, 0, 0);
  const diffMs = dl.getTime() - today.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return { level: "passed", label: "Échue", daysLeft: days };
  if (days === 0) return { level: "urgent", label: "Dernier jour", daysLeft: 0 };
  if (days <= 7)
    return {
      level: "urgent",
      label: `Urgent · J-${days}`,
      daysLeft: days,
    };
  if (days <= 30)
    return {
      level: "soon",
      label: `Bientôt · J-${days}`,
      daysLeft: days,
    };
  return {
    level: "normal",
    label: `J-${days}`,
    daysLeft: days,
  };
}

function fmtDeadline(deadlineIso: string) {
  try {
    return new Date(deadlineIso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return deadlineIso;
  }
}

const urgencyClasses: Record<Urgency["level"], string> = {
  urgent:
    "bg-red-50 text-red-700 border-red-200",
  soon: "bg-amber-50 text-amber-700 border-amber-200",
  normal: "bg-emerald-50 text-emerald-700 border-emerald-200",
  passed: "bg-muted text-muted-foreground border-black/10",
};

export default function OpportunityCard({
  opp,
  authorName,
}: {
  opp: Opportunity;
  authorName?: string;
}) {
  const {
    toggleShortlist,
    isShortlisted,
    currentBusinessId,
    user,
    applyToOpportunity,
    hasApplied,
    getApplicantIds,
    pushNotification,
    hasApplicationAccepted,
  } = useAppStore();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [applicantsOpen, setApplicantsOpen] = useState(false);

  const saved = isShortlisted(opp.id);
  const isOwn =
    currentBusinessId !== null && opp.authorId === currentBusinessId;
  const displayAuthor = authorName ?? (isOwn ? "Vous" : opp.authorId);
  const isBusiness = user?.type === "business";
  const applied = hasApplied(opp.id);
  const applicationAccepted = hasApplicationAccepted(opp.id);
  const applicantCount = getApplicantIds(opp.id).length;

  const urgency = opp.deadline ? getUrgency(opp.deadline) : null;

  function handleApply() {
    if (!isBusiness) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous avec un compte business pour postuler.",
        variant: "destructive",
      });
      return;
    }
    const result = applyToOpportunity(opp.id);
    if (!result) {
      toast({
        title: "Candidature impossible",
        description: applied
          ? "Vous avez déjà postulé à cette opportunité."
          : "Vous ne pouvez pas postuler à cette opportunité.",
        variant: "destructive",
      });
      return;
    }
    pushNotification({
      kind: "application",
      title: "Nouvelle candidature",
      description: `Un profil a postulé à votre opportunité « ${opp.title} ».`,
      applicationStatus: "pending",
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      applicantId: currentBusinessId ?? undefined,
      ownerId: opp.authorId,
    });
    toast({
      title: "Candidature envoyée",
      description: `Votre candidature a bien été transmise pour « ${opp.title} ».`,
    });
  }

  function handleMessage() {
    navigate(
      `/b2b/messages?with=${encodeURIComponent(opp.authorId)}&context=opportunity&opp=${encodeURIComponent(opp.id)}`,
    );
  }

  return (
    <article
      className="group bg-background border border-border hover:border-primary/40 transition-colors flex flex-col"
      data-testid={`opportunity-card-${opp.id}`}
    >
      {/* Cover */}
      <Link
        href={`/b2b/feed/${opp.id}`}
        className="block aspect-[5/3] overflow-hidden bg-muted relative"
      >
        <img
          src={opp.coverImage}
          alt={opp.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur px-3 py-1.5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-foreground">
            {opportunityTypeLabels[opp.type]}
          </p>
        </div>
        {urgency && opp.status === "open" && (
          <div
            className={`absolute top-3 right-3 inline-flex items-center gap-1 border px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] font-medium backdrop-blur ${urgencyClasses[urgency.level]}`}
            data-testid={`badge-urgency-${opp.id}`}
          >
            <Clock className="w-3 h-3" strokeWidth={2} />
            {urgency.label}
          </div>
        )}
        {opp.status === "closed" && (
          <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
            <span className="bg-background px-4 py-2 text-[11px] uppercase tracking-[0.3em]">
              Clôturée
            </span>
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {opportunityRoleLabels[opp.authorRole]} · {displayAuthor}
          </p>
          <button
            onClick={() => toggleShortlist(opp.id)}
            data-testid={`button-shortlist-${opp.id}`}
            aria-label={saved ? "Retirer de la shortlist" : "Ajouter à la shortlist"}
            className={`transition-colors ${
              saved
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4" strokeWidth={1.5} />
            ) : (
              <Bookmark className="w-4 h-4" strokeWidth={1.5} />
            )}
          </button>
        </div>

        <Link href={`/b2b/feed/${opp.id}`} className="block mb-3">
          <h3 className="font-serif text-xl text-foreground leading-snug group-hover:text-primary transition-colors">
            {opp.title}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground font-light leading-relaxed line-clamp-3 mb-4">
          {opp.description}
        </p>

        {/* Meta strip */}
        <div className="mt-auto pt-4 border-t border-border space-y-2">
          {(opp.budgetMin || opp.budgetMax) && (
            <MetaLine label="Budget">
              {opp.budgetMin && opp.budgetMax
                ? `${fmtPrice(opp.budgetMin)} – ${fmtPrice(opp.budgetMax)}`
                : opp.budgetMin
                  ? `Dès ${fmtPrice(opp.budgetMin)}`
                  : `Jusqu'à ${fmtPrice(opp.budgetMax!)}`}
            </MetaLine>
          )}
          {opp.quantity && (
            <MetaLine label="Quantité">{opp.quantity} pièces</MetaLine>
          )}
          {opp.deadline ? (
            <MetaLine label="Deadline">{fmtDeadline(opp.deadline)}</MetaLine>
          ) : (
            opp.timeline && <MetaLine label="Échéance">{opp.timeline}</MetaLine>
          )}
        </div>

        {/* Tags */}
        {opp.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {opp.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[10px] uppercase tracking-[0.15em] px-2 py-1 bg-muted text-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {opp.status === "open" && (
          <div className="mt-5 pt-4 border-t border-border">
            {isOwn ? (
              <button
                onClick={() => setApplicantsOpen(true)}
                className="w-full flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-full border border-black/10 hover:border-foreground/30"
                data-testid={`button-view-applicants-${opp.id}`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  Candidats
                </span>
                <span className="font-medium text-foreground">
                  {applicantCount}
                </span>
              </button>
            ) : applied ? (
              <div className="space-y-2">
                {applicationAccepted ? (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-1.5">
                      <Check className="w-3 h-3" />
                      Candidature acceptée
                    </p>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleMessage}
                      data-testid={`button-open-chat-${opp.id}`}
                      className="w-full rounded-full text-xs gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Ouvrir le chat
                    </Button>
                  </>
                ) : (
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                    <Check className="w-3 h-3" />
                    En attente de réponse
                  </p>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={handleApply}
                data-testid={`button-apply-${opp.id}`}
                className="w-full rounded-full text-xs gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Postuler
              </Button>
            )}
          </div>
        )}
      </div>

      {isOwn && (
        <ApplicantsSheet
          open={applicantsOpen}
          onOpenChange={setApplicantsOpen}
          opportunity={opp}
        />
      )}
    </article>
  );
}

function MetaLine({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="uppercase tracking-[0.2em] text-muted-foreground text-[10px]">
        {label}
      </span>
      <span className="text-foreground font-light text-right">{children}</span>
    </div>
  );
}
