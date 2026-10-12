import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, requireAdmin } from "@/lib/server";
import type { Review } from "@/lib/public-types";

export function GET(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const snap = await adminDb().collection("reviews").get();
    const reviews = snap.docs.map((d) => d.data() as Review).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json({ reviews });
  });
}
