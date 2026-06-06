import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Star, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";
import { type Designer } from "@/data/mockData";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");

interface ConvertToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Designer;
  conversationId: string;
  /** Optional default project name (e.g. derived from a recent message). */
  defaultName?: string;
}

export default function ConvertToProjectDialog({
  open,
  onOpenChange,
  partner,
  conversationId,
  defaultName,
}: ConvertToProjectDialogProps) {
  const { user, createProject } = useAppStore();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    if (open) {
      setName(defaultName ?? "");
    }
  }, [open, defaultName]);

  const meName =
    user?.type === "business" ? user.brandName : user?.name ?? "Vous";
  const meContact =
    user?.type === "business" ? user.contactName : user?.email ?? "";

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({
        title: "Nom requis",
        description: "Donnez un nom à votre projet pour continuer.",
        variant: "destructive",
      });
      return;
    }
    const project = createProject(trimmed, partner.id, conversationId);
    if (!project) {
      toast({
        title: "Création impossible",
        description:
          "Vérifiez que vous êtes connecté(e) en tant que business et que le partenaire est valide.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Projet créé",
      description: `« ${project.name} » réunit désormais vous et ${partner.name}.`,
    });
    onOpenChange(false);
    setName("");
    navigate(`/b2b/projects/${project.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        data-testid="dialog-convert-project"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Convertir en projet
          </DialogTitle>
          <DialogDescription className="text-sm font-light">
            Créez un espace de projet partagé à partir de cette conversation.
            Vous et votre interlocuteur y serez ajoutés automatiquement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label
              htmlFor="project-name"
              className="text-xs uppercase tracking-[0.18em]"
            >
              Nom du projet
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex : Robe d'été"
              autoFocus
              data-testid="input-project-name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.18em]">
              Participants
            </Label>
            <ul className="space-y-2">
              <li
                className="flex items-center gap-3 p-3 rounded-xl border border-black/5 bg-muted/40"
                data-testid="participant-me"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-primary/15">
                    {initials(meName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-foreground truncate">
                    {meName}
                    <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Vous
                    </span>
                  </p>
                  {meContact && (
                    <p className="text-xs text-muted-foreground font-light truncate">
                      {meContact}
                    </p>
                  )}
                </div>
                <Check className="w-4 h-4 text-primary" />
              </li>
              <li
                className="flex items-center gap-3 p-3 rounded-xl border border-black/5 bg-muted/40"
                data-testid={`participant-${partner.id}`}
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={partner.image} alt={partner.name} />
                  <AvatarFallback className="text-xs bg-primary/15">
                    {initials(partner.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-foreground truncate">
                    {partner.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-light truncate">
                    {partner.type} · {partner.city}
                  </p>
                </div>
                <Check className="w-4 h-4 text-primary" />
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
            data-testid="button-cancel-project"
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="rounded-full"
            data-testid="button-create-project"
          >
            Créer le projet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
