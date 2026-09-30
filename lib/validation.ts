import { countryByIso } from "./countries";

// ---------- email ----------
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmail.con": "gmail.com", "gmail.co": "gmail.com", "gamil.com": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmail.con": "hotmail.com", "yahho.com": "yahoo.com", "yaho.com": "yahoo.com", "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com", "outlook.con": "outlook.com", "iclod.com": "icloud.com",
};

export function validateEmail(v: string): string {
  const e = v.trim();
  if (!e) return "Email is required.";
  if (e.length > 160 || e.includes("..") || !EMAIL_RE.test(e)) return "Enter a valid email address.";
  const fix = TYPOS[e.split("@")[1].toLowerCase()];
  if (fix) return `Did you mean ${e.split("@")[0]}@${fix}?`;
  return "";
}

// ---------- password ----------
export const PASSWORD_RULES = [
  { id: "len", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "An uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "A lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "num", label: "A number", test: (p: string) => /\d/.test(p) },
  { id: "sym", label: "A special character (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];
const COMMON = ["password", "password1", "12345678", "123456789", "qwerty123", "iloveyou", "admin123", "welcome1", "letmein1", "abc12345"];

export function passwordIssue(p: string, email = "", name = ""): string {
  if (!PASSWORD_RULES.every((r) => r.test(p))) return "Password doesn't meet all the requirements.";
  if (p.length > 64) return "Password is too long (max 64 characters).";
  if (COMMON.some((c) => p.toLowerCase().includes(c))) return "That password is too common. Choose something less guessable.";
  const local = email.split("@")[0].toLowerCase();
  if (local.length >= 4 && p.toLowerCase().includes(local)) return "Password shouldn't contain your email name.";
  const first = name.trim().split(" ")[0].toLowerCase();
  if (first.length >= 4 && p.toLowerCase().includes(first)) return "Password shouldn't contain your name.";
  return "";
}

/** 0–4 */
export function passwordScore(p: string): number {
  if (!p) return 0;
  const met = PASSWORD_RULES.filter((r) => r.test(p)).length;
  let s = met <= 2 ? 1 : met === 3 ? 1 : met === 4 ? 2 : 3;
  if (met === 5 && p.length >= 12) s = 4;
  if (COMMON.some((c) => p.toLowerCase().includes(c))) s = Math.min(s, 1);
  return s;
}

// ---------- phone ----------
export type Phone = { iso: string; number: string };
export const digitsOf = (n: string) => n.replace(/\D/g, "").replace(/^0+/, "");

export function validatePhone(p: Phone): string {
  if (!p.iso) return "Choose a country code.";
  const d = digitsOf(p.number);
  if (!d) return "Phone number is required.";
  if (d.length < 6 || d.length > 13) return "Enter a valid phone number.";
  return "";
}

export function phoneToString(p: Phone): string {
  const c = countryByIso(p.iso);
  return `+${c?.dial ?? ""} ${digitsOf(p.number)}`.trim();
}
