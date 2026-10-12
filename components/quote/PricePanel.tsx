"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { Clock, Tag } from "lucide-react";
import { useShop } from "../Providers";
import CurrencySelect from "../CurrencySelect";
import { COMPLEXITY, DEADLINES, LEVELS, findOption } from "@/lib/catalog";
import type { Item, Quote } from "@/lib/pricing";
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

export default function PricePanel({ level, course, items, draft, q, complete }: { level: string; course: string; items: Item[]; draft: Item; q: Quote; complete: boolean }) {
  const { money, openDiscount, cfg, code } = useShop();
  const pct = cfg.discountPercent;
  const head: [string, string][] = [
    ["Level", LEVELS.find((l) => l.id === level)?.label ?? ""],
    ["Course", course],
  ];

  const describe = (it: Item) =>
    [wordLabel(it), COMPLEXITY.find((c) => c.id === it.complexity)?.label, DEADLINES.find((d) => d.id === it.deadline)?.time].filter(Boolean).join(" · ");
  const draftOpt = findOption(draft.service);

  return (
    <div className="card p-5" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Order summary</h3>
        <CurrencySelect size="sm" />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {head.every(([, v]) => !v) && items.length === 0 && !draft.service && <p className="text-muted">Your choices will appear here as you go.</p>}
        {head.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4"><span className="text-muted">{k}</span><span className="text-right font-medium">{v}</span></div>
        ))}
      </div>

      {(items.length > 0 || draftOpt) && (
        <ul className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
          {items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium">{q.lines[i]?.label ?? findOption(it.service)?.label}</div>
                <div className="text-xs text-muted">{describe(it)}</div>
              </div>
              <div className="shrink-0 font-medium">{q.lines[i] ? money(q.lines[i].subtotal) : ""}</div>
            </li>
          ))}
          {draftOpt && (
            <li className="flex justify-between gap-3 rounded-lg bg-brand-soft px-3 py-2">
              <div className="min-w-0">
                <div className="font-medium">{draftOpt.label}{draft.documentation === "yes" ? " + documentation" : ""}</div>
                <div className="text-xs text-muted">{describe(draft) || "Choosing…"}</div>
              </div>
              <div className="shrink-0 text-xs text-muted">in progress</div>
            </li>
          )}
        </ul>
      )}

      <div className="mt-5 border-t border-line pt-4">
        {q.ok ? (
          <>
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
          <div className="flex items-center gap-2 rounded-xl bg-ok/10 px-3 py-2 text-xs text-ok"><Tag size={14} /> Code {code.toUpperCase()} applied</div>
        ) : (
          <button onClick={openDiscount} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted transition hover:border-brand hover:text-brand"><Tag size={14} /> Student? Claim {pct}% off</button>
        )}
      </div>
    </div>
  );
}
