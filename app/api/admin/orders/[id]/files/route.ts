import { NextResponse } from "next/server";
import { privateUrl } from "@/lib/cloudinary";
import { adminBucket } from "@/lib/firebase-admin";
import { handle, requireAdmin } from "@/lib/server";
import { getOrder } from "@/lib/orders-server";

export function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin(req);
    const { id } = await params;
    const order = await getOrder(id);
    const files = await Promise.all(
      [...order.files.map((f) => ({ ...f, kind: "file" })), ...(order.feedbackFiles ?? []).map((f) => ({ ...f, kind: "feedback" }))].map(async (f) => {
        try {
          if (f.publicId) return { name: f.name, size: f.size, kind: f.kind, url: privateUrl(f.publicId, f.resourceType || "image") };
          // Orders placed before Cloudinary kept their files in Firebase Storage.
          const [url] = await adminBucket().file(f.path!).getSignedUrl({ action: "read", expires: Date.now() + 15 * 60 * 1000 });
          return { name: f.name, size: f.size, kind: f.kind, url };
        } catch {
          return { name: f.name, size: f.size, kind: f.kind, url: null };
        }
      })
    );
    return NextResponse.json({ files });
  });
}
