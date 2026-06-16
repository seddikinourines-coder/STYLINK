import { useEffect, useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, Heart, SlidersHorizontal } from "lucide-react";
import { useAppStore } from "@/contexts/AppStore";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API = "/api";

interface Business {
  id: number;
  name: string;
  contact_name: string | null;
  city: string | null;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
  min_price?: string | number | null;
  max_price?: string | number | null;
  product_count?: number;
}

function Avatar({ business }: { business: Business }) {
  if (business.avatar_url) {
    return (
      <img
        src={business.avatar_url}
        alt={business.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-muted">
      <span className="font-serif text-7xl text-muted-foreground/40 select-none">
        {business.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export default function BoutiqueDirectory() {
  const [query, setQuery] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  
  const { isFavorite, toggleFavorite } = useAppStore();
  const { toast } = useToast();

  useEffect(() => {
    fetch(`${API}/businesses`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cities = useMemo(() => {
    const uniqueCities = new Set(businesses.map(b => b.city).filter(Boolean));
    return Array.from(uniqueCities).sort() as string[];
  }, [businesses]);

  const roles = useMemo(() => {
    const uniqueRoles = new Set(businesses.map(b => b.role).filter(Boolean));
    return Array.from(uniqueRoles).sort() as string[];
  }, [businesses]);

  const filtered = useMemo(() => {
    let result = businesses.filter((b) => {
      const q = query.toLowerCase().trim();
      const matchesQuery = !q || 
        b.name.toLowerCase().includes(q) ||
        (b.city ?? "").toLowerCase().includes(q) ||
        (b.role ?? "").toLowerCase().includes(q) ||
        (b.bio ?? "").toLowerCase().includes(q);

      const matchesCity = cityFilter === "all" || b.city === cityFilter;
      const matchesRole = roleFilter === "all" || b.role === roleFilter;

      return matchesQuery && matchesCity && matchesRole;
    });

    if (sortOrder === "price-asc") {
      result.sort((a, b) => Number(a.min_price || 0) - Number(b.min_price || 0));
    } else if (sortOrder === "price-desc") {
      result.sort((a, b) => Number(b.max_price || 0) - Number(a.max_price || 0));
    } else if (sortOrder === "name-asc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [businesses, query, cityFilter, roleFilter, sortOrder]);

  return (
    <section className="container mx-auto px-4 md:px-8 py-20">
      <header className="text-center mb-16">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-sans">
          Boutiques
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-4">
          Exceptional Addresses
        </h1>
        <p className="text-muted-foreground font-light max-w-xl mx-auto">
          Discover Algerian creators, workshops, and boutiques registered on STYLINK.
        </p>
      </header>

      <div className="space-y-8 mb-16">
        <div className="flex justify-center">
          <div className="w-full max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city or category…"
              className="w-full h-14 pl-12 pr-4 bg-transparent border-b border-border focus:outline-none focus:border-primary transition-colors font-sans text-lg"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mr-2 text-muted-foreground">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-medium">Filters</span>
          </div>

          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-[160px] h-10 rounded-none border-x-0 border-t-0 border-b border-border bg-transparent text-[10px] uppercase tracking-[0.2em]">
              <SelectValue placeholder="CITY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL CITIES</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px] h-10 rounded-none border-x-0 border-t-0 border-b border-border bg-transparent text-[10px] uppercase tracking-[0.2em]">
              <SelectValue placeholder="CATEGORY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL CATEGORIES</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px] h-10 rounded-none border-x-0 border-t-0 border-b border-border bg-transparent text-[10px] uppercase tracking-[0.2em]">
              <SelectValue placeholder="SORT BY" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">DEFAULT SORT</SelectItem>
              <SelectItem value="name-asc">NAME (A-Z)</SelectItem>
              <SelectItem value="price-asc">PRICE: LOW TO HIGH</SelectItem>
              <SelectItem value="price-desc">PRICE: HIGH TO LOW</SelectItem>
            </SelectContent>
          </Select>
          
          {(cityFilter !== "all" || roleFilter !== "all" || sortOrder !== "default" || query) && (
            <button 
              onClick={() => {
                setCityFilter("all");
                setRoleFilter("all");
                setSortOrder("default");
                setQuery("");
              }}
              className="text-[10px] uppercase tracking-[0.2em] text-primary hover:underline ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-32 text-center">
          <p className="text-muted-foreground font-light">Loading…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center">
          <h3 className="font-serif text-2xl text-foreground mb-3">
            {businesses.length === 0
              ? "No professional accounts yet"
              : "No results found"}
          </h3>
          <p className="text-muted-foreground font-light">
            {businesses.length === 0
              ? "Professionals who create an account will appear here."
              : "Try another name or city."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filtered.map((b) => {
            const favId = String(b.id);
            const fav = isFavorite("boutiques", favId);
            return (
              <div key={b.id} className="group relative">
                <Link href={`/boutiques/${b.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                    <Avatar business={b} />

                    <span className="absolute top-3 left-3 bg-background/90 text-foreground text-[10px] uppercase tracking-[0.2em] px-3 py-1 z-10">
                      {b.role ?? "Professional"}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <div className="flex justify-between items-end mb-1">
                        {b.city && (
                          <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                            {b.city}
                          </p>
                        )}
                        {b.min_price && (
                          <p className="text-[10px] font-medium text-white/90 bg-white/10 px-2 py-0.5 rounded-sm">
                            From {Number(b.min_price).toLocaleString()} DA
                          </p>
                        )}
                      </div>
                      <h3 className="font-serif text-2xl leading-tight mb-2">
                        {b.name}
                      </h3>
                      {b.bio && (
                        <p className="text-xs font-light leading-relaxed text-white/90 max-h-0 group-hover:max-h-32 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-out line-clamp-3">
                          {b.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      View Boutique
                    </p>
                    {b.product_count && b.product_count > 0 && (
                      <span className="text-[10px] text-muted-foreground/60 italic">
                        {b.product_count} article{b.product_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite("boutiques", favId);
                    toast({
                      title: fav ? "Removed from favorites" : "Added to favorites",
                      description: b.name,
                    });
                  }}
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-background/80 backdrop-blur-sm hover:bg-background transition-colors z-10"
                  aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={`w-4 h-4 ${fav ? "fill-primary text-primary" : "text-foreground"}`}
                    strokeWidth={1.5}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
