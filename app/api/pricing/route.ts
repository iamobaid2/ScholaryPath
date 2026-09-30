import { NextResponse } from "next/server";
import { adminConfigured, adminDb } from "@/lib/firebase-admin";
import { mergePricing } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  let stored = null;
  if (adminConfigured()) {
    try {
      stored = (await adminDb().collection("config").doc("pricing").get()).data() ?? null;
    } catch (e) {
      console.error(e);
    }
  }
  return NextResponse.json({ config: mergePricing(stored) });
}
