import { useMemo } from "react";
import { useLocation } from "wouter";
import { MessageCircle, UserCheck, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import {
  getDesignerById,
  type Opportunity,
} from "@/data/mockData";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export default function ApplicantsSheet({
  open,
  onOpenChange,
  opportunity,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunity: Opportunity;
}) {
  const { getApplicantIds } = useAppStore();
  const [, navigate] = useLocation();

  const applicantIds = useMemo(
    () => getApplicantIds(opportunity.id),
    [getApplicantIds, opportunity.id],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
        data-testid="sheet-applicants"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="font-serif text-2xl flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
            Candidats
          </SheetTitle>
          <SheetDescription className="text-sm font-light">
            Personnes ayant postulé à{" "}
            <span className="text-foreground">« {opportunity.title} »</span>.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {applicantIds.length === 0 ? (
            <div
              className="rounded-xl border border-dashed border-black/10 p-8 text-center"
              data-testid="text-no-applicants"
            >
              <UserCheck
                className="w-6 h-6 mx-auto text-muted-foreground mb-3"
                strokeWidth={1.25}
              />
              <p className="font-serif text-base text-foreground mb-1">
                Aucune candidature
              </p>
              <p className="text-sm text-muted-foreground font-light">
                Vous serez notifié(e) dès qu'un partenaire postulera.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {applicantIds.map((id) => {
                const designer = getDesignerById(id);
                const displayName = designer?.name ?? id;
                const subtitle = designer
                  ? `${designer.type} · ${designer.specialty} · ${designer.city}`
                  : "Compte business";
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-black/5 bg-white"
                    data-testid={`applicant-${id}`}
                  >
                    <Avatar className="h-12 w-12 shrink-0">
                      {designer && (
                        <AvatarImage src={designer.image} alt={displayName} />
                      )}
                      <AvatarFallback className="text-xs bg-primary/15">
                        {initials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-base text-foreground truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground font-light truncate">
                        {subtitle}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigate(
                          `/b2b/messages?with=${encodeURIComponent(id)}&context=opportunity&opp=${encodeURIComponent(opportunity.id)}`,
                        );
                        onOpenChange(false);
                      }}
                      className="rounded-full text-xs gap-1.5"
                      data-testid={`button-message-applicant-${id}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Message
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
