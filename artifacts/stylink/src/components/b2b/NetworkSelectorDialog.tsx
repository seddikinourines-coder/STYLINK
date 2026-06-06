import { useMemo, useState } from "react";
import { Check, Plus, Search, UserPlus2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockDesigners, type DesignerType } from "@/data/mockData";

const FILTERS: { value: "all" | DesignerType; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "Designer", label: "Designers" },
  { value: "Atelier", label: "Ateliers" },
  { value: "Fournisseur", label: "Tissus" },
  { value: "Boutique", label: "Boutiques" },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

export interface NetworkSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing participant ids — these are shown but disabled with a "Déjà ajouté" state. */
  existingParticipantIds: string[];
  /** Called when the user clicks Add on a network entry. Must return whether the add succeeded. */
  onAdd: (designerId: string) => boolean;
}

export default function NetworkSelectorDialog({
  open,
  onOpenChange,
  existingParticipantIds,
  onAdd,
}: NetworkSelectorDialogProps) {
  const [filter, setFilter] = useState<"all" | DesignerType>("all");
  const [query, setQuery] = useState("");
  const [justAdded, setJustAdded] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockDesigners.filter((d) => {
      if (filter !== "all" && d.type !== filter) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const handleClose = (next: boolean) => {
    if (!next) {
      setJustAdded([]);
      setQuery("");
      setFilter("all");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl p-0 gap-0 overflow-hidden bg-white"
        data-testid="dialog-network-selector"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserPlus2 className="w-4.5 h-4.5" strokeWidth={1.5} />
            </div>
            <div>
              <DialogTitle className="font-serif text-xl text-foreground text-left">
                Ajouter un collaborateur
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-light text-left mt-1">
                Sélectionnez un membre de votre réseau à ajouter au projet.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par nom, ville, spécialité…"
              className="pl-9 rounded-full bg-muted border-transparent focus-visible:bg-background"
              data-testid="input-network-search"
            />
          </div>
        </div>

        {/* Filters */}
        <div
          className="px-6 pt-4 pb-3 flex flex-wrap gap-2 border-b border-black/5"
          role="tablist"
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={`text-[11px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-black/10 hover:border-foreground/40 hover:text-foreground"
                }`}
                data-testid={`filter-network-${f.value}`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground font-light">
              Aucun membre ne correspond à votre recherche.
            </div>
          ) : (
            <ul className="divide-y divide-black/5">
              {filtered.map((d) => {
                const already = existingParticipantIds.includes(d.id);
                const added = justAdded.includes(d.id);
                return (
                  <li
                    key={d.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors"
                    data-testid={`network-row-${d.id}`}
                  >
                    <Avatar className="h-10 w-10">
                      {d.image && <AvatarImage src={d.image} alt={d.name} />}
                      <AvatarFallback className="text-[11px] bg-primary/15">
                        {initials(d.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base text-foreground truncate">
                        {d.name}
                      </p>
                      <p className="text-xs text-muted-foreground font-light truncate">
                        {d.type} · {d.city}
                        {d.specialty ? ` · ${d.specialty}` : ""}
                      </p>
                    </div>
                    {already ? (
                      <span
                        className="text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                        data-testid={`network-already-${d.id}`}
                      >
                        Déjà ajouté
                      </span>
                    ) : added ? (
                      <span
                        className="text-[10px] uppercase tracking-[0.18em] font-medium text-primary inline-flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full"
                        data-testid={`network-added-${d.id}`}
                      >
                        <Check className="w-3 h-3" strokeWidth={2} />
                        Ajouté
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full gap-1.5 h-8 px-3"
                        onClick={() => {
                          if (onAdd(d.id)) {
                            setJustAdded((prev) => [...prev, d.id]);
                          }
                        }}
                        data-testid={`button-add-network-${d.id}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between bg-muted/40">
          <p className="text-xs text-muted-foreground font-light">
            {justAdded.length > 0
              ? `${justAdded.length} collaborateur${justAdded.length > 1 ? "s" : ""} ajouté${justAdded.length > 1 ? "s" : ""}`
              : "Cliquez sur Ajouter pour inclure un membre."}
          </p>
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => handleClose(false)}
            data-testid="button-network-done"
          >
            Terminé
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
