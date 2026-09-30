import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireAdmin } from "@/lib/server";
import { getOrder, markPaid, setStage } from "@/lib/orders-server";
import { STAGES, type StageId } from "@/lib/catalog";

export function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin(req);
    const { id } = await params;
    await getOrder(id);
    const b = await req.json().catch(() => ({}));
    if (b.paid === true) await markPaid(id);
    if (b.stage) {
      if (!STAGES.some((s) => s.id === b.stage)) throw new HttpError(400, "Unknown stage.");
      await setStage(id, b.stage as StageId);
    }
    if (typeof b.adminNote === "string") await adminDb().collection("orders").doc(id).update({ adminNote: b.adminNote.slice(0, 2000) });
    return NextResponse.json({ order: await getOrder(id) });
  });
}
