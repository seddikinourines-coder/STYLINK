import { Check } from "lucide-react";
import {
  orderStages,
  orderStageLabels,
  type OrderStage,
} from "@/data/mockData";

export function StageBadge({ stage }: { stage: OrderStage }) {
  const palette: Record<OrderStage, string> = {
    pending: "bg-muted text-foreground border-border",
    "in-production": "bg-primary/15 text-primary border-primary/30",
    "quality-check": "bg-secondary/10 text-secondary-foreground border-secondary/30",
    completed: "bg-foreground text-background border-foreground",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] border ${palette[stage]}`}
    >
      {orderStageLabels[stage]}
    </span>
  );
}

export default function OrderTimeline({ stage }: { stage: OrderStage }) {
  const currentIdx = orderStages.indexOf(stage);
  return (
    <div className="flex items-center justify-between gap-2 w-full">
      {orderStages.map((s, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={s} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                  done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-border text-muted-foreground"
                } ${active ? "ring-4 ring-primary/15" : ""}`}
              >
                {done ? (
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <span className="text-xs font-light">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[10px] uppercase tracking-[0.15em] mt-2 text-center max-w-[90px] leading-tight ${
                  done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {orderStageLabels[s]}
              </span>
            </div>
            {idx < orderStages.length - 1 && (
              <div
                className={`flex-1 h-px mx-2 ${
                  idx < currentIdx ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
