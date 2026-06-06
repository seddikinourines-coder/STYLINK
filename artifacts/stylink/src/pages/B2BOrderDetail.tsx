import { Link, useRoute } from "wouter";
import { ArrowLeft, MessageCircle, Package, ChevronRight } from "lucide-react";
import B2BPage from "@/components/b2b/B2BPage";
import OrderTimeline, { StageBadge } from "@/components/b2b/OrderTimeline";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/contexts/AppStore";
import {
  mockDesigners,
  orderStageLabels,
  orderStages,
} from "@/data/mockData";

const fmtPrice = (n: number) =>
  new Intl.NumberFormat("fr-DZ").format(n) + " DA";

function nameOf(id: string): string {
  return mockDesigners.find((d) => d.id === id)?.name ?? id;
}

export default function B2BOrderDetail() {
  const [, params] = useRoute("/b2b/orders/:id");
  const { orders, advanceOrderStage } = useAppStore();
  const order = orders.find((o) => o.id === params?.id);

  if (!order) {
    return (
      <B2BPage>
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-black/5 p-12 text-center">
          <Package
            className="w-12 h-12 mx-auto mb-6 text-muted-foreground/40"
            strokeWidth={1}
          />
          <h2 className="font-serif text-2xl text-foreground mb-3">
            Commande introuvable
          </h2>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/b2b/orders">Retour aux commandes</Link>
          </Button>
        </div>
      </B2BPage>
    );
  }

  const isFinal = order.stage === "completed";
  const nextStageIdx = orderStages.indexOf(order.stage) + 1;
  const nextStageLabel =
    nextStageIdx < orderStages.length
      ? orderStageLabels[orderStages[nextStageIdx]]
      : null;

  return (
    <B2BPage>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back */}
        <Link
          href="/b2b/orders"
          data-testid="link-back-orders"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3 h-3" /> Retour aux commandes
        </Link>

        {/* Header card */}
        <header className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-primary mb-2 font-medium">
                {order.reference} · Créée le {order.createdAt}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">
                {order.designName}
              </h2>
            </div>
            <StageBadge stage={order.stage} />
          </div>
        </header>

        {/* Timeline */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
          <h3 className="font-serif text-xl text-foreground mb-6">
            Étapes de production
          </h3>
          <div className="bg-[#F5F3EE] rounded-2xl px-6 md:px-10 py-8">
            <OrderTimeline stage={order.stage} />
          </div>

          {!isFinal && nextStageLabel && (
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4 bg-[#F5F3EE] rounded-2xl px-5 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-primary font-medium">
                  Prochaine étape
                </p>
                <p className="font-serif text-lg text-foreground mt-1">
                  {nextStageLabel}
                </p>
              </div>
              <Button
                onClick={() => advanceOrderStage(order.id)}
                data-testid="button-advance-stage"
                className="gap-2 rounded-full"
              >
                Passer à l'étape suivante <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Details */}
          <section className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
            <h3 className="font-serif text-xl text-foreground mb-5">
              Détails de la commande
            </h3>
            <div className="divide-y divide-black/5">
              <DetailRow label="Description" value={order.description} />
              <DetailRow label="Tissu" value={order.fabricType} />
              <DetailRow
                label="Quantité"
                value={`${order.quantity} pièces`}
              />
              <DetailRow
                label="Prix unitaire"
                value={fmtPrice(order.unitPrice)}
              />
              <DetailRow
                label="Total"
                value={fmtPrice(order.totalPrice)}
                emphasis
              />
              <DetailRow
                label="Livraison prévue"
                value={order.expectedDelivery}
              />
            </div>
          </section>

          {/* Parties */}
          <aside className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
            <h3 className="font-serif text-xl text-foreground mb-5">
              Acteurs
            </h3>
            <div className="divide-y divide-black/5">
              <PartyRow role="Boutique" name={nameOf(order.boutiqueId)} />
              <PartyRow role="Designer" name={nameOf(order.designerId)} />
              <PartyRow role="Atelier" name={nameOf(order.atelierId)} />
              <PartyRow
                role="Tissus"
                name={nameOf(order.fabricSupplierId)}
              />
            </div>
            <Button
              variant="outline"
              className="w-full mt-5 gap-2 rounded-full"
              asChild
              data-testid="button-message-parties"
            >
              <Link
                href={`/b2b/messages?with=${encodeURIComponent(order.designerId)}`}
              >
                <MessageCircle className="w-4 h-4" /> Discuter
              </Link>
            </Button>
          </aside>
        </div>

        {/* History */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
          <h3 className="font-serif text-xl text-foreground mb-5">
            Historique
          </h3>
          <ol className="border-l border-black/10 pl-6 space-y-6">
            {[...order.history].reverse().map((h, idx) => (
              <li key={idx} className="relative">
                <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
                <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {h.date}
                </p>
                <p className="font-serif text-base text-foreground mt-1">
                  {orderStageLabels[h.stage]}
                </p>
                {h.note && (
                  <p className="text-sm text-muted-foreground font-light mt-1">
                    {h.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </B2BPage>
  );
}

function DetailRow({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 py-4 gap-4">
      <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`col-span-2 font-light ${
          emphasis
            ? "font-serif text-xl text-foreground"
            : "text-sm text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function PartyRow({ role, name }: { role: string; name: string }) {
  return (
    <div className="py-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {role}
      </p>
      <p className="text-sm text-foreground font-light mt-0.5">{name}</p>
    </div>
  );
}
