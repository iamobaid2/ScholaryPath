"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { Clock, Tag } from "lucide-react";
import { useShop } from "../Providers";
import CurrencySelect from "../CurrencySelect";
import { COMPLEXITY, DEADLINES, EXTRAS, LEVELS, findOption } from "@/lib/catalog";
import type { Quote, Selection } from "@/lib/pricing";
import { wordLabel } from "./helpers";

function AnimatedMoney({ value, className }: { value: number; className?: string }) {
  const { money } = useShop();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.6, ease: "easeOut", onUpdate: setShown });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return <span className={className}>{money(shown)}</span>;
}

export default function PricePanel({ sel, q, complete }: { sel: Selection; q: Quote; complete: boolean }) {
  const { money, openDiscount, cfg } = useShop();
  const rows: [string, string][] = [
    ["Level", LEVELS.find((l) => l.id === sel.level)?.label ?? ""],
    ["Course", sel.course],
    ["Service", findOption(sel.service)?.label ?? ""],
    ["Length", wordLabel(sel)],
    ["Complexity", COMPLEXITY.find((c) => c.id === sel.complexity)?.label ?? ""],
    ["Deadline", DEADLINES.find((d) => d.id === sel.deadline)?.time ?? ""],
    ["Extras", sel.extras.map((e) => EXTRAS.find((x) => x.id === e)?.label).join(", ")],
  ];
  const visible = rows.filter(([, v]) => v);
  const pct = cfg.discountPercent;

  return (
    <div className="card p-5" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Order summary</h3>
        <CurrencySelect size="sm" />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {visible.length === 0 && <p className="text-muted">Your choices will appear here as you go.</p>}
        {visible.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4"><span className="text-muted">{k}</span><span className="text-right font-medium">{v}</span></div>
        ))}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        {q.ok ? (
          <>
            {q.extrasTotal > 0 && <div className="mb-1 flex justify-between text-sm text-muted"><span>Add-ons</span><span>{money(q.extrasTotal)}</span></div>}
            {q.discount > 0 && <div className="mb-1 flex justify-between text-sm text-ok"><span>Student discount ({pct}%)</span><span>−{money(q.discount)}</span></div>}
            <div className="flex items-end justify-between">
              <span className="text-sm text-muted">{complete ? "Estimated price" : "Starting from"}</span>
              <AnimatedMoney value={q.totalGBP} className="font-display text-3xl font-semibold text-brand" />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted"><Clock size={13} /> {complete ? `Expected completion: ${q.eta}` : "Final price updates as you choose"}</div>
          </>
        ) : (
          <p className="text-sm text-muted">Choose a service and length to see your price.</p>
        )}
      </div>

      <div className="mt-4">
        {q.discount > 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-ok/10 px-3 py-2 text-xs text-ok"><Tag size={14} /> Code {sel.code.toUpperCase()} applied</div>
        ) : (
          <button onClick={openDiscount} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted transition hover:border-brand hover:text-brand"><Tag size={14} /> Student? Claim {pct}% off</button>
        )}
      </div>
    </div>
  );
}
