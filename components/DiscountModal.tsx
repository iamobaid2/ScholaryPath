"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, X, Copy } from "lucide-react";
import { useShop } from "./Providers";
import { DISCOUNT_CODE } from "@/lib/catalog";
import Link from "next/link";

export default function DiscountModal() {
  const { discountOpen, closeDiscount, setCode, cfg } = useShop();
  const [f, setF] = useState({ name: "", email: "", whatsapp: "" });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setCode(d.code);
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  return (
    <AnimatePresence>
      {discountOpen && (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDiscount}>
          <motion.div role="dialog" aria-modal="true" aria-label="Claim your discount" className="card w-full max-w-md p-7 shadow-2xl" initial={{ y: 30, scale: 0.96, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} onClick={(e) => e.stopPropagation()}>
            <button className="float-right text-muted hover:text-fg" aria-label="Close" onClick={closeDiscount}><X size={20} /></button>
            {!done ? (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">Get {cfg.discountPercent}% off your first order</h3>
                  <p className="mt-1 text-sm text-muted">Tell us where to reach you and we&apos;ll reveal your code.</p>
                </div>
                <div><label className="label">Name</label><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></div>
                <div><label className="label">Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
                <div><label className="label">WhatsApp number</label><input className="input" type="tel" required placeholder="+92 300 1234567" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} autoComplete="tel" /></div>
                {err && <p className="text-sm text-danger">{err}</p>}
                <button className="btn btn-primary w-full" disabled={busy}>{busy ? "One moment…" : "Reveal my code"}</button>
              </form>
            ) : (
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-ok/15 text-ok"><Check /></motion.div>
                <h3 className="text-xl font-semibold">You&apos;re in!</h3>
                <p className="mt-1 text-sm text-muted">Your code is applied automatically to your quote.</p>
                <button onClick={() => { navigator.clipboard?.writeText(DISCOUNT_CODE); setCopied(true); }} className="mx-auto mt-5 flex items-center gap-2 rounded-xl border-2 border-dashed border-brand bg-brand-soft px-5 py-3 font-display text-2xl font-semibold tracking-widest text-brand">
                  {DISCOUNT_CODE} <Copy size={16} />
                </button>
                {copied && <p className="mt-1 text-xs text-ok">Copied</p>}
                <Link href="/quote" onClick={closeDiscount} className="btn btn-primary mt-6 w-full">Get my discounted quote</Link>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
