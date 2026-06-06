import { useState } from "react";
import { Link } from "wouter";
import B2BPage from "@/components/b2b/B2BPage";
import { StageBadge } from "@/components/b2b/OrderTimeline";
import { useAppStore } from "@/contexts/AppStore";
import {
  mockDesigners,
  orderStages,
  orderStageLabels,
  type OrderStage,
} from "@/data/mockData";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("fr-DZ").format(n) + " DA";

function nameOf(id: string): string {
  return mockDesigners.find((d) => d.id === id)?.name ?? id;
}

export default function B2BOrders() {
  const { orders } = useAppStore();
  const [filter, setFilter] = useState<OrderStage | "all">("all");

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.stage === filter);

  return (
    <B2BPage>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2 font-medium">
            Commandes
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground">
            Carnet de commandes
          </h2>
        </header>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterPill
            label="Toutes"
            active={filter === "all"}
            onClick={() => setFilter("all")}
            count={orders.length}
          />
          {orderStages.map((s) => (
            <FilterPill
              key={s}
              label={orderStageLabels[s]}
              active={filter === s}
              onClick={() => setFilter(s)}
              count={orders.filter((o) => o.stage === s).length}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 py-16 text-center">
            <p className="font-serif text-xl text-foreground mb-2">
              Aucune commande
            </p>
            <p className="text-sm text-muted-foreground font-light">
              Aucune commande dans cette catégorie pour le moment.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 divide-y divide-black/5 overflow-hidden">
            {filtered.map((o) => (
              <Link
                key={o.id}
                href={`/b2b/orders/${o.id}`}
                data-testid={`row-order-${o.id}`}
                className="block hover:bg-[#F5F3EE]/60 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 px-5 py-5">
                  <div className="md:col-span-2 text-xs text-muted-foreground tracking-[0.15em]">
                    {o.reference}
                    <p className="text-[10px] mt-1 uppercase tracking-[0.15em]">
                      {o.createdAt}
                    </p>
                  </div>
                  <div className="md:col-span-5">
                    <p className="font-serif text-lg text-foreground">
                      {o.designName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {nameOf(o.boutiqueId)} → {nameOf(o.designerId)} →{" "}
                      {nameOf(o.atelierId)}
                    </p>
                  </div>
                  <div className="md:col-span-3 text-sm">
                    <p className="text-foreground font-light">
                      {o.quantity} pièces
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmtPrice(o.totalPrice)}
                    </p>
                  </div>
                  <div className="md:col-span-2 flex md:justify-end">
                    <StageBadge stage={o.stage} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </B2BPage>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={`tab-${label.toLowerCase().replace(/\s/g, "-")}`}
      className={`text-xs px-4 py-2 rounded-full border transition-colors font-medium ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-white text-foreground border-black/10 hover:border-foreground/40"
      }`}
    >
      {label}
      <span
        className={`ml-2 ${active ? "opacity-70" : "text-muted-foreground"}`}
      >
        {count}
      </span>
    </button>
  );
}
