import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, requireClient } from "@/lib/server";
import type { Review } from "@/lib/public-types";

export function GET(req: Request) {
  return handle(async () => {
    const u = await requireClient(req);
    const review = (await adminDb().collection("reviews").doc(u.uid).get()).data() as Review | undefined;
    return NextResponse.json({ review: review ?? null });
  });
}
