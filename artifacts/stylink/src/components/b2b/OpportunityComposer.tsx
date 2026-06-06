import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, type BusinessRole } from "@/contexts/AppStore";
import {
  opportunityTypeLabels,
  type OpportunityType,
} from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const allowedTypesForRole: Record<BusinessRole, OpportunityType[]> = {
  designer: [
    "designer-seeks-atelier",
    "designer-seeks-fabric",
    "designer-collaboration",
  ],
  atelier: ["atelier-capacity", "atelier-specialty"],
  boutique: ["boutique-seeks-collection", "boutique-private-label"],
  "fabric-retailer": ["fabric-new-stock", "fabric-exclusive"],
};

const defaultCovers: Record<OpportunityType, string> = {
  "designer-seeks-atelier":
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200",
  "designer-seeks-fabric":
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200",
  "designer-collaboration":
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200",
  "atelier-capacity":
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
  "atelier-specialty":
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200",
  "boutique-seeks-collection":
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200",
  "boutique-private-label":
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200",
  "fabric-new-stock":
    "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200",
  "fabric-exclusive":
    "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=1200",
};

export default function OpportunityComposer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user, createOpportunity } = useAppStore();
  const { toast } = useToast();

  const allowed = useMemo<OpportunityType[]>(() => {
    if (!user || user.type !== "business") return [];
    return allowedTypesForRole[user.role];
  }, [user]);

  const [type, setType] = useState<OpportunityType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [quantity, setQuantity] = useState("");
  const [timeline, setTimeline] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverImage, setCoverImage] = useState("");

  function reset() {
    setType("");
    setTitle("");
    setDescription("");
    setBudgetMin("");
    setBudgetMax("");
    setQuantity("");
    setTimeline("");
    setDeadline("");
    setTagsInput("");
    setCoverImage("");
  }

  function submit() {
    if (!type || !title.trim() || !description.trim()) {
      toast({
        title: "Champs requis manquants",
        description: "Le type, le titre et la description sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const opp = createOpportunity({
      type,
      title: title.trim(),
      description: description.trim(),
      coverImage: coverImage.trim() || defaultCovers[type],
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      quantity: quantity ? Number(quantity) : undefined,
      timeline: timeline.trim() || undefined,
      deadline: deadline || undefined,
      tags,
    });
    if (opp) {
      toast({
        title: "Opportunité publiée",
        description: "Votre annonce est maintenant visible dans le feed.",
      });
      reset();
      onOpenChange(false);
    }
  }

  if (!user || user.type !== "business") return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-testid="dialog-composer"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">
            Publier une opportunité
          </DialogTitle>
          <DialogDescription>
            Partagez ce dont vous avez besoin ou ce que vous proposez. Les
            partenaires de la plateforme pourront se connecter à vous.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <Field label="Type d'opportunité" required>
            <Select
              value={type}
              onValueChange={(v) => setType(v as OpportunityType)}
            >
              <SelectTrigger data-testid="select-opp-type">
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                {allowed.map((t) => (
                  <SelectItem key={t} value={t} data-testid={`option-type-${t}`}>
                    {opportunityTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Titre" required>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Recherche atelier broderie main pour capsule mariée"
              data-testid="input-opp-title"
            />
          </Field>

          <Field label="Description" required>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Décrivez votre besoin, votre savoir-faire, ou ce que vous proposez."
              data-testid="textarea-opp-description"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget min (DA)">
              <Input
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                placeholder="200000"
                data-testid="input-opp-budget-min"
              />
            </Field>
            <Field label="Budget max (DA)">
              <Input
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                placeholder="500000"
                data-testid="input-opp-budget-max"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantité (pièces)">
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="20"
                data-testid="input-opp-quantity"
              />
            </Field>
            <Field label="Échéance">
              <Input
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="Ex : Mai → Juillet 2026"
                data-testid="input-opp-timeline"
              />
            </Field>
          </div>

          <Field label="Date limite (deadline)">
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              data-testid="input-opp-deadline"
            />
          </Field>

          <Field label="Tags (séparés par virgule)">
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Broderie main, Soie, Mariée"
              data-testid="input-opp-tags"
            />
          </Field>

          <Field label="URL image de couverture (optionnel)">
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Laissez vide pour utiliser une image par défaut"
              data-testid="input-opp-cover"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-composer-cancel"
            >
              Annuler
            </Button>
            <Button onClick={submit} data-testid="button-composer-publish">
              Publier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label} {required && <span className="text-primary">*</span>}
      </Label>
      {children}
    </div>
  );
}
