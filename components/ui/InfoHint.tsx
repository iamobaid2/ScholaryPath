"use client";
import * as React from "react";
import { Info } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/**
 * A small "i" that explains something. It opens on hover and keyboard focus, and toggles on tap so
 * it also works on touch screens; a tap anywhere else, or Escape, closes it.
 */
export default function InfoHint({ children, label = "More information", side = "top", align = "center" }: { children: React.ReactNode; label?: string; side?: "top" | "bottom"; align?: "left" | "center" | "right" }) {
  const [open, setOpen] = React.useState(false);
  const root = React.useRef<HTMLSpanElement>(null);
  const touch = React.useRef(false);
  const id = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  const pos = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2";
  return (
    <span
      ref={root}
      className="relative inline-flex"
      onMouseEnter={() => { if (!touch.current) setOpen(true); }}
      onMouseLeave={() => { if (!touch.current) setOpen(false); }}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onPointerDown={(e) => { touch.current = e.pointerType === "touch" || e.pointerType === "pen"; }}
        onClick={(e) => { e.stopPropagation(); if (touch.current) setOpen((o) => !o); }}
        onFocus={() => { if (!touch.current) setOpen(true); }}
        onBlur={() => { if (!touch.current) setOpen(false); }}
        className="inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-muted transition-colors hover:text-brand focus-visible:text-brand focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <Info size={16} strokeWidth={1.75} aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === "top" ? 4 : -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-40 w-64 max-w-[calc(100vw-2rem)] rounded-lg bg-fg px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-bg shadow-lg ${side === "top" ? "bottom-full mb-2" : "top-full mt-2"} ${pos}`}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
