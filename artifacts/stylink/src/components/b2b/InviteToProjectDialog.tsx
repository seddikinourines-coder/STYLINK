import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";
import { type Designer } from "@/data/mockData";

interface InviteToProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  designer: Designer;
}

export default function InviteToProjectDialog({
  open,
  onOpenChange,
  designer,
}: InviteToProjectDialogProps) {
  const { projects, currentBusinessId, inviteToProjectMembership } =
    useAppStore();
  const { toast } = useToast();

  // Real Projects owned by the current user, where the invitee is not already in.
  const myProjects = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.ownerId === currentBusinessId &&
          !p.participantIds.includes(designer.id),
      ),
    [projects, currentBusinessId, designer.id],
  );

  const [projectId, setProjectId] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  // Pre-select first project on open and prefill a friendly message
  useEffect(() => {
    if (!open) return;
    setProjectId((prev) => prev || myProjects[0]?.id || "");
    setMessage(
      `Bonjour ${designer.name}, je serais ravi(e) de vous inviter à collaborer sur l'un de mes projets. Dites-moi ce que vous en pensez.`,
    );
  }, [open, designer.name, myProjects]);

  function handleSend() {
    if (!projectId) return;
    const result = inviteToProjectMembership(
      projectId,
      designer.id,
      message.trim(),
    );
    if (!result) {
      toast({
        title: "Invitation impossible",
        description:
          "Vérifiez que vous êtes propriétaire de ce projet et que cette personne n'en fait pas déjà partie.",
        variant: "destructive",
      });
      return;
    }
    const project = myProjects.find((p) => p.id === projectId);
    toast({
      title: "Invitation envoyée",
      description: `${designer.name} a été invité(e) à « ${project?.name ?? "votre projet"} ».`,
    });
    onOpenChange(false);
    setProjectId("");
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        data-testid="dialog-invite-project"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Inviter à un projet
          </DialogTitle>
          <DialogDescription className="text-sm font-light">
            Sélectionnez l'un de vos projets pour inviter{" "}
            <span className="text-foreground">{designer.name}</span> à
            collaborer.
          </DialogDescription>
        </DialogHeader>

        {myProjects.length === 0 ? (
          <div
            className="rounded-xl border border-dashed border-black/10 p-6 text-center"
            data-testid="text-no-projects"
          >
            <p className="font-serif text-base text-foreground mb-1">
              Aucun projet disponible
            </p>
            <p className="text-sm text-muted-foreground font-light">
              Créez un projet depuis une conversation (icône ⭐ « Convertir en
              projet ») pour pouvoir inviter des collaborateurs, ou {designer.name}
              {" "}
              en fait déjà partie.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-project" className="text-xs uppercase tracking-[0.18em]">
                Projet
              </Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger
                  id="invite-project"
                  className="rounded-xl"
                  data-testid="select-project"
                >
                  <SelectValue placeholder="Sélectionnez un projet" />
                </SelectTrigger>
                <SelectContent>
                  {myProjects.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      data-testid={`option-project-${p.id}`}
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message" className="text-xs uppercase tracking-[0.18em]">
                Message
              </Label>
              <textarea
                id="invite-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-black/10 bg-background px-3 py-2 text-sm font-light placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                data-testid="textarea-invite-message"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
            data-testid="button-cancel-invite"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={myProjects.length === 0 || !projectId}
            className="rounded-full"
            data-testid="button-confirm-invite"
          >
            Envoyer l'invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
