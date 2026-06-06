import { useState } from "react";
import { Check, Inbox, X } from "lucide-react";
import B2BPage from "@/components/b2b/B2BPage";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import {
  mockDesigners,
  requestTypeLabels,
  type RequestStatus,
} from "@/data/mockData";

function nameOf(id: string): string {
  return mockDesigners.find((d) => d.id === id)?.name ?? id;
}

const statusLabels: Record<RequestStatus, string> = {
  open: "En attente",
  accepted: "Acceptée",
  declined: "Refusée",
  completed: "Terminée",
};

const statusPalette: Record<RequestStatus, string> = {
  open: "bg-muted text-foreground border-black/10",
  accepted: "bg-primary/15 text-primary border-primary/30",
  declined: "bg-destructive/10 text-destructive border-destructive/30",
  completed: "bg-foreground text-background border-foreground",
};

export default function B2BRequests() {
  const { requests, setRequestStatus } = useAppStore();
  const [filter, setFilter] = useState<RequestStatus | "all">("all");

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <B2BPage>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2 font-medium">
            Boîte de réception
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            Demandes
          </h2>
          <p className="text-muted-foreground font-light mt-3 max-w-2xl">
            Devis, propositions de collaboration, demandes de tissus et de
            production reçues de vos partenaires.
          </p>
        </header>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "open", "accepted", "declined", "completed"] as const).map(
            (s) => {
              const active = filter === s;
              const count =
                s === "all"
                  ? requests.length
                  : requests.filter((r) => r.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  data-testid={`tab-req-${s}`}
                  className={`text-xs px-4 py-2 rounded-full border transition-colors font-medium ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-white text-foreground border-black/10 hover:border-foreground/40"
                  }`}
                >
                  {s === "all" ? "Toutes" : statusLabels[s]}
                  <span
                    className={`ml-2 ${active ? "opacity-70" : "text-muted-foreground"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            },
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 py-16 text-center">
            <Inbox
              className="w-10 h-10 mx-auto mb-4 text-muted-foreground/40"
              strokeWidth={1}
            />
            <p className="font-serif text-xl text-foreground mb-1">
              Aucune demande
            </p>
            <p className="text-sm text-muted-foreground font-light">
              Aucune demande ne correspond à ce filtre.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filtered.map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:border-primary/30 transition-colors"
                data-testid={`card-request-${r.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-primary font-medium">
                    {requestTypeLabels[r.type]}
                  </p>
                  <span
                    className={`text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 border rounded-full ${statusPalette[r.status]}`}
                  >
                    {statusLabels[r.status]}
                  </span>
                </div>

                <h3 className="font-serif text-xl text-foreground mb-3 leading-snug">
                  {r.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">
                  {r.message}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-black/5 pt-4">
                  <span className="tracking-[0.1em]">
                    {nameOf(r.fromId)} → {nameOf(r.toId)}
                  </span>
                  <span>{r.createdAt}</span>
                </div>

                {r.status === "open" && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => setRequestStatus(r.id, "accepted")}
                      data-testid={`button-accept-${r.id}`}
                      className="gap-1.5 flex-1 rounded-full"
                    >
                      <Check className="w-3.5 h-3.5" /> Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRequestStatus(r.id, "declined")}
                      data-testid={`button-decline-${r.id}`}
                      className="gap-1.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" /> Refuser
                    </Button>
                  </div>
                )}
                {r.status === "accepted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-4 gap-1.5 rounded-full"
                    onClick={() => setRequestStatus(r.id, "completed")}
                    data-testid={`button-complete-${r.id}`}
                  >
                    Marquer comme terminée
                  </Button>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </B2BPage>
  );
}
