import { STAGES } from "@/lib/catalog";
import type { Order } from "@/lib/types";

export default function StatusBadge({ order }: { order: Pick<Order, "stage" | "paid"> }) {
  const label = STAGES.find((s) => s.id === order.stage)?.label ?? order.stage;
  const tone = order.stage === "completed" ? "bg-ok/15 text-ok" : !order.paid ? "bg-brand-2/15 text-brand-2" : "bg-brand-soft text-brand";
  return (
    <span className="inline-flex gap-1.5">
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
      {!order.paid && <span className="rounded-full bg-brand-2/15 px-2.5 py-1 text-xs font-semibold text-brand-2">Awaiting payment</span>}
    </span>
  );
}
