"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { useShop } from "./Providers";
import { CURRENCIES, type Currency } from "@/lib/catalog";

const NAMES: Record<Currency, string> = {
  GBP: "British Pound", AUD: "Australian Dollar", USD: "US Dollar", EUR: "Euro",
  CAD: "Canadian Dollar", NZD: "New Zealand Dollar", AED: "UAE Dirham", PKR: "Pakistani Rupee",
};

export default function CurrencySelect({ size = "md", align = "right" }: { size?: "sm" | "md"; align?: "left" | "right" }) {
  const { currency, setCurrency } = useShop();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  const choose = (c: Currency) => { setCurrency(c); setOpen(false); };

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") return setOpen(false);
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault(); setActive(CURRENCIES.indexOf(currency)); return setOpen(true);
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % CURRENCIES.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + CURRENCIES.length) % CURRENCIES.length); }
    if (e.key === "Enter") { e.preventDefault(); choose(CURRENCIES[active]); }
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKey}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${currency}`}
        onClick={() => { setActive(CURRENCIES.indexOf(currency)); setOpen(!open); }}
        className={`flex items-center gap-1.5 rounded-lg border border-line bg-surface font-medium transition hover:border-brand ${size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-3 text-sm"} ${open ? "border-brand" : ""}`}
      >
        {currency}
        <ChevronDown size={size === "sm" ? 13 : 15} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-xl ${align === "right" ? "right-0" : "left-0"}`}
            style={{ boxShadow: "var(--shadow)" }}
          >
            {CURRENCIES.map((c, i) => (
              <li key={c} role="option" aria-selected={c === currency}>
                <button
                  type="button"
                  onClick={() => choose(c)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${i === active ? "bg-surface-2" : ""}`}
                >
                  <span className="w-10 font-semibold">{c}</span>
                  <span className="flex-1 text-muted">{NAMES[c]}</span>
                  {c === currency && <Check size={15} className="text-brand" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
