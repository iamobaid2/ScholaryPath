"use client";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, CreditCard, FileText } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import OrderTimeline from "@/components/OrderTimeline";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/components/Providers";
import { api } from "@/lib/api";
import { formatAmount } from "@/lib/pricing";
import { waLink } from "@/lib/whatsapp";
import type { Order } from "@/lib/types";

function Detail() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const { token } = useAuth();
  const [o, setO] = useState<Order | null>(null);
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    let stop = false;
    const load = () => token().then((t) => api<{ order: Order }>(`/api/orders/${id}`, t)).then((d) => !stop && setO(d.order)).catch((e) => setErr(e.message));
    load();
    // the payment webhook can land a moment after the redirect back from Stripe
    const timer = sp.get("paid") ? setInterval(load, 3000) : undefined;
    const end = timer ? setTimeout(() => clearInterval(timer), 30000) : undefined;
    return () => { stop = true; if (timer) clearInterval(timer); if (end) clearTimeout(end); };
  }, [id, token, sp]);

  async function pay() {
    setPaying(true); setErr("");
    try {
      const d = await api<{ url: string }>("/api/checkout", await token(), { method: "POST", body: JSON.stringify({ orderId: id }) });
      window.location.href = d.url;
    } catch (e) { setErr(e instanceof Error ? e.message : "Couldn't start payment."); setPaying(false); }
  }

  if (err && !o) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><p className="text-danger">{err}</p><Link href="/dashboard" className="btn btn-ghost mt-4">Back to orders</Link></div>;
  if (!o) return <div className="px-4 py-24 text-center text-muted">Loading…</div>;

  const rows: [string, string][] = [
    ["Service", o.serviceLabel], ["Level", o.levelLabel], ["Subject", o.selection.course],
    ...(o.words ? ([["Word count", o.words.toLocaleString("en")]] as [string, string][]) : []),
    ["Expected completion", o.eta],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/dashboard" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-fg"><ArrowLeft size={16} /> All orders</Link>
      {sp.get("new") && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start gap-3 rounded-2xl bg-ok/10 p-4 text-sm text-ok">
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          <div><b>Order placed.</b> We emailed you a confirmation. Complete payment below to get started.{sp.get("failed") && <span className="block text-danger">{sp.get("failed")} file(s) failed to upload. Please send them to us on WhatsApp.</span>}</div>
        </motion.div>
      )}
      {sp.get("paid") && o.paid && <div className="mb-6 flex items-center gap-3 rounded-2xl bg-ok/10 p-4 text-sm text-ok"><CheckCircle2 size={18} /> Payment received. Thank you!</div>}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="text-xs font-semibold text-muted">{o.id}</div><h1 className="text-3xl font-semibold">{o.serviceLabel}</h1></div>
        <StatusBadge order={o} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="card p-6">
          <h2 className="font-semibold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            {rows.map(([k, v]) => (<div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right font-medium">{v}</dd></div>))}
          </dl>
          {o.discountGBP > 0 && <div className="mt-3 text-sm text-ok">Student discount applied</div>}
          <div className="mt-4 flex items-end justify-between border-t border-line pt-4"><span className="text-muted">Total</span><span className="font-display text-3xl font-semibold text-brand">{formatAmount(o.amount, o.currency)}</span></div>
          {!o.paid && (
            <>
              <button onClick={pay} disabled={paying} className="btn btn-primary mt-5 w-full"><CreditCard size={18} /> {paying ? "Redirecting…" : "Pay securely"}</button>
              {err && <p className="mt-2 text-sm text-danger">{err}</p>}
            </>
          )}
          <a href={waLink(`Hi, I have a question about order ${o.id}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-3 w-full"><WhatsAppIcon size={18} /> Message us about this order</a>
          {o.files.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-sm font-semibold">Files you sent</div>
              <ul className="space-y-1 text-sm text-muted">{o.files.map((f) => (<li key={f.path} className="flex items-center gap-2"><FileText size={14} /> {f.name}</li>))}</ul>
            </div>
          )}
        </div>
        <div className="card p-6"><h2 className="mb-5 font-semibold">Progress</h2><OrderTimeline order={o} /></div>
      </div>
    </div>
  );
}

export default function Page() { return <RequireAuth><Suspense><Detail /></Suspense></RequireAuth>; }
