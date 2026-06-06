import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, MapPin, User, CreditCard, Clock, Check, Package, Home, Store } from "lucide-react";
import { useAppStore } from "@/contexts/AppStore";
import { mockProducts, getDesignerById } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const API = "/api";

const WILAYAS: { code: number; name: string; zone: number }[] = [
  { code: 1, name: "Adrar", zone: 3 },
  { code: 2, name: "Chlef", zone: 1 },
  { code: 3, name: "Laghouat", zone: 2 },
  { code: 4, name: "Oum El Bouaghi", zone: 1 },
  { code: 5, name: "Batna", zone: 1 },
  { code: 6, name: "Béjaïa", zone: 1 },
  { code: 7, name: "Biskra", zone: 2 },
  { code: 8, name: "Béchar", zone: 3 },
  { code: 9, name: "Blida", zone: 1 },
  { code: 10, name: "Bouira", zone: 1 },
  { code: 11, name: "Tamanrasset", zone: 3 },
  { code: 12, name: "Tébessa", zone: 1 },
  { code: 13, name: "Tlemcen", zone: 1 },
  { code: 14, name: "Tiaret", zone: 1 },
  { code: 15, name: "Tizi Ouzou", zone: 1 },
  { code: 16, name: "Alger", zone: 1 },
  { code: 17, name: "Djelfa", zone: 2 },
  { code: 18, name: "Jijel", zone: 1 },
  { code: 19, name: "Sétif", zone: 1 },
  { code: 20, name: "Saïda", zone: 1 },
  { code: 21, name: "Skikda", zone: 1 },
  { code: 22, name: "Sidi Bel Abbès", zone: 1 },
  { code: 23, name: "Annaba", zone: 1 },
  { code: 24, name: "Guelma", zone: 1 },
  { code: 25, name: "Constantine", zone: 1 },
  { code: 26, name: "Médéa", zone: 1 },
  { code: 27, name: "Mostaganem", zone: 1 },
  { code: 28, name: "M'Sila", zone: 2 },
  { code: 29, name: "Mascara", zone: 1 },
  { code: 30, name: "Ouargla", zone: 3 },
  { code: 31, name: "Oran", zone: 1 },
  { code: 32, name: "El Bayadh", zone: 2 },
  { code: 33, name: "Illizi", zone: 3 },
  { code: 34, name: "Bordj Bou Arreridj", zone: 1 },
  { code: 35, name: "Boumerdès", zone: 1 },
  { code: 36, name: "El Tarf", zone: 1 },
  { code: 37, name: "Tindouf", zone: 3 },
  { code: 38, name: "Tissemsilt", zone: 1 },
  { code: 39, name: "El Oued", zone: 3 },
  { code: 40, name: "Khenchela", zone: 1 },
  { code: 41, name: "Souk Ahras", zone: 1 },
  { code: 42, name: "Tipaza", zone: 1 },
  { code: 43, name: "Mila", zone: 1 },
  { code: 44, name: "Aïn Defla", zone: 1 },
  { code: 45, name: "Naâma", zone: 2 },
  { code: 46, name: "Aïn Témouchent", zone: 1 },
  { code: 47, name: "Ghardaïa", zone: 3 },
  { code: 48, name: "Relizane", zone: 1 },
  { code: 49, name: "El M'Ghair", zone: 3 },
  { code: 50, name: "El Meniaa", zone: 3 },
  { code: 51, name: "Ouled Djellal", zone: 2 },
  { code: 52, name: "Bordj Badji Mokhtar", zone: 3 },
  { code: 53, name: "Béni Abbès", zone: 3 },
  { code: 54, name: "Timimoun", zone: 3 },
  { code: 55, name: "Touggourt", zone: 3 },
  { code: 56, name: "Djanet", zone: 3 },
  { code: 57, name: "In Salah", zone: 3 },
  { code: 58, name: "In Guezzam", zone: 3 },
];

const ZONE_LABELS: Record<number, { label: string; days: string; color: string }> = {
  1: { label: "Nord / Centre", days: "2 à 3 jours ouvrables", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  2: { label: "Hauts Plateaux", days: "3 à 5 jours ouvrables", color: "text-amber-700 bg-amber-50 border-amber-200" },
  3: { label: "Grand Sud", days: "5 à 7 jours ouvrables", color: "text-orange-700 bg-orange-50 border-orange-200" },
};

function parseImages(raw: string | null): string[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as string[]; } catch { return [raw]; }
}

