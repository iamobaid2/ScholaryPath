"use client";
import { useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { fbAuth, firebaseConfigured } from "@/lib/firebase-client";
import { PASSWORD_RULES, passwordIssue, passwordScore, validateEmail, validatePhone, type Phone } from "@/lib/validation";
import CountrySelect from "./ui/CountrySelect";
import PhoneInput from "./ui/PhoneInput";
import useRegion from "./ui/useRegion";

function friendly(e: unknown) {
  const code = (e as { code?: string })?.code || "";
  if (code.includes("email-already-in-use")) return "An account with this email already exists. Try signing in.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email or password is incorrect.";
  if (code.includes("weak-password")) return "Please choose a stronger password.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  if (code.includes("network")) return "Network problem. Check your connection and try again.";
  return "Couldn't complete that. Please try again.";
}

const STRENGTH = [
  { label: "", color: "bg-line" },
  { label: "Weak", color: "bg-danger" },
  { label: "Fair", color: "bg-brand-2" },
  { label: "Good", color: "bg-brand" },
  { label: "Strong", color: "bg-ok" },
];

function PasswordField({ label, value, onChange, autoComplete, error, id }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string; error?: string; id: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} className={`input !h-11 !py-0 !pr-11 ${error ? "!border-danger" : ""}`} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} maxLength={64} aria-invalid={!!error} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

export default function AuthForm({ onDone, initialMode = "register" }: { onDone?: () => void; initialMode?: "login" | "register" }) {
  const region = useRegion();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "" });
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState<Phone>({ iso: "", number: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  if (!firebaseConfigured)
    return <p className="rounded-xl bg-brand-soft p-4 text-sm">Accounts aren&apos;t connected yet. Add your Firebase keys to <code>.env.local</code> (see README). You can still send your order on WhatsApp.</p>;

  const phoneShown: Phone = { iso: phone.iso || country || region, number: phone.number };
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const register = mode === "register";
  const score = passwordScore(f.password);

  function validate() {
    const e: Record<string, string> = {};
    if (register) {
      if (f.name.trim().length < 2) e.name = "Enter your full name.";
      if (!country) e.country = "Select your country.";
      const pe = validatePhone(phoneShown);
      if (pe) e.phone = pe;
    }
    const ee = validateEmail(f.email);
    if (ee) e.email = ee;
    if (register) {
      const pi = passwordIssue(f.password, f.email, f.name);
      if (pi) e.password = pi;
      if (f.confirm !== f.password) e.confirm = "Passwords don't match.";
    } else if (!f.password) e.password = "Enter your password.";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    setErr(""); setInfo("");
    if (!validate()) return;
    setBusy(true);
    try {
      if (register) {
        const c = await createUserWithEmailAndPassword(fbAuth(), f.email.trim(), f.password);
        await updateProfile(c.user, { displayName: f.name.trim() });
        sendEmailVerification(c.user).catch(() => {});
        const token = await c.user.getIdToken();
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: f.name.trim(), country, phoneIso: phoneShown.iso, phone: phoneShown.number }),
        }).catch(() => {});
      } else {
        await signInWithEmailAndPassword(fbAuth(), f.email.trim(), f.password);
      }
      onDone?.();
    } catch (e) { setErr(friendly(e)); } finally { setBusy(false); }
  }

  async function reset() {
    const ee = validateEmail(f.email);
    if (ee) { setErrs({ email: ee }); return; }
    try { await sendPasswordResetEmail(fbAuth(), f.email.trim()); setInfo("If an account exists for that email, a reset link is on its way."); setErr(""); } catch (e) { setErr(friendly(e)); }
  }

  const fieldErr = (k: string) => errs[k] && <p className="mt-1 text-xs text-danger">{errs[k]}</p>;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="flex gap-1 rounded-lg bg-surface-2 p-1 text-sm font-medium">
        {(["register", "login"] as const).map((m) => (
          <button type="button" key={m} onClick={() => { setMode(m); setErr(""); setErrs({}); setInfo(""); }} className={`flex-1 rounded-md py-2 transition ${mode === m ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"}`}>
            {m === "register" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      {register && (
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" className={`input !h-11 !py-0 ${errs.name ? "!border-danger" : ""}`} value={f.name} onChange={(e) => set("name")(e.target.value)} autoComplete="name" maxLength={120} />
          {fieldErr("name")}
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" className={`input !h-11 !py-0 ${errs.email ? "!border-danger" : ""}`} type="email" inputMode="email" value={f.email} onChange={(e) => set("email")(e.target.value)} onBlur={() => f.email && setErrs((s) => ({ ...s, email: validateEmail(f.email) }))} autoComplete="email" maxLength={160} />
        {fieldErr("email")}
      </div>

      {register && (
        <>
          <div>
            <label className="label">Country</label>
            <CountrySelect value={country} onChange={setCountry} invalid={!!errs.country} />
            {fieldErr("country")}
          </div>
          <div>
            <label className="label">Phone / WhatsApp number</label>
            <PhoneInput value={phoneShown} onChange={setPhone} invalid={!!errs.phone} />
            {fieldErr("phone")}
          </div>
        </>
      )}

      <PasswordField id="password" label="Password" value={f.password} onChange={set("password")} autoComplete={register ? "new-password" : "current-password"} error={errs.password} />

      {register && f.password && (
        <div className="-mt-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((i) => (<span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? STRENGTH[score].color : "bg-line"}`} />))}</div>
            <span className="w-12 text-right text-xs font-medium text-muted">{STRENGTH[score].label}</span>
          </div>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
            {PASSWORD_RULES.map((r) => {
              const ok = r.test(f.password);
              return (
                <li key={r.id} className={`flex items-center gap-1.5 ${ok ? "text-ok" : "text-muted"}`}>
                  {ok ? <Check size={13} /> : <X size={13} />} {r.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {register && <PasswordField id="confirm" label="Confirm password" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" error={errs.confirm} />}

      {err && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{err}</p>}
      {info && <p className="rounded-lg bg-ok/10 px-3 py-2 text-sm text-ok">{info}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : register ? "Create account" : "Sign in"}</button>
      {!register && <button type="button" onClick={reset} className="block w-full text-center text-sm text-muted hover:text-fg">Forgot password?</button>}
      {register && <p className="text-center text-xs text-muted">We&apos;ll send a verification link to your email.</p>}
    </form>
  );
}
