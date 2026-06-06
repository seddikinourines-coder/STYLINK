import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Camera, Plus, Trash2, Save, ArrowLeft, Package, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@workspace/object-storage-web";
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
import { ChevronsUpDown, Check } from "lucide-react";
import { ALGERIA_WILAYAS } from "@/data/wilayas";
import { cn } from "@/lib/utils";

const API = "/api";

interface UserProduct {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  image_url: string | null;
}

const CATEGORIES = [
  "Robe",
  "Caftan",
  "Costume",
  "Accessoire",
  "Tissu",
  "Bijou",
  "Chaussures",
  "Sac",
  "Autre",
];

function WilayaCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = ALGERIA_WILAYAS.find((w) => w.name === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between border border-input bg-background px-3 py-2 text-sm text-left h-10"
        >
          <span className={cn(!selected && "text-muted-foreground")}>
            {selected ? `${String(selected.code).padStart(2, "0")} — ${selected.name}` : "Choisir votre wilaya"}
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
                <CommandItem key={w.code} value={`${w.code} ${w.name}`} onSelect={() => { onChange(w.name); setOpen(false); }}>
                  <Check className={cn("mr-2 h-4 w-4", value === w.name ? "opacity-100" : "opacity-0")} />
                  <span className="text-muted-foreground text-xs mr-2 w-5 shrink-0">{String(w.code).padStart(2, "0")}</span>
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

export default function MyProfile() {
  const { user, updateUser } = useAppStore();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [contactName, setContactName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dbIdRef = useRef<number | undefined>(undefined);
  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (res) => {
      const url = `/api/storage${res.objectPath}`;
      setAvatar(url);
      const id = dbIdRef.current;
      if (id) {
        try {
          await fetch(`${API}/profile/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar_url: url }),
          });
          updateUser({ avatar: url });
          toast({ title: "Photo enregistrée", description: "Votre photo de profil a été sauvegardée." });
        } catch {
          toast({ title: "Photo téléchargée", description: "Photo mise à jour, mais la sauvegarde a échoué.", variant: "destructive" });
        }
      } else {
        toast({ title: "Photo téléchargée", description: "Votre photo a été mise à jour." });
      }
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de télécharger la photo.", variant: "destructive" });
    },
  });

  // Products
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // New product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pCategory, setPCategory] = useState("");
  const [pImages, setPImages] = useState<string[]>([]);
  const [pSizes, setPSizes] = useState<string[]>([]);
  const [pMeasurements, setPMeasurements] = useState("");
  const [addingProduct, setAddingProduct] = useState(false);

  const productFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProductImg, setUploadingProductImg] = useState(false);
  const { uploadFile: uploadProductImage } = useUpload({
    onSuccess: (res) => {
      setPImages((prev) => [...prev, `/api/storage${res.objectPath}`]);
      setUploadingProductImg(false);
    },
    onError: () => {
      setUploadingProductImg(false);
      toast({ title: "Erreur", description: "Impossible de télécharger l'image.", variant: "destructive" });
    },
  });

  const isBusiness = user?.type === "business";

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    setDisplayName(isBusiness ? (user as { brandName: string }).brandName : (user as { name: string }).name);
    setContactName(isBusiness ? (user as { contactName: string }).contactName ?? "" : "");
    setBio(user.bio ?? "");
    setCity(user.city ?? "");
    setAvatar(user.avatar ?? "");
  }, [user]);

  // Keep dbIdRef in sync so the upload onSuccess callback always has the latest value
  useEffect(() => {
    dbIdRef.current = user?.dbId;
  }, [user?.dbId]);

  // Auto-resolve dbId if the user is logged in but dbId wasn't captured (e.g. old session)
  useEffect(() => {
    if (!user || user.dbId || !user.email) return;
    fetch(`${API}/auth/me?email=${encodeURIComponent(user.email)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.id) {
          updateUser({
            dbId: data.id,
            bio: data.bio ?? undefined,
            avatar: data.avatar_url ?? undefined,
          });
        }
      })
      .catch(() => {});
  }, [user?.email, user?.dbId]);

  useEffect(() => {
    if (!user?.dbId || !isBusiness) return;
    setLoadingProducts(true);
    fetch(`${API}/products/${user.dbId}`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [user?.dbId, isBusiness]);

  if (!user) return null;

  const handleSaveProfile = async () => {
    if (!user.dbId) {
      toast({ title: "Erreur", description: "ID utilisateur manquant.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body: Record<string, string> = {
        name: displayName,
        bio,
        city,
        avatar_url: avatar,
      };
      if (isBusiness) body.contact_name = contactName;

      const res = await fetch(`${API}/profile/${user.dbId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Erreur", description: data.error, variant: "destructive" }); return; }

      const patch: Record<string, string> = {
        bio: data.bio ?? "",
        avatar: data.avatar_url ?? "",
        city: data.city ?? "",
      };
      if (isBusiness) {
        patch.brandName = data.name;
        patch.contactName = data.contact_name ?? "";
      } else {
        patch.name = data.name;
      }
      updateUser(patch as Parameters<typeof updateUser>[0]);
      setAvatar(data.avatar_url ?? "");
      toast({ title: "Profil mis à jour", description: "Vos informations ont été sauvegardées." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de joindre le serveur.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) return;
    if (!user.dbId) {
      toast({ title: "Session expirée", description: "Veuillez vous déconnecter puis vous reconnecter pour ajouter un article.", variant: "destructive" });
      return;
    }
    setAddingProduct(true);
    try {
      const res = await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.dbId,
          name: pName,
          description: pDesc,
          price: parseFloat(pPrice),
          category: pCategory,
          image_url: pImages.length > 0 ? JSON.stringify(pImages) : null,
          sizes: pSizes.length > 0 ? JSON.stringify(pSizes) : null,
          measurements: pMeasurements || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Erreur", description: data.error, variant: "destructive" }); return; }
      setProducts((prev) => [...prev, data]);
      setPName(""); setPDesc(""); setPPrice(""); setPCategory(""); setPImages([]); setPSizes([]); setPMeasurements("");
      setShowAddProduct(false);
      toast({ title: "Article ajouté", description: `"${data.name}" est maintenant dans votre boutique.` });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter l'article.", variant: "destructive" });
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await fetch(`${API}/products/${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Article supprimé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer l'article.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/60 hover:text-primary mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── Left column: identity ── */}
          <div className="lg:col-span-1 space-y-8">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                {avatar ? (
                  <img src={avatar} alt={displayName} className="w-28 h-28 rounded-full object-cover border-2 border-border" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                    <span className="font-serif text-4xl text-muted-foreground">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  {isUploading ? (
                    <span className="text-xs font-sans">{progress}%</span>
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                  e.target.value = "";
                }}
              />

              {/* Upload button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full text-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-2" />
                {isUploading ? `Téléchargement… ${progress}%` : "Choisir depuis le PC"}
              </Button>

            </div>

          </div>

          {/* ── Right column: form ── */}
          <div className="lg:col-span-2 space-y-8">

            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-1 font-sans">Mon profil</p>
              <h1 className="font-serif text-4xl text-foreground">{displayName}</h1>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em]">
                  {isBusiness ? "Nom de la maison" : "Nom complet"}
                </Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>

              {isBusiness && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-[0.2em]">Contact</Label>
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em]">Wilaya</Label>
                <WilayaCombobox value={city} onChange={setCity} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.2em]">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Présentez-vous en quelques mots…"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Sauvegarde…" : "Enregistrer les modifications"}
              </Button>
            </div>

            {/* ── Products section (business only) ── */}
            {isBusiness && (
              <div className="pt-8 border-t border-border space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-1 font-sans">Mes créations</p>
                    <h2 className="font-serif text-2xl text-foreground">Boutique</h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddProduct(!showAddProduct)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un article
                  </Button>
                </div>

                {/* Add product form */}
                {showAddProduct && (
                  <form onSubmit={handleAddProduct} className="border border-border p-6 space-y-4 bg-muted/30">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans">Nouvel article</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs uppercase tracking-[0.2em]">Nom de l'article *</Label>
                        <Input value={pName} onChange={(e) => setPName(e.target.value)} required placeholder="ex: Robe Kabyle brodée" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.2em]">Prix (DZD) *</Label>
                        <Input type="number" min="0" step="100" value={pPrice} onChange={(e) => setPPrice(e.target.value)} required placeholder="15000" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-[0.2em]">Catégorie</Label>
                        <select
                          value={pCategory}
                          onChange={(e) => setPCategory(e.target.value)}
                          className="w-full border border-input bg-background px-3 py-2 text-sm h-10"
                        >
                          <option value="">Choisir…</option>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs uppercase tracking-[0.2em]">Description</Label>
                        <Textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={2} className="resize-none" placeholder="Décrivez votre création…" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs uppercase tracking-[0.2em]">Tailles disponibles</Label>
                        <div className="flex flex-wrap gap-2">
                          {["XS","S","M","L","XL","XXL","3XL","Unique"].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setPSizes((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                              className={`w-11 h-11 text-xs font-sans border transition-colors ${
                                pSizes.includes(s) ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs uppercase tracking-[0.2em]">Mensurations spécifiques <span className="normal-case text-muted-foreground">(optionnel)</span></Label>
                        <Input value={pMeasurements} onChange={(e) => setPMeasurements(e.target.value)} placeholder="ex: Longueur 140cm, buste 90cm, personnalisable sur commande" />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-xs uppercase tracking-[0.2em]">Photos de l'article</Label>

                        {/* Thumbnails of uploaded images */}
                        {pImages.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {pImages.map((url, i) => (
                              <div key={i} className="relative w-20 h-20 border border-border overflow-hidden group/thumb">
                                <img src={url} alt={`photo ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => setPImages((prev) => prev.filter((_, j) => j !== i))}
                                  className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Hidden file input for product images */}
                        <input
                          ref={productFileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = Array.from(e.target.files ?? []);
                            e.target.value = "";
                            if (!files.length) return;
                            setUploadingProductImg(true);
                            for (const file of files) {
                              await uploadProductImage(file);
                            }
                            setUploadingProductImg(false);
                          }}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => productFileInputRef.current?.click()}
                          disabled={uploadingProductImg}
                          className="w-full text-xs"
                        >
                          <Upload className="w-3.5 h-3.5 mr-2" />
                          {uploadingProductImg
                            ? "Téléchargement…"
                            : pImages.length > 0
                              ? `Ajouter d'autres photos (${pImages.length} déjà ajoutée${pImages.length > 1 ? "s" : ""})`
                              : "Choisir des photos depuis le PC"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={addingProduct} size="sm">
                        {addingProduct ? "Ajout…" : "Ajouter à la boutique"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddProduct(false)}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                )}

                {/* Product grid */}
                {loadingProducts ? (
                  <p className="text-muted-foreground text-sm">Chargement…</p>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border">
                    <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" strokeWidth={1} />
                    <p className="text-muted-foreground text-sm">Aucun article encore.</p>
                    <p className="text-muted-foreground/60 text-xs mt-1">Ajoutez vos créations pour qu'elles apparaissent dans la boutique.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((p) => {
                      const imgs: string[] = (() => {
                        if (!p.image_url) return [];
                        try { const arr = JSON.parse(p.image_url); return Array.isArray(arr) ? arr : [p.image_url]; }
                        catch { return [p.image_url]; }
                      })();
                      return (
                      <div key={p.id} className="border border-border bg-background group relative">
                        {imgs.length > 0 ? (
                          <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                            <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            {imgs.length > 1 && (
                              <div className="absolute bottom-2 right-2 flex gap-1">
                                {imgs.slice(1, 4).map((url, i) => (
                                  <img key={i} src={url} alt="" className="w-8 h-8 object-cover border-2 border-white/80 rounded-sm" />
                                ))}
                                {imgs.length > 4 && (
                                  <div className="w-8 h-8 bg-black/60 border-2 border-white/80 rounded-sm flex items-center justify-center text-white text-[10px] font-sans">
                                    +{imgs.length - 4}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground/30" strokeWidth={1} />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-serif text-base">{p.name}</p>
                              {p.category && (
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{p.category}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {p.description && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
                          )}
                          <p className="font-serif text-lg mt-3">
                            {Number(p.price).toLocaleString("fr-DZ")} DA
                          </p>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
