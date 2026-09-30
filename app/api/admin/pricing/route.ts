import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireAdmin } from "@/lib/server";
import { mergePricing } from "@/lib/pricing";

export function GET(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const stored = (await adminDb().collection("config").doc("pricing").get()).data();
    return NextResponse.json({ config: mergePricing(stored) });
  });
}

export function PUT(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const b = await req.json().catch(() => null);
    if (!b?.config || typeof b.config !== "object") throw new HttpError(400, "Invalid pricing.");
    const cfg = mergePricing(b.config); // fills gaps, keeps shape
    const nums = JSON.stringify(cfg).match(/:(-?[\d.]+)/g) || [];
    if (nums.some((n) => !isFinite(Number(n.slice(1))) || Number(n.slice(1)) < 0)) throw new HttpError(400, "Prices must be non-negative numbers.");
    await adminDb().collection("config").doc("pricing").set(cfg);
    return NextResponse.json({ config: cfg });
  });
}
