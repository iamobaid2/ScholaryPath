import { NextResponse } from "next/server";
import { adminConfigured, adminDb } from "@/lib/firebase-admin";
import type { ShowcaseItem } from "@/lib/public-types";

export const dynamic = "force-dynamic";

/** The public showcase: students' marks, assignments, projects, documentation and dissertations. */
export async function GET() {
  if (!adminConfigured()) return NextResponse.json({ items: [] });
  try {
    const snap = await adminDb().collection("showcase").get();
    const items = snap.docs.map((d) => d.data() as ShowcaseItem).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ items }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ items: [] });
  }
}
