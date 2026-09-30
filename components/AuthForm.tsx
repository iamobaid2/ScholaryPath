"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { fbAuth, firebaseConfigured } from "@/lib/firebase-client";

function friendly(e: unknown) {
  const code = (e as { code?: string })?.code || "";
  if (code.includes("email-already-in-use")) return "An account with this email already exists. Try signing in.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "Email or password is incorrect.";
  if (code.includes("weak-password")) return "Please use a password with at least 6 characters.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a moment and try again.";
  return "Couldn't sign you in. Please try again.";
}

export default function AuthForm({ onDone, initialMode = "register" }: { onDone?: () => void; initialMode?: "login" | "register" }) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  if (!firebaseConfigured)
    return <p className="rounded-xl bg-brand-soft p-4 text-sm">Accounts aren&apos;t connected yet. Add your Firebase keys to <code>.env.local</code> (see README). You can still send your order on WhatsApp.</p>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setInfo(""); setBusy(true);
    try {
      if (mode === "register") {
        const c = await createUserWithEmailAndPassword(fbAuth(), email, password);
        if (name) await updateProfile(c.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(fbAuth(), email, password);
      }
      onDone?.();
    } catch (e) { setErr(friendly(e)); } finally { setBusy(false); }
  }

  async function reset() {
    if (!email) return setErr("Enter your email first.");
    try { await sendPasswordResetEmail(fbAuth(), email); setInfo("Password reset email sent."); setErr(""); } catch (e) { setErr(friendly(e)); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-1 rounded-full bg-surface-2 p-1 text-sm font-medium">
        {(["register", "login"] as const).map((m) => (
          <button type="button" key={m} onClick={() => { setMode(m); setErr(""); }} className={`flex-1 rounded-full py-2 transition ${mode === m ? "bg-surface shadow text-fg" : "text-muted"}`}>
            {m === "register" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>
      {mode === "register" && <div><label className="label">Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></div>}
      <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
      <div>
        <label className="label">Password</label>
        <div className="relative">
          <input className="input !pr-11" type={show ? "text" : "password"} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} required />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {err && <p className="text-sm text-danger">{err}</p>}
      {info && <p className="text-sm text-ok">{info}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
      {mode === "login" && <button type="button" onClick={reset} className="block w-full text-center text-sm text-muted hover:text-fg">Forgot password?</button>}
    </form>
  );
}
