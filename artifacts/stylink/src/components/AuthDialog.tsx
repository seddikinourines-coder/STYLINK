import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAppStore, type BusinessRole, type User } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User as UserIcon,
  Briefcase,
  ChevronsUpDown,
  Check,
  LogIn,
} from "lucide-react";
import { ALGERIA_WILAYAS } from "@/data/wilayas";
import { cn } from "@/lib/utils";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "choose" | "login" | "client" | "business";

const businessRoles: { value: BusinessRole; label: string }[] = [
  { value: "boutique", label: "Boutique Owner" },
  { value: "designer", label: "Designer" },
  { value: "atelier", label: "Atelier Owner" },
  { value: "fabric-retailer", label: "Fabric Retailer" },
];

// ---------------------------------------------------------------------------
// API base — Netlify functions handle auth, backed by Supabase.
// ---------------------------------------------------------------------------
const API_BASE = "/api";

function WilayaCombobox({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = ALGERIA_WILAYAS.find((w) => w.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          className="w-full flex items-center justify-between border border-input bg-background px-3 py-2 text-sm text-left ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 h-10"
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected
              ? `${String(selected.code).padStart(2, "0")} — ${selected.name}`
              : "Choisir votre wilaya"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher une wilaya…" className="h-9" />
          <CommandList>
            <CommandEmpty>Aucune wilaya trouvée.</CommandEmpty>
            <CommandGroup>
              {ALGERIA_WILAYAS.map((w) => (
                <CommandItem
                  key={w.code}
                  value={`${w.code} ${w.name}`}
                  onSelect={() => {
                    onChange(w.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === w.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-muted-foreground text-xs mr-2 w-5 shrink-0">
                    {String(w.code).padStart(2, "0")}
                  </span>
                  {w.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { signIn } = useAppStore();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("choose");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Shared form state
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<BusinessRole | "">("");

  const reset = () => {
    setStep("choose");
    setName("");
    setContactName("");
    setEmail("");
    setPassword("");
    setCity("");
    setRole("");
    setApiError("");
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 250);
  };

  const applyUser = (data: {
    id?: number;
    type: string;
    name: string;
    contact_name?: string | null;
    email: string;
    city?: string | null;
    role?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
  }) => {
    let user: User;
    if (data.type === "business") {
      user = {
        type: "business",
        role: (data.role ?? "boutique") as BusinessRole,
        brandName: data.name,
        contactName: data.contact_name ?? "",
        email: data.email,
        city: data.city ?? undefined,
        bio: data.bio ?? undefined,
        avatar: data.avatar_url ?? undefined,
        dbId: data.id,
      };
    } else {
      user = {
        type: "client",
        name: data.name,
        email: data.email,
        city: data.city ?? undefined,
        bio: data.bio ?? undefined,
        avatar: data.avatar_url ?? undefined,
        dbId: data.id,
      };
    }
    signIn(user);
  };

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error ?? "Erreur de connexion."); return; }
      applyUser(data);
      toast({ title: "Bienvenue", description: "Connexion réussie." });
      close();
    } catch {
      setApiError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const submitClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "client", name, email, password, city }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error ?? "Erreur lors de l'inscription."); return; }
      applyUser(data);
      toast({ title: "Bienvenue " + name.split(" ")[0], description: "Votre compte client a été créé." });
      close();
    } catch {
      setApiError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const submitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!role || !name || !contactName || !email || !password) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "business", name, contactName, email, password, city, role }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error ?? "Erreur lors de l'inscription."); return; }
      applyUser(data);
      toast({ title: "Bienvenue " + name, description: "Votre compte professionnel a été créé." });
      close();
    } catch {
      setApiError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent
        className="sm:max-w-lg bg-background border-border max-h-[90vh] overflow-y-auto"
        data-testid="dialog-auth"
      >
        {/* ── CHOOSE ── */}
        {step === "choose" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-3xl text-center">
                Rejoignez STYLINK
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Choisissez votre type de compte pour commencer
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <button
                type="button"
                onClick={() => setStep("client")}
                className="group border border-border hover:border-primary p-8 text-center transition-colors"
                data-testid="button-account-client"
              >
                <UserIcon
                  className="w-10 h-10 mx-auto mb-4 text-foreground group-hover:text-primary transition-colors"
                  strokeWidth={1.2}
                />
                <h3 className="font-serif text-xl mb-2">Client</h3>
                <p className="text-xs text-muted-foreground font-sans uppercase tracking-[0.15em]">
                  Acheter & Découvrir
                </p>
              </button>
              <button
                type="button"
                onClick={() => setStep("business")}
                className="group border border-border hover:border-primary p-8 text-center transition-colors"
                data-testid="button-account-business"
              >
                <Briefcase
                  className="w-10 h-10 mx-auto mb-4 text-foreground group-hover:text-primary transition-colors"
                  strokeWidth={1.2}
                />
                <h3 className="font-serif text-xl mb-2">Business</h3>
                <p className="text-xs text-muted-foreground font-sans uppercase tracking-[0.15em]">
                  Vendre & Collaborer
                </p>
              </button>
            </div>
            <div className="mt-4 text-center hidden">
              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                  data-testid="button-go-login"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </>
        )}

        {/* ── LOGIN ── */}
        {step === "login" && (
          <>
            <DialogHeader>
              <button
                onClick={() => setStep("choose")}
                className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
                data-testid="button-back-login"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <DialogTitle className="font-serif text-2xl text-center pt-2">
                Connexion
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Accédez à votre espace STYLINK
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitLogin} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="l-email" className="text-xs uppercase tracking-[0.2em]">
                  Email
                </Label>
                <Input
                  id="l-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-login-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="l-password" className="text-xs uppercase tracking-[0.2em]">
                  Mot de passe
                </Label>
                <Input
                  id="l-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-login-password"
                />
              </div>
              {apiError && (
                <p className="text-sm text-destructive">{apiError}</p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loading}
                data-testid="button-submit-login"
              >
                {loading ? (
                  "Connexion…"
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{" "}
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Créer un compte
                </button>
              </p>
            </form>
          </>
        )}

        {/* ── CLIENT REGISTER ── */}
        {step === "client" && (
          <>
            <DialogHeader>
              <button
                onClick={() => setStep("choose")}
                className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
                data-testid="button-back-client"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <DialogTitle className="font-serif text-2xl text-center pt-2">
                Compte Client
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Vos informations personnelles
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitClient} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="c-name" className="text-xs uppercase tracking-[0.2em]">
                  Nom complet
                </Label>
                <Input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-client-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-email" className="text-xs uppercase tracking-[0.2em]">
                  Email
                </Label>
                <Input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-client-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-password" className="text-xs uppercase tracking-[0.2em]">
                  Mot de passe
                </Label>
                <Input
                  id="c-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  data-testid="input-client-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-city" className="text-xs uppercase tracking-[0.2em]">
                  Wilaya
                </Label>
                <WilayaCombobox id="c-city" value={city} onChange={setCity} />
              </div>
              {apiError && (
                <p className="text-sm text-destructive">{apiError}</p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loading}
                data-testid="button-submit-client"
              >
                {loading ? "Création…" : "Créer mon compte"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </form>
          </>
        )}

        {/* ── BUSINESS REGISTER ── */}
        {step === "business" && (
          <>
            <DialogHeader>
              <button
                onClick={() => setStep("choose")}
                className="absolute left-4 top-4 text-muted-foreground hover:text-foreground"
                data-testid="button-back-business"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <DialogTitle className="font-serif text-2xl text-center pt-2">
                Compte Professionnel
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Présentez votre maison
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={submitBusiness} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em]">
                  Type d'activité
                </Label>
                <Select value={role} onValueChange={(v) => setRole(v as BusinessRole)}>
                  <SelectTrigger data-testid="select-business-role">
                    <SelectValue placeholder="Choisir votre activité" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessRoles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-name" className="text-xs uppercase tracking-[0.2em]">
                  Nom de la maison
                </Label>
                <Input
                  id="b-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-business-brand"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-contact" className="text-xs uppercase tracking-[0.2em]">
                  Contact
                </Label>
                <Input
                  id="b-contact"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  data-testid="input-business-contact"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-email" className="text-xs uppercase tracking-[0.2em]">
                  Email
                </Label>
                <Input
                  id="b-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-business-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-password" className="text-xs uppercase tracking-[0.2em]">
                  Mot de passe
                </Label>
                <Input
                  id="b-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  data-testid="input-business-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-city" className="text-xs uppercase tracking-[0.2em]">
                  Wilaya
                </Label>
                <WilayaCombobox id="b-city" value={city} onChange={setCity} />
              </div>
              {apiError && (
                <p className="text-sm text-destructive">{apiError}</p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={!role || loading}
                data-testid="button-submit-business"
              >
                {loading ? "Création…" : "Créer mon compte pro"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
