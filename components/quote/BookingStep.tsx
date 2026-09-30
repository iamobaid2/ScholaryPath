"use client";
import WhatsAppIcon from "../WhatsAppIcon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FileText, Mail, Paperclip, X } from "lucide-react";
import { ref, uploadBytes } from "firebase/storage";
import AuthForm from "../AuthForm";
import { useAuth, useShop } from "../Providers";
import { fbStorage, firebaseConfigured } from "@/lib/firebase-client";
import { CONTACT_EMAIL } from "@/lib/catalog";
import type { Quote, Selection } from "@/lib/pricing";
import { waLink } from "@/lib/whatsapp";
import { orderText } from "./helpers";

const uploadsOn = process.env.NEXT_PUBLIC_ENABLE_UPLOADS === "true";
const MAX = 25 * 1024 * 1024;
const fmtSize = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function BookingStep({ sel, q }: { sel: Selection; q: Quote }) {
  const { user, loading, token } = useAuth();
  const { currency, money } = useShop();
  const router = useRouter();
  const [f, setF] = useState({ name: "", whatsapp: "", country: "", university: "", degree: "", notes: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (file.size > MAX) { setErr(`“${file.name}” is over 25 MB.`); continue; }
      if (next.length < 10) next.push(file);
    }
    setFiles(next);
  }

  const text = (orderId?: string) =>
    orderText(sel, q, money(q.totalGBP), { ...f, email: user?.email ?? "", files: files.map((x) => x.name), orderId });

  async function place(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setErr(""); setBusy("Creating your order…");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
        body: JSON.stringify({ ...f, selection: sel, currency, files: files.map((x) => ({ name: x.name, size: x.size })) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      let failed = 0;
      for (let i = 0; i < files.length; i++) {
        setBusy(`Uploading file ${i + 1} of ${files.length}…`);
        try { await uploadBytes(ref(fbStorage(), d.order.files[i].path), files[i]); } catch { failed++; }
      }
      router.push(`/dashboard/orders/${d.order.id}?new=1${failed ? `&failed=${failed}` : ""}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong."); setBusy("");
    }
  }

  const quick = (
    <div className="mt-8 rounded-2xl bg-surface-2 p-5">
      <div className="text-sm font-semibold">Prefer not to create an account?</div>
      <p className="mt-1 text-xs text-muted">Send your order straight to us and attach your files in the chat or email.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a className="btn btn-ghost !py-2 !text-sm" target="_blank" rel="noopener noreferrer" href={waLink(text())}><WhatsAppIcon size={16} /> Send order on WhatsApp</a>
        <a className="btn btn-ghost !py-2 !text-sm" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("New order – ScholaryPath")}&body=${encodeURIComponent(text())}`}><Mail size={16} /> Send order by email</a>
      </div>
    </div>
  );

  if (loading) return <p className="text-muted">Loading…</p>;

  if (!user)
    return (
      <div>
        <h2 className="text-2xl font-semibold">Create your free account to book</h2>
        <p className="mt-1 text-muted">It takes a few seconds and lets you pay securely and track your order.</p>
        <div className="card mt-6 max-w-md p-6"><AuthForm /></div>
        {quick}
      </div>
    );

  return (
    <form onSubmit={place}>
      <h2 className="text-2xl font-semibold">Your details</h2>
      <p className="mt-1 text-muted">Signed in as {user.email}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><label className="label">Full name</label><input className="input" required value={f.name} onChange={set("name")} autoComplete="name" /></div>
        <div><label className="label">WhatsApp number</label><input className="input" type="tel" required placeholder="+92 300 1234567" value={f.whatsapp} onChange={set("whatsapp")} autoComplete="tel" /></div>
        <div><label className="label">Country</label><input className="input" required value={f.country} onChange={set("country")} autoComplete="country-name" /></div>
        <div><label className="label">University</label><input className="input" value={f.university} onChange={set("university")} /></div>
        <div className="sm:col-span-2"><label className="label">Degree</label><input className="input" value={f.degree} onChange={set("degree")} placeholder={sel.course} /></div>
        <div className="sm:col-span-2"><label className="label">Supervisor requirements / notes</label><textarea className="input min-h-28" value={f.notes} onChange={set("notes")} placeholder="Anything we should know: formatting rules, supervisor feedback, topic ideas…" /></div>
      </div>

      {uploadsOn ? (
      <div className="mt-6">
        <label className="label">Helping material (instructions, existing document, guidelines, previous feedback)</label>
        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-line p-6 text-center transition hover:border-brand hover:bg-brand-soft">
          <Paperclip className="text-brand" />
          <span className="text-sm font-medium">Tap to add files</span>
          <span className="text-xs text-muted">Up to 10 files, 25 MB each</span>
          <input type="file" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        </label>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, i) => (
              <motion.li initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={file.name + i} className="card flex items-center gap-3 px-4 py-2.5 text-sm">
                <FileText size={18} className="shrink-0 text-brand" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted">{fmtSize(file.size)}</span>
                <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-muted hover:text-danger"><X size={16} /></button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      ) : (
        <p className="mt-6 rounded-xl bg-brand-soft p-4 text-sm">Have instructions, guidelines or an existing document? After placing your order, send the files on WhatsApp or email with your order ID and we&apos;ll attach them to your order.</p>
      )}

      {err && <p className="mt-4 text-sm text-danger">{err}</p>}
      <button className="btn btn-primary mt-6 w-full sm:w-auto" disabled={!!busy || !firebaseConfigured}>{busy || `Place order · ${money(q.totalGBP)}`}</button>
      {quick}
    </form>
  );
}
