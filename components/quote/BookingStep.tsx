"use client";
import WhatsAppIcon from "../WhatsAppIcon";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload-client";
import AuthForm from "../AuthForm";
import FileDropzone from "./FileDropzone";
import Loader from "../Loader";
import CountrySelect from "../ui/CountrySelect";
import PhoneInput from "../ui/PhoneInput";
import useRegion from "../ui/useRegion";
import { countryByIso } from "@/lib/countries";
import { phoneToString, validatePhone, type Phone } from "@/lib/validation";
import { useAuth, useShop } from "../Providers";
import { firebaseConfigured } from "@/lib/firebase-client";
import { CONTACT_EMAIL } from "@/lib/catalog";
import type { Quote, Selection } from "@/lib/pricing";
import { waLink } from "@/lib/whatsapp";
import { orderText } from "./helpers";

const uploadsOn = process.env.NEXT_PUBLIC_ENABLE_UPLOADS === "true";

type Uploaded = Awaited<ReturnType<typeof uploadToCloudinary>>;

export default function BookingStep({ sel, q }: { sel: Selection; q: Quote }) {
  const { user, loading, token } = useAuth();
  const { currency, money } = useShop();
  const router = useRouter();
  const region = useRegion();
  const [f, setF] = useState({ name: "", university: "", degree: "", notes: "" });
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState<Phone>({ iso: "", number: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const phoneShown: Phone = { iso: phone.iso || country || region, number: phone.number };
  const countryName = countryByIso(country)?.name ?? "";
  const [files, setFiles] = useState<File[]>([]);
  const [feedback, setFeedback] = useState<File[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState("");
  // prefill from the profile saved at sign-up
  useEffect(() => {
    if (!user) return;
    let stop = false;
    token()
      .then((t) => fetch("/api/profile", { headers: { Authorization: `Bearer ${t}` } }))
      .then((r) => r.json())
      .then((d) => {
        if (stop) return;
        const p = d.profile;
        setF((x) => ({ ...x, name: x.name || p?.name || user.displayName || "" }));
        if (p) { setCountry((c) => c || p.country); setPhone((ph) => (ph.number ? ph : { iso: p.phoneIso, number: p.phone })); }
      })
      .catch(() => {});
    return () => { stop = true; };
  }, [user, token]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const text = (orderId?: string) =>
    orderText(sel, q, money(q.totalGBP), { ...f, whatsapp: phoneToString(phoneShown), country: countryName, email: user?.email ?? "", files: files.map((x) => x.name), feedback: feedback.map((x) => x.name), orderId });

  async function place(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const v: Record<string, string> = {};
    if (f.name.trim().length < 2) v.name = "Enter your full name.";
    if (!country) v.country = "Select your country.";
    const pe = validatePhone(phoneShown);
    if (pe) v.phone = pe;
    setErrs(v);
    if (Object.keys(v).length) return;
    setErr("");
    try {
      // Files go straight to Cloudinary first; the order then just refers to them.
      const all = [...files.map((file) => ({ file, group: "files" as const })), ...feedback.map((file) => ({ file, group: "feedback" as const }))];
      const uploaded: { files: Uploaded[]; feedback: Uploaded[] } = { files: [], feedback: [] };
      for (let i = 0; i < all.length; i++) {
        setBusy(`Uploading file ${i + 1} of ${all.length}…`);
        const up = await uploadToCloudinary(all[i].file, await token(), "order");
        uploaded[all[i].group].push(up);
      }
      setBusy("Creating your order…");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
        body: JSON.stringify({ ...f, whatsapp: phoneToString(phoneShown), country: countryName, selection: sel, currency, files: uploaded.files, feedbackFiles: uploaded.feedback }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      router.push(`/dashboard/orders/${d.order.id}?new=1`);
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

  if (loading) return <Loader variant="inline" />;

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
    <form onSubmit={place} noValidate>
      <h2 className="text-2xl font-semibold">Your details</h2>
      <p className="mt-1 text-muted">Signed in as {user.email}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="b-name">Full name</label>
          <input id="b-name" className={`input !h-11 !py-0 ${errs.name ? "!border-danger" : ""}`} value={f.name} onChange={set("name")} autoComplete="name" />
          {errs.name && <p className="mt-1 text-xs text-danger">{errs.name}</p>}
        </div>
        <div>
          <label className="label">Country</label>
          <CountrySelect value={country} onChange={setCountry} invalid={!!errs.country} />
          {errs.country && <p className="mt-1 text-xs text-danger">{errs.country}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label">WhatsApp number</label>
          <PhoneInput value={phoneShown} onChange={setPhone} invalid={!!errs.phone} />
          {errs.phone && <p className="mt-1 text-xs text-danger">{errs.phone}</p>}
        </div>
        <div><label className="label" htmlFor="b-uni">University</label><input id="b-uni" className="input !h-11 !py-0" value={f.university} onChange={set("university")} /></div>
        <div><label className="label" htmlFor="b-deg">Degree</label><input id="b-deg" className="input !h-11 !py-0" value={f.degree} onChange={set("degree")} placeholder={sel.course} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="b-notes">Supervisor requirements / notes</label><textarea id="b-notes" className="input min-h-28" value={f.notes} onChange={set("notes")} placeholder="Anything we should know: formatting rules, supervisor feedback, topic ideas…" /></div>
      </div>

      {uploadsOn ? (
        <div className="mt-6 space-y-6">
          <FileDropzone label="Helping material (instructions, existing document, guidelines)" hint="Up to 10 files, 10 MB each" files={files} onChange={setFiles} />
          <FileDropzone images label="Previous marks & feedback (photos or screenshots)" hint="Up to 10 images, 10 MB each" files={feedback} onChange={setFeedback} />
        </div>
      ) : (
        <p className="mt-6 rounded-xl bg-brand-soft p-4 text-sm">Have instructions, guidelines, an existing document, or images of your previous marks and feedback? After placing your order, send them on WhatsApp or email with your order ID and we&apos;ll attach them to your order.</p>
      )}

      {err && <p className="mt-4 text-sm text-danger">{err}</p>}
      <button className="btn btn-primary mt-6 w-full sm:w-auto" disabled={!!busy || !firebaseConfigured}>{busy || `Place order · ${money(q.totalGBP)}`}</button>
      {quick}
    </form>
  );
}
