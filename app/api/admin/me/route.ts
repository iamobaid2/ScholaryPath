import { NextResponse } from "next/server";
import { handle, requireAdmin } from "@/lib/server";

export function GET(req: Request) {
  return handle(async () => {
    const u = await requireAdmin(req);
    return NextResponse.json({ admin: true, email: u.email });
  });
}
