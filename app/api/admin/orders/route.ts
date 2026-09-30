import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, requireAdmin } from "@/lib/server";
import type { Order } from "@/lib/types";

export function GET(req: Request) {
  return handle(async () => {
    await requireAdmin(req);
    const snap = await adminDb().collection("orders").get();
    const orders = snap.docs.map((d) => d.data() as Order).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ orders });
  });
}
