import { NextResponse } from "next/server";
import { cloudinaryConfigured } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

/**
 * Whether file uploads are available. Answered by the server from its own configuration, so it is
 * always right; a NEXT_PUBLIC_ variable is frozen into the build and goes stale on the host.
 */
export function GET() {
  return NextResponse.json({ enabled: cloudinaryConfigured() });
}
