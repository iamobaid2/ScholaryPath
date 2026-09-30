"use client";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { STAGES, type StageId } from "@/lib/catalog";
import type { Order } from "@/lib/types";

export default function OrderTimeline({ order }: { order: Pick<Order, "stage" | "timeline"> }) {
  const cur = STAGES.findIndex((s) => s.id === (order.stage as StageId));
  return (
    <ol className="relative space-y-6">
      {STAGES.map((s, i) => {
        const done = i <= cur;
        const at = order.timeline.find((t) => t.stage === s.id)?.at;
        return (
          <li key={s.id} className="relative flex gap-4">
            {i < STAGES.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-0.5 bg-line"><motion.span className="block w-full bg-brand" initial={{ height: 0 }} animate={{ height: i < cur ? "100%" : 0 }} transition={{ duration: 0.6, delay: i * 0.12 }} /></span>}
            <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08, type: "spring" }} className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold ${done ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-muted"}`}>
              {done ? <Check size={15} /> : i + 1}
            </motion.span>
            <div className="pt-1">
              <div className={`text-sm font-semibold ${done ? "" : "text-muted"}`}>{s.label}</div>
              {at && done && <div className="text-xs text-muted">{new Date(at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
