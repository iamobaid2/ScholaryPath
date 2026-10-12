import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireAdmin } from "@/lib/server";

export function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin(req);
    const { id } = await params;
    const b = await req.json().catch(() => ({}));
    if (!["approved", "rejected", "pending"].includes(b.status)) throw new HttpError(400, "Unknown status.");
    const ref = adminDb().collection("reviews").doc(id);
    if (!(await ref.get()).exists) throw new HttpError(404, "Review not found.");
    await ref.update({ status: b.status });
    return NextResponse.json({ ok: true });
  });
}

export function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin(req);
    const { id } = await params;
    await adminDb().collection("reviews").doc(id).delete();
    return NextResponse.json({ ok: true });
  });
}