interface UserProduct {
  id: number;
  name: string;
  price: string;
  category: string | null;
  image_url: string | null;
  seller_name: string;
  user_id: number;
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const { cart, clearCart } = useAppStore();
  const { toast } = useToast();

  const [userProducts, setUserProducts] = useState<Record<string, UserProduct>>({});

  const upIds = cart
    .map((c) => c.productId)
    .filter((id) => id.startsWith("up-"))
    .map((id) => id.replace("up-", ""));

  useEffect(() => {
    if (upIds.length === 0) return;
    Promise.all(
      upIds.map((id) =>
        fetch(`${API}/products/item/${id}`)
          .then((r) => r.ok ? r.json() : null)
          .catch(() => null)
      )
    ).then((results) => {
      const map: Record<string, UserProduct> = {};
      results.forEach((p) => { if (p) map[String(p.id)] = p; });
      setUserProducts(map);
    });
  }, []);

  const lines = useMemo(() => cart.map((c) => {
    if (c.productId.startsWith("up-")) {
      const rawId = c.productId.replace("up-", "");
      const p = userProducts[rawId];
      if (!p) return null;
      const images = parseImages(p.image_url);
      return { productId: c.productId, qty: c.qty, name: p.name, price: Number(p.price), image: images[0] ?? null, seller: p.seller_name };
    } else {
      const p = mockProducts.find((mp) => mp.id === c.productId);
      if (!p) return null;
      const designer = getDesignerById(p.designerId);
      return { productId: c.productId, qty: c.qty, name: p.name, price: p.price, image: p.image, seller: designer?.name ?? "" };
    }
  }).filter((x): x is NonNullable<typeof x> => x !== null), [cart, userProducts]);

  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"home" | "pickup">("home");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod] = useState<"card">("card");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedWilaya = WILAYAS.find((w) => String(w.code) === wilaya);
  const zone = selectedWilaya ? ZONE_LABELS[selectedWilaya.zone] : null;

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    phone.trim().length >= 9 &&
    wilaya &&
    (deliveryMode === "pickup" || (commune.trim() && address.trim()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
    clearCart();
  };

  if (submitted) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-background" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-4 font-sans">Commande confirmée</p>
          <h1 className="font-serif text-4xl text-foreground mb-4">Merci, {firstName} !</h1>
          <p className="text-muted-foreground font-light mb-3">
            Votre commande a bien été enregistrée. Vous recevrez une confirmation sur{" "}
            <span className="text-foreground">{email || "votre téléphone"}</span>.
          </p>
          {zone && (
            <p className="text-sm text-muted-foreground mb-10">
              Délai de livraison estimé : <span className="text-foreground font-medium">{zone.days}</span>
            </p>
          )}
          <Button asChild>
            <Link href="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-background">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">

        {/* Back */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground mb-10 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Panier
        </Link>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">

          {/* ── LEFT: FORM ── */}
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Section: Informations personnelles */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-[11px] uppercase tracking-[0.3em] text-foreground font-sans">
                  Informations personnelles
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">Prénom *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Amira" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">Nom *</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Benali" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amira@email.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">Téléphone *</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05 XX XX XX XX"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section: Livraison */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-[11px] uppercase tracking-[0.3em] text-foreground font-sans">
                  Mode de livraison
                </p>
              </div>

              {/* Toggle: home vs pickup */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setDeliveryMode("home")}
                  className={`flex items-start gap-4 border p-5 text-left transition-colors ${
                    deliveryMode === "home"
                      ? "border-foreground bg-foreground/[0.03]"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  <Home className={`w-5 h-5 mt-0.5 flex-shrink-0 ${deliveryMode === "home" ? "text-foreground" : "text-muted-foreground"}`} strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground mb-1">Livraison à domicile</p>
                    <p className="text-xs text-muted-foreground font-light">Votre commande est livrée directement à votre adresse.</p>
                  </div>
                  {deliveryMode === "home" && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-background" strokeWidth={2.5} />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode("pickup")}
                  className={`flex items-start gap-4 border p-5 text-left transition-colors ${
                    deliveryMode === "pickup"
                      ? "border-foreground bg-foreground/[0.03]"
                      : "border-border hover:border-foreground/50"
                  }`}
                >
                  <Store className={`w-5 h-5 mt-0.5 flex-shrink-0 ${deliveryMode === "pickup" ? "text-foreground" : "text-muted-foreground"}`} strokeWidth={1.5} />
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground mb-1">Point relais</p>
                    <p className="text-xs text-muted-foreground font-light">Récupérez votre colis au bureau de livraison le plus proche.</p>
                  </div>
                  {deliveryMode === "pickup" && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-background" strokeWidth={2.5} />
                    </div>
                  )}
                </button>
              </div>

              {/* Wilaya selector — always shown */}
              <div className="space-y-2 mb-4">
                <Label className="text-[10px] uppercase tracking-[0.2em]">Wilaya *</Label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  required
                  className="w-full border border-input bg-background px-3 py-2 text-sm h-10 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Choisir une wilaya…</option>
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={String(w.code)}>
                      {String(w.code).padStart(2, "0")} — {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Home: commune + full address */}
              {deliveryMode === "home" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em]">Commune *</Label>
                    <Input value={commune} onChange={(e) => setCommune(e.target.value)} placeholder="ex: Bab El Oued" required />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em]">Adresse complète *</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Numéro, rue, bâtiment, étage…" required />
                  </div>
                </div>
              )}

              {/* Pickup: show nearest office */}
              {deliveryMode === "pickup" && selectedWilaya && (
                <div className="flex items-start gap-3 border border-border bg-muted/20 px-4 py-4">
                  <Store className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs font-medium text-foreground mb-0.5">
                      Bureau de livraison — {selectedWilaya.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-light">
                      Centre de distribution Yalidine / Zaki · Rue principale, chef-lieu de {selectedWilaya.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-[0.15em]">
                      Horaires : Dim – Jeu · 08h00 – 17h00
                    </p>
                  </div>
                </div>
              )}

              {deliveryMode === "pickup" && !selectedWilaya && (
                <p className="text-xs text-muted-foreground font-light italic">
                  Sélectionnez votre wilaya pour voir le point relais le plus proche.
                </p>
              )}

              {/* Delivery estimate */}
              {zone && (
                <div className={`mt-4 flex items-center gap-3 border px-4 py-3 ${zone.color}`}>
                  <Clock className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs font-medium">{zone.label}</p>
                    <p className="text-xs">Délai estimé : <span className="font-semibold">{zone.days}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Paiement par carte */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-[11px] uppercase tracking-[0.3em] text-foreground font-sans">
                  Paiement par carte
                </p>
              </div>

              <div className="border border-border p-5 space-y-4 bg-muted/20">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">Numéro de carte</Label>
                  <Input
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength={19}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em]">Date d'expiration</Label>
                    <Input placeholder="MM/AA" maxLength={5} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em]">Code CVV</Label>
                    <Input placeholder="XXX" maxLength={3} type="password" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground font-light">
                  Vos données bancaires sont chiffrées et sécurisées. Nous acceptons les cartes CIB et EDAHABIA.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="border-t border-border pt-8">
              <Button
                type="submit"
                disabled={!isValid || submitting}
                className="w-full h-14 text-sm uppercase tracking-[0.2em] font-sans"
                size="lg"
              >
                {submitting ? "Traitement en cours…" : `Confirmer la commande — ${total.toLocaleString("fr-DZ")} DA`}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center mt-4 font-light">
                En confirmant, vous acceptez nos conditions générales de vente.
              </p>
            </div>

          </form>

          {/* ── RIGHT: ORDER SUMMARY ── */}
          <aside className="lg:sticky lg:top-28">
            <div className="border border-border p-6">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
                Récapitulatif
              </p>
              <div className="space-y-4 mb-6">
                {lines.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-light">Chargement…</p>
                ) : lines.map((line) => (
                  <div key={line.productId} className="flex gap-3">
                    <div className="w-14 h-18 bg-muted flex-shrink-0 overflow-hidden" style={{ height: "4.5rem" }}>
                      {line.image ? (
                        <img src={line.image} alt={line.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground/30" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground truncate">{line.seller}</p>
                      <p className="font-serif text-sm text-foreground leading-tight">{line.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Qté : {line.qty}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground flex-shrink-0">
                      {(line.price * line.qty).toLocaleString("fr-DZ")} DA
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sous-total</span>
                  <span>{total.toLocaleString("fr-DZ")} DA</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Livraison</span>
                  <span>À confirmer</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="font-serif text-lg">{total.toLocaleString("fr-DZ")} DA</span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
