import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireUser } from "@/lib/server";
import { countryByIso } from "@/lib/countries";

export type Profile = { name: string; country: string; phoneIso: string; phone: string };

export function GET(req: Request) {
  return handle(async () => {
    const u = await requireUser(req);
    const d = (await adminDb().collection("users").doc(u.uid).get()).data() as Profile | undefined;
    return NextResponse.json({ profile: d ?? null });
  });
}

export function PUT(req: Request) {
  return handle(async () => {
    const u = await requireUser(req);
    const b = await req.json().catch(() => ({}));
    const name = String(b.name ?? "").trim().slice(0, 120);
    const country = String(b.country ?? "");
    const phoneIso = String(b.phoneIso ?? "");
    const phone = String(b.phone ?? "").replace(/\D/g, "").slice(0, 13);
    if (name.length < 2 || !countryByIso(country) || !countryByIso(phoneIso) || phone.length < 6)
      throw new HttpError(400, "Please complete your name, country and phone number.");
    const profile: Profile = { name, country, phoneIso, phone };
    await adminDb().collection("users").doc(u.uid).set({ ...profile, email: u.email, updatedAt: new Date().toISOString() }, { merge: true });
    return NextResponse.json({ profile });
  });
}
