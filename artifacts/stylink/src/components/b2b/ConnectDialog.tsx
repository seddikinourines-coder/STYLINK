import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import {
  opportunityRoleLabels,
  type Opportunity,
} from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function ConnectDialog({
  opportunity,
  open,
  onOpenChange,
}: {
  opportunity: Opportunity | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { connectOpportunity } = useAppStore();
  const { toast } = useToast();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open && opportunity) {
      setMessage(
        `Bonjour, votre annonce "${opportunity.title}" m'intéresse beaucoup. J'aimerais en discuter plus en détail.`,
      );
    }
  }, [open, opportunity]);

  function submit() {
    if (!opportunity || !message.trim()) return;
    const req = connectOpportunity(opportunity.id, message.trim());
    if (req) {
      toast({
        title: "Demande envoyée",
        description:
          "Votre demande privée a été transmise. Vous la retrouverez dans vos demandes envoyées.",
      });
      onOpenChange(false);
      setMessage("");
    }
  }

  if (!opportunity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg"
        data-testid="dialog-connect"
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Demande privée
          </DialogTitle>
          <DialogDescription>
            Adressez un message confidentiel à{" "}
            <span className="text-foreground font-medium">
              {opportunityRoleLabels[opportunity.authorRole]}
            </span>{" "}
            au sujet de cette opportunité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="bg-muted px-4 py-3 border-l-2 border-primary">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Sujet
            </p>
            <p className="font-serif text-base text-foreground">
              {opportunity.title}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Votre message
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              data-testid="textarea-connect-message"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-connect-cancel"
            >
              Annuler
            </Button>
            <Button onClick={submit} data-testid="button-connect-send">
              Envoyer la demande
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
