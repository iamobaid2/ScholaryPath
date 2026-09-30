import { NextResponse } from "next/server";
import { adminBucket } from "@/lib/firebase-admin";
import { handle, requireAdmin } from "@/lib/server";
import { getOrder } from "@/lib/orders-server";

export function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    await requireAdmin(req);
    const { id } = await params;
    const order = await getOrder(id);
    const files = await Promise.all(
      order.files.map(async (f) => {
        try {
          const [url] = await adminBucket().file(f.path).getSignedUrl({ action: "read", expires: Date.now() + 15 * 60 * 1000 });
          return { name: f.name, size: f.size, url };
        } catch {
          return { name: f.name, size: f.size, url: null };
        }
      })
    );
    return NextResponse.json({ files });
  });
}
