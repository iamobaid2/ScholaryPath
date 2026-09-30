import { NextResponse } from "next/server";
import { handle, HttpError, requireClient } from "@/lib/server";
import { getOrder } from "@/lib/orders-server";

export function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const u = await requireClient(req);
    const { id } = await params;
    const order = await getOrder(id);
    if (order.uid !== u.uid) throw new HttpError(404, "Order not found.");
    return NextResponse.json({ order });
  });
}
