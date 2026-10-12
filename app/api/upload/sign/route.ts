import { NextResponse } from "next/server";
import { cloudinaryConfigured, signUpload } from "@/lib/cloudinary";
import { handle, HttpError, requireAdmin, requireClient } from "@/lib/server";

/** Signs a direct-to-Cloudinary upload. Clients may upload to their own order folder; only admins to the showcase. */
export function POST(req: Request) {
  return handle(async () => {
    if (!cloudinaryConfigured()) throw new HttpError(503, "File uploads aren't set up yet. Please send your files on WhatsApp for now.");
    const b = await req.json().catch(() => ({}));
    if (b.purpose === "showcase") {
      await requireAdmin(req);
      return NextResponse.json(signUpload("scholarlypath/showcase", "upload"));
    }
    const u = await requireClient(req);
    return NextResponse.json(signUpload(`scholarlypath/orders/${u.uid}`, "authenticated"));
  });
}
