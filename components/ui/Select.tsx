"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Search } from "lucide-react";

export type Opt = { value: string; label: string; hint?: string; prefix?: string };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  placeholder?: string;
  searchable?: boolean;
  ariaLabel: string;
  align?: "left" | "right";
  menuClassName?: string;
  buttonClassName?: string;
  display?: (o: Opt | undefined) => React.ReactNode;
  invalid?: boolean;
};

export default function Select({ value, onChange, options, placeholder = "Select", searchable = false, ariaLabel, align = "left", menuClassName = "w-full min-w-56", buttonClassName = "", display, invalid }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? options.filter((o) => `${o.label} ${o.hint ?? ""} ${o.value}`.toLowerCase().includes(s)) : options;
  }, [options, q]);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [open]);

  useEffect(() => { if (open && searchable) search.current?.focus(); }, [open, searchable]);
  useEffect(() => { if (open) list.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" }); }, [active, open]);

  function toggle() {
    if (!open && root.current) {
      const r = root.current.getBoundingClientRect();
      const below = window.innerHeight - r.bottom;
      setUp(below < 320 && r.top > below);
      setQ("");
      setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    }
    setOpen(!open);
  }
  const choose = (o: Opt) => { onChange(o.value); setOpen(false); };

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") return setOpen(false);
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); toggle(); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[active]) choose(filtered[active]); }
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKey}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={toggle}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-surface text-left transition hover:border-brand ${invalid ? "border-danger" : open ? "border-brand" : "border-line"} ${buttonClassName || "h-11 px-3 text-sm"}`}
      >
        <span className={`truncate ${selected || display ? "" : "text-muted"}`}>
          {display ? display(selected) : selected ? `${selected.prefix ? selected.prefix + " " : ""}${selected.label}` : placeholder}
        </span>
        <ChevronDown size={15} className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className={`absolute z-50 overflow-hidden rounded-xl border border-line bg-surface ${up ? "bottom-full mb-2" : "top-full mt-2"} ${align === "right" ? "right-0" : "left-0"} ${menuClassName}`}
            style={{ boxShadow: "var(--shadow)" }}
          >
            {searchable && (
              <div className="flex items-center gap-2 border-b border-line px-3">
                <Search size={15} className="text-muted" />
                <input
                  ref={search}
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setActive(0); }}
                  placeholder="Search…"
                  aria-label="Search"
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted"
                />
              </div>
            )}
            <ul ref={list} role="listbox" className="max-h-60 overflow-y-auto p-1.5">
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No results</li>}
              {filtered.map((o, i) => (
                <li key={o.value} role="option" aria-selected={o.value === value} data-i={i}>
                  <button
                    type="button"
                    onClick={() => choose(o)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${i === active ? "bg-surface-2" : ""}`}
                  >
                    {o.prefix && <span className="w-6 shrink-0 text-base leading-none">{o.prefix}</span>}
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {o.hint && <span className="shrink-0 text-xs text-muted">{o.hint}</span>}
                    {o.value === value && <Check size={15} className="shrink-0 text-brand" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
