import { useMemo, useState } from "react";
import { Link } from "wouter";
import { MapPin, Home, User as UserIcon } from "lucide-react";
import { mockDesigners, Designer } from "@/data/mockData";
import { useAppStore } from "@/contexts/AppStore";
import { ALGERIA_WILAYAS } from "@/data/wilayas";

interface CityCluster {
  city: string;
  lat: number;
  lng: number;
  designers: Designer[];
}

const ALGERIA_BOUNDS = {
  minLng: -8.7,
  maxLng: 12,
  minLat: 18.9,
  maxLat: 37.5,
};

function project(lat: number, lng: number): { x: number; y: number } {
  const x =
    ((lng - ALGERIA_BOUNDS.minLng) /
      (ALGERIA_BOUNDS.maxLng - ALGERIA_BOUNDS.minLng)) *
    100;
  const y =
    ((ALGERIA_BOUNDS.maxLat - lat) /
      (ALGERIA_BOUNDS.maxLat - ALGERIA_BOUNDS.minLat)) *
    100;
  return { x, y };
}

const ALGERIA_PATH =
  "M 33,13 " +
  "L 36,12 L 39,10 L 42,9 L 43,8 L 47,6 L 49,4 L 54,4 L 57,4 " +
  "L 60,4 L 62,4 L 64,4 L 67,4 L 70,4 L 72,3 L 76,3 L 78,3 L 80,3 L 83,2 " +
  "L 83,4 L 82,6 L 82,8 L 82,11 L 81,15 L 81,19 L 82,23 L 83,27 " +
  "L 83,29 L 84,32 L 86,33 L 88,36 " +
  "L 88,39 L 89,43 L 90,48 L 92,59 L 95,67 L 98,75 L 98,83 L 100,84 " +
  "L 98,86 L 93,89 L 86,93 L 83,95 L 78,96 L 63,97 " +
  "L 54,94 L 47,91 L 40,89 L 32,86 L 25,83 L 20,85 L 16,93 " +
  "L 10,85 L 5,76 L 1,68 L 0,62 " +
  "L 0,53 " +
  "L 30,53 " +
  "L 30,46 L 31,40 L 32,35 L 32,29 L 33,24 L 33,18 " +
  "Z";

export default function FashionMap() {
  const { user } = useAppStore();

  const clusters: CityCluster[] = useMemo(() => {
    const map = new Map<string, CityCluster>();
    for (const d of mockDesigners) {
      if (!map.has(d.city)) {
        map.set(d.city, { city: d.city, lat: d.lat, lng: d.lng, designers: [] });
      }
      map.get(d.city)!.designers.push(d);
    }
    return Array.from(map.values());
  }, []);

  const userWilaya = useMemo(() => {
    if (!user?.city) return null;
    return ALGERIA_WILAYAS.find((w) => w.name === user.city) ?? null;
  }, [user]);

  const userDisplayName = useMemo(() => {
    if (!user) return "";
    return user.type === "business" ? user.brandName : user.name;
  }, [user]);

  const userRole = useMemo(() => {
    if (!user) return "";
    if (user.type === "client") return "Client";
    const labels: Record<string, string> = {
      boutique: "Boutique",
      designer: "Designer",
      atelier: "Atelier",
      "fabric-retailer": "Fournisseur de tissus",
    };
    return labels[user.role] ?? user.role;
  }, [user]);

  const allClusters = useMemo((): CityCluster[] => {
    if (!userWilaya) return clusters;
    const existing = clusters.find((c) => c.city === userWilaya.name);
    if (existing) return clusters;
    return [
      ...clusters,
      { city: userWilaya.name, lat: userWilaya.lat, lng: userWilaya.lng, designers: [] },
    ];
  }, [clusters, userWilaya]);

  const [selected, setSelected] = useState<CityCluster | null>(clusters[0] ?? null);

  const isUserCity = selected !== null && userWilaya !== null && selected.city === userWilaya.name;

  const totalCount = (c: CityCluster) =>
    c.designers.length + (userWilaya && c.city === userWilaya.name ? 1 : 0);

  return (
    <section className="bg-muted py-20" data-testid="section-fashion-map">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
            La Carte
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            Une mode ancrée dans le territoire
          </h2>
          <p className="text-muted-foreground font-light max-w-xl mx-auto">
            Découvrez nos créateurs à travers les grandes villes algériennes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 relative aspect-[4/3] bg-background border border-border overflow-hidden">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
            >
              <defs>
                <pattern
                  id="map-grid"
                  width="5"
                  height="5"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 5 0 L 0 0 0 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.1"
                    className="text-border"
                  />
                </pattern>
                <clipPath id="algeria-clip">
                  <path d={ALGERIA_PATH} />
                </clipPath>
              </defs>

              <rect width="100" height="100" fill="hsl(var(--muted))" />
              <path d={ALGERIA_PATH} fill="hsl(var(--background))" stroke="none" />
              <rect
                width="100"
                height="100"
                fill="url(#map-grid)"
                clipPath="url(#algeria-clip)"
              />
              <path
                d={ALGERIA_PATH}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="0.4"
                opacity="0.7"
              />
            </svg>

            {/* City cluster pins */}
            {allClusters.map((c) => {
              const { x, y } = project(c.lat, c.lng);
              const isActive = selected?.city === c.city;
              const count = totalCount(c);
              const isUsersCluster = userWilaya?.name === c.city;

              return (
                <button
                  key={c.city}
                  onClick={() => setSelected(c)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  data-testid={`pin-city-${c.city.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span
                    className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-foreground text-background hover:scale-110"
                    }`}
                  >
                    {isUsersCluster ? (
                      <Home className="w-4 h-4" strokeWidth={2} />
                    ) : (
                      <MapPin className="w-4 h-4" strokeWidth={2} />
                    )}
                    <span className="absolute -top-1 -right-1 bg-background text-foreground text-[9px] font-sans font-medium w-4 h-4 rounded-full flex items-center justify-center border border-border">
                      {count}
                    </span>
                  </span>
                  <span
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] uppercase tracking-[0.2em] whitespace-nowrap ${
                      isActive ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {c.city}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sidebar panel */}
          <div className="bg-background border border-border p-8 min-h-[300px]">
            {selected ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
                  {totalCount(selected)} profil{totalCount(selected) > 1 ? "s" : ""}
                </p>
                <h3
                  className="font-serif text-3xl text-foreground mb-6"
                  data-testid="text-selected-city"
                >
                  {selected.city}
                </h3>
                <ul className="space-y-4">
                  {/* Logged-in user's entry — shown first when city matches */}
                  {isUserCity && user && (
                    <li>
                      <div
                        className="flex items-center gap-3"
                        data-testid="map-user-entry"
                      >
                        <span className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <UserIcon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-serif text-base text-foreground">
                              {userDisplayName}
                            </p>
                            <span className="text-[9px] uppercase tracking-[0.15em] bg-primary/10 text-primary px-1.5 py-0.5 font-sans">
                              Vous
                            </span>
                          </div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {userRole}
                          </p>
                        </div>
                      </div>
                    </li>
                  )}

                  {/* Mock designers */}
                  {selected.designers.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/designers/${d.id}`}
                        className="flex items-center gap-3 group"
                        data-testid={`link-map-designer-${d.id}`}
                      >
                        <img
                          src={d.image}
                          alt={d.name}
                          className="w-12 h-12 object-cover"
                        />
                        <div>
                          <p className="font-serif text-base group-hover:text-primary transition-colors">
                            {d.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            {d.type} · {d.specialty}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-muted-foreground font-light">
                Sélectionnez une ville pour découvrir ses créateurs.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
