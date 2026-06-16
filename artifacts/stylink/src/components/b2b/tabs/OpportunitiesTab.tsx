import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import OpportunityCard from "@/components/b2b/OpportunityCard";
import OpportunityComposer from "@/components/b2b/OpportunityComposer";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import { mockDesigners, type Opportunity } from "@/data/mockData";
import { useB2BShell } from "@/components/b2b/B2BShellContext";

function authorName(
  authorId: string,
  currentBusinessId: string | null,
): string | undefined {
  if (currentBusinessId && authorId === currentBusinessId) return undefined;
  return mockDesigners.find((d) => d.id === authorId)?.name;
}

export default function OpportunitiesTab() {
  const { t } = useTranslation();
  const { opportunities, user, currentBusinessId } = useAppStore();
  const { search } = useB2BShell();
  const [filter, setFilter] = useState<"all" | Opportunity["authorRole"]>(
    "all",
  );
  const [composerOpen, setComposerOpen] = useState(false);

  const roleFilters: Array<{
    value: "all" | Opportunity["authorRole"];
    label: string;
  }> = [
    { value: "all", label: t('b2b.network.filter_all') },
    { value: "designer", label: "Designers" },
    { value: "atelier", label: "Ateliers" },
    { value: "boutique", label: "Boutiques" },
    { value: "fabric-retailer", label: t('b2b.opportunities.fabric') },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list =
      filter === "all"
        ? opportunities
        : opportunities.filter((o) => o.authorRole === filter);
    const searched = q
      ? list.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.description.toLowerCase().includes(q) ||
            o.tags.some((t) => t.toLowerCase().includes(q)),
        )
      : list;
    return [...searched].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
  }, [opportunities, filter, search]);

  const suggestions = useMemo(() => {
    if (!user || user.type !== "business") return [];
    const wants: Record<string, Opportunity["authorRole"]> = {
      boutique: "designer",
      designer: "atelier",
      atelier: "designer",
      "fabric-retailer": "designer",
    };
    const target = wants[user.role];
    return opportunities
      .filter((o) => o.authorRole === target && o.status === "open")
      .slice(0, 2);
  }, [opportunities, user]);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-medium mb-2">
            {t('b2b.tabs.opportunities')}
          </p>
          <h2 className="font-serif text-3xl text-foreground">
            {t('b2b.opportunities.title')}
          </h2>
          <p className="text-sm text-muted-foreground font-light mt-2 max-w-2xl">
            {t('b2b.opportunities.subtitle')}
          </p>
        </div>
        <Button
          onClick={() => setComposerOpen(true)}
          className="rounded-full gap-2 shadow-sm"
          data-testid="button-new-opportunity"
        >
          <Plus className="w-4 h-4" /> {t('b2b.opportunities.publish')}
        </Button>
      </header>

      {/* Smart suggestions */}
      {suggestions.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <h3 className="text-[11px] uppercase tracking-[0.22em] text-primary font-medium">
              {t('b2b.network.suggested')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {suggestions.map((opp) => (
              <div
                key={`sug-${opp.id}`}
                className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden"
              >
                <OpportunityCard
                  opp={opp}
                  authorName={authorName(opp.authorId, currentBusinessId)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pill filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {roleFilters.map((f) => {
          const count =
            f.value === "all"
              ? opportunities.length
              : opportunities.filter((o) => o.authorRole === f.value).length;
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              data-testid={`filter-opp-${f.value}`}
              className={`text-xs px-4 py-2 rounded-full border transition-colors font-medium ${
                active
                  ? "bg-foreground text-background border-foreground"
                  : "bg-white text-foreground border-black/10 hover:border-foreground/40"
              }`}
            >
              {f.label}
              <span
                className={`ml-2 ${active ? "opacity-70" : "text-muted-foreground"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 py-16 text-center">
          <p className="font-serif text-xl text-foreground mb-2">
            {t('b2b.opportunities.none')}
          </p>
          <p className="text-sm text-muted-foreground font-light">
            {search.trim()
              ? t('b2b.feed.empty_subtitle')
              : t('b2b.opportunities.be_first')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden"
            >
              <OpportunityCard
                opp={opp}
                authorName={authorName(opp.authorId, currentBusinessId)}
              />
            </div>
          ))}
        </div>
      )}

      <OpportunityComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
      />
    </div>
  );
}
