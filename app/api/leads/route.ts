import { NextResponse } from "next/server";
import { adminConfigured, adminDb } from "@/lib/firebase-admin";
import { DISCOUNT_CODE } from "@/lib/catalog";
import { handle } from "@/lib/server";
import { validateEmail } from "@/lib/validation";

export function POST(req: Request) {
  return handle(async () => {
    const b = await req.json().catch(() => ({}));
    const name = String(b.name || "").trim().slice(0, 120);
    const email = String(b.email || "").trim().slice(0, 160);
    const whatsapp = String(b.whatsapp || "").trim().slice(0, 40);
    if (!name || validateEmail(email) || whatsapp.replace(/\D/g, "").length < 7) {
      return NextResponse.json({ error: "Please enter a valid name, email and WhatsApp number." }, { status: 400 });
    }
    if (adminConfigured()) {
      await adminDb().collection("leads").add({ name, email, whatsapp, createdAt: new Date().toISOString() });
    }
    return NextResponse.json({ code: DISCOUNT_CODE });
  });
}
