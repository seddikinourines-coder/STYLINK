import { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MapPin, User, Check, Home, Store } from "lucide-react";
import { useAppStore } from "@/contexts/AppStore";
import { mockProducts, getDesignerById } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { cart, clearCart } = useAppStore();

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedWilaya = WILAYAS.find((w) => String(w.code) === wilaya);
  
  const ZONE_LABELS: Record<number, { label: string; days: string }> = {
    1: { label: t('checkout.zone_1'), days: t('checkout.days_2_3') },
    2: { label: t('checkout.zone_2'), days: t('checkout.days_3_5') },
    3: { label: t('checkout.zone_3'), days: t('checkout.days_5_7') },
  };
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
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-4 font-sans">{t('checkout.order_confirmed')}</p>
          <h1 className="font-serif text-4xl text-foreground mb-4">{t('checkout.thank_you', { name: firstName })}</h1>
          <p className="text-muted-foreground font-light mb-3">
            {t('checkout.confirmation_msg', { contact: email || phone })}
          </p>
          {zone && (
            <p className="text-sm text-muted-foreground mb-10">
              {t('checkout.estimated_delivery', { days: zone.days })}
            </p>
          )}
          <Button asChild>
            <Link href="/">{t('checkout.back_to_home')}</Link>
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
          <ArrowLeft className="w-3 h-3" /> {t('checkout.back_to_cart')}
        </Link>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">

          {/* ── LEFT: FORM ── */}
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Section: Informations personnelles */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-[11px] uppercase tracking-[0.3em] text-foreground font-sans">
                  {t('checkout.personal_info')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">{t('checkout.first_name')} *</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Amira" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">{t('checkout.last_name')} *</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Benali" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">{t('checkout.email')}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="amira@email.com" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em]">{t('checkout.phone')} *</Label>
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
                  {t('checkout.delivery_mode')}
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
                    <p className="font-sans text-sm font-medium text-foreground mb-1">{t('checkout.home_delivery')}</p>
                    <p className="text-xs text-muted-foreground font-light">{t('checkout.home_delivery_desc')}</p>
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
                    <p className="font-sans text-sm font-medium text-foreground mb-1">{t('checkout.pickup_point')}</p>
                    <p className="text-xs text-muted-foreground font-light">{t('checkout.pickup_point_desc')}</p>
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
                <Label className="text-[10px] uppercase tracking-[0.2em]">{t('checkout.wilaya')} *</Label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  required
                  className="w-full border border-input bg-background px-3 py-2 text-sm h-10 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">{t('checkout.choose_wilaya')}</option>
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
                    <Label className="text-[10px] uppercase tracking-[0.2em]">{t('checkout.commune')} *</Label>
                    <Input value={commune} onChange={(e) => setCommune(e.target.value)} placeholder="ex: Bab El Oued" required />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label className="text-[10px] uppercase tracking-[0.2em]">{t('checkout.full_address')} *</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Numéro, rue, bâtiment, étage…" required />
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* ── RIGHT: SUMMARY ── */}
          <aside className="bg-muted/50 border border-border p-8 sticky top-32">
            <h2 className="font-serif text-2xl text-foreground mb-6">{t('checkout.summary')}</h2>
            <div className="space-y-4 mb-8">
              {lines.map((l) => (
                <div key={l.productId} className="flex gap-4">
                  <img src={l.image || ""} alt={l.name} className="w-16 h-20 object-cover bg-background" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-0.5 truncate">{l.seller}</p>
                    <p className="font-serif text-sm text-foreground truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qté : {l.qty}</p>
                  </div>
                  <p className="font-serif text-sm text-foreground">{(l.price * l.qty).toLocaleString("fr-DZ")} DA</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-6 border-t border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-light">{t('checkout.subtotal')}</span>
                <span>{total.toLocaleString("fr-DZ")} DA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-light">{t('checkout.delivery')}</span>
                <span className="text-primary italic text-xs">{t('checkout.to_be_confirmed')}</span>
              </div>
              <div className="flex justify-between pt-4 mt-2 border-t border-border items-baseline">
                <span className="text-xs uppercase tracking-[0.2em] font-medium">{t('checkout.total')}</span>
                <span className="font-serif text-2xl text-foreground">{total.toLocaleString("fr-DZ")} DA</span>
              </div>
            </div>

            <Button
              className="w-full mt-10 h-12 text-sm uppercase tracking-[0.2em]"
              disabled={!isValid || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "..." : t('checkout.place_order')}
            </Button>
          </aside>

        </div>
      </div>
    </div>
  );
}
