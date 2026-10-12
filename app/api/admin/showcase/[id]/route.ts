import { NextResponse } from "next/server";
import { cloudinaryConfigured, deleteAsset } from "@/lib/cloudinary";
import { adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireAdmin } from "@/lib/server";
import type { ShowcaseItem } from "@/lib/public-types";

export function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin(req);
    const { id } = await params;
    const ref = adminDb().collection("showcase").doc(id);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpError(404, "Not found.");
    const item = snap.data() as ShowcaseItem;
    await ref.delete();
    if (cloudinaryConfigured()) {
      if (item.imagePublicId) await deleteAsset(item.imagePublicId, "image", "upload");
      if (item.filePublicId) await deleteAsset(item.filePublicId, item.fileResourceType || "image", "upload");
    }
    return NextResponse.json({ ok: true });
  });
}
