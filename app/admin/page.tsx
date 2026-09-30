"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileText, X } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import OrderTimeline from "@/components/OrderTimeline";
import StatusBadge from "@/components/StatusBadge";
import { useAuth } from "@/components/Providers";
import { api } from "@/lib/api";
import { formatAmount } from "@/lib/pricing";
import { COMPLEXITY, DEADLINES, EXTRAS, LEVELS, SERVICE_CATEGORIES, STAGES, WORD_OPTIONS, type Currency, CURRENCIES } from "@/lib/catalog";
import type { PricingConfig } from "@/lib/pricing-defaults";
import type { Order } from "@/lib/types";

type Filter = "all" | "new" | "pending" | "assigned" | "completed";
const FILTERS: [Filter, string][] = [["all", "All"], ["new", "New"], ["pending", "Pending payment"], ["assigned", "In progress"], ["completed", "Completed"]];
const match = (o: Order, f: Filter) =>
  f === "all" || (f === "new" && o.stage === "received") || (f === "pending" && !o.paid) || (f === "assigned" && ["assigned", "started", "review"].includes(o.stage)) || (f === "completed" && o.stage === "completed");

function OrdersTab() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Order | null>(null);
  const [files, setFiles] = useState<{ name: string; url: string | null }[]>([]);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    token().then((t) => api<{ orders: Order[] }>("/api/admin/orders", t)).then((d) => setOrders(d.orders)).catch((e) => setErr(e.message));
  }, [token]);

  async function openOrder(o: Order) {
    setOpen(o); setNote(o.adminNote || ""); setFiles([]);
    api<{ files: { name: string; url: string | null }[] }>(`/api/admin/orders/${o.id}/files`, await token()).then((d) => setFiles(d.files)).catch(() => {});
  }
  async function patch(body: object) {
    if (!open) return;
    try {
      const d = await api<{ order: Order }>(`/api/admin/orders/${open.id}`, await token(), { method: "PATCH", body: JSON.stringify(body) });
      setOpen(d.order); setOrders((os) => os.map((x) => (x.id === d.order.id ? d.order : x)));
    } catch (e) { setErr((e as Error).message); }
  }

  const list = orders.filter((o) => match(o, filter));
  return (
    <div>
      {err && <p className="mb-4 text-danger">{err}</p>}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-full border px-4 py-1.5 text-sm ${filter === id ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-muted"}`}>{label} {id === "all" ? `(${orders.length})` : `(${orders.filter((o) => match(o, id)).length})`}</button>
        ))}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase text-muted"><tr><th className="p-3">Order</th><th className="p-3">Client</th><th className="p-3">Service</th><th className="p-3">Amount</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} onClick={() => openOrder(o)} className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-2">
                <td className="p-3 font-medium">{o.id}</td><td className="p-3">{o.name}<div className="text-xs text-muted">{o.email}</div></td>
                <td className="p-3">{o.serviceLabel}</td><td className="p-3">{formatAmount(o.amount, o.currency)}</td><td className="p-3"><StatusBadge order={o} /></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted">No orders here.</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex justify-end bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.aside className="h-full w-full max-w-lg overflow-y-auto bg-bg p-6" initial={{ x: 80 }} animate={{ x: 0 }} exit={{ x: 80 }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between"><div><div className="text-xs text-muted">{open.id}</div><h2 className="text-xl font-semibold">{open.serviceLabel}</h2></div><button onClick={() => setOpen(null)} aria-label="Close"><X /></button></div>
              <dl className="mt-5 space-y-1.5 text-sm">
                {([["Client", open.name], ["Email", open.email], ["WhatsApp", open.whatsapp], ["Country", open.country], ["University", open.university], ["Degree", open.degree], ["Level", open.levelLabel], ["Subject", open.selection.course], ["Words", open.words?.toLocaleString("en") ?? "—"], ["Complexity", open.selection.complexity], ["Deadline", open.eta], ["Extras", open.selection.extras.join(", ") || "—"], ["Amount", `${formatAmount(open.amount, open.currency)} (£${open.totalGBP})`], ["Notes", open.notes || "—"]] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4"><dt className="text-muted">{k}</dt><dd className="text-right">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-5">
                <div className="mb-1 text-sm font-semibold">Files</div>
                {files.length === 0 && <p className="text-sm text-muted">None</p>}
                {files.map((f) => (<div key={f.name} className="text-sm">{f.url ? <a className="inline-flex items-center gap-2 text-brand underline" href={f.url} target="_blank" rel="noopener noreferrer"><FileText size={14} />{f.name}</a> : <span className="text-muted">{f.name} (not uploaded)</span>}</div>))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <select className="input !w-auto" value={open.stage} onChange={(e) => patch({ stage: e.target.value })}>{STAGES.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}</select>
                {!open.paid && <button className="btn btn-primary !py-2.5" onClick={() => patch({ paid: true })}>Mark as paid</button>}
              </div>
              <div className="mt-6"><label className="label">Internal note</label><textarea className="input min-h-20" value={note} onChange={(e) => setNote(e.target.value)} /><button className="btn btn-ghost mt-2 !py-2" onClick={() => patch({ adminNote: note })}>Save note</button></div>
              <div className="mt-8"><OrderTimeline order={open} /></div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Num({ label, value, onChange, step = 0.01 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <input type="number" min={0} step={step} className="input !w-28 !py-1.5 text-right" value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
    </label>
  );
}
const Box = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div className="card p-5"><h3 className="font-semibold">{title}</h3>{hint && <p className="mb-3 text-xs text-muted">{hint}</p>}<div className="mt-3 space-y-2">{children}</div></div>
);

function PricingTab() {
  const { token } = useAuth();
  const [c, setC] = useState<PricingConfig | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { token().then((t) => api<{ config: PricingConfig }>("/api/admin/pricing", t)).then((d) => setC(d.config)).catch((e) => setMsg(e.message)); }, [token]);
  if (!c) return <p className="text-muted">{msg || "Loading…"}</p>;

  const up = (fn: (d: PricingConfig) => void) => { const d = structuredClone(c); fn(d); setC(d); };
  async function save() {
    setMsg("Saving…");
    try { await api("/api/admin/pricing", await token(), { method: "PUT", body: JSON.stringify({ config: c }) }); setMsg("Saved. New quotes use these prices right away."); } catch (e) { setMsg((e as Error).message); }
  }
  const unit = (kind: string) => (kind === "edit" ? "£ per 1,000 words" : kind === "flat" ? "£ flat" : "× multiplier");

  return (
    <div className="space-y-5">
      <div className="sticky top-16 z-10 flex items-center justify-between rounded-2xl border border-line bg-surface/90 p-3 backdrop-blur"><span className="text-sm text-muted">{msg || "All base prices are in GBP."}</span><button className="btn btn-primary !py-2" onClick={save}>Save prices</button></div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Box title="Student discount"><Num label="Discount %" value={c.discountPercent} step={1} onChange={(v) => up((d) => { d.discountPercent = v; })} /></Box>
        <Box title="Academic level" hint="Price multiplier">{LEVELS.map((l) => <Num key={l.id} label={l.label} value={c.levels[l.id]} onChange={(v) => up((d) => { d.levels[l.id] = v; })} />)}</Box>
        <Box title="Complexity" hint="Price multiplier">{COMPLEXITY.map((l) => <Num key={l.id} label={l.label} value={c.complexity[l.id]} onChange={(v) => up((d) => { d.complexity[l.id] = v; })} />)}</Box>
        <Box title="Deadlines" hint="1.25 = +25%, 1.5 = +50%">{DEADLINES.map((l) => <Num key={l.id} label={`${l.label} (${l.time})`} value={c.deadlines[l.id]} onChange={(v) => up((d) => { d.deadlines[l.id] = v; })} />)}</Box>
        {(["essay", "assignment", "thesis", "phd"] as const).map((k) => (
          <Box key={k} title={`${k === "phd" ? "PhD thesis" : k[0].toUpperCase() + k.slice(1)} bands`} hint="Base price in £ for each length">
            {WORD_OPTIONS[k].map((w, i) => <Num key={w.label} label={w.label} step={1} value={c.bands[k][i]} onChange={(v) => up((d) => { d.bands[k][i] = v; })} />)}
          </Box>
        ))}
        <Box title="Add-ons" hint="Flat £ price">{EXTRAS.map((e) => <Num key={e.id} label={e.label} value={c.extras[e.id]} onChange={(v) => up((d) => { d.extras[e.id] = v; })} />)}</Box>
        <Box title="Exchange rates" hint="Per 1 GBP">{CURRENCIES.filter((x) => x !== "GBP").map((x) => <Num key={x} label={x as Currency} value={c.rates[x]} onChange={(v) => up((d) => { d.rates[x] = v; })} />)}</Box>
      </div>
      {SERVICE_CATEGORIES.map((cat) => (
        <Box key={cat.id} title={cat.label} hint="Unit depends on the service type, shown in each label">
          <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
            {cat.options.map((o) => <Num key={o.id} label={`${o.label} (${unit(o.kind)})`} value={c.services[o.id]} onChange={(v) => up((d) => { d.services[o.id] = v; })} />)}
          </div>
        </Box>
      ))}
    </div>
  );
}

function Admin() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<"orders" | "pricing">("orders");
  if (loading) return null;
  if (!isAdmin) return <div className="mx-auto max-w-md px-4 py-24 text-center text-muted">This area is for ScholaryPath admins. If that&apos;s you, add your email to <code>ADMIN_EMAILS</code> and sign in with it.</div>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Admin</h1>
      <div className="mb-6 mt-4 flex gap-1 rounded-full bg-surface-2 p-1 text-sm font-medium w-fit">
        {(["orders", "pricing"] as const).map((t) => (<button key={t} onClick={() => setTab(t)} className={`rounded-full px-5 py-2 capitalize ${tab === t ? "bg-surface shadow" : "text-muted"}`}>{t}</button>))}
      </div>
      {tab === "orders" ? <OrdersTab /> : <PricingTab />}
    </div>
  );
}
export default function Page() { return <RequireAuth><Admin /></RequireAuth>; }
