import { NextResponse } from "next/server";
import { adminConfigured, adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireClient } from "@/lib/server";
import type { PublicReview, Review } from "@/lib/public-types";

export const dynamic = "force-dynamic";

/** "Ada Lovelace" → "Ada L." so a published review never carries a full name. */
function shortName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Client";
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** Approved reviews, for the public site. */
export async function GET() {
  if (!adminConfigured()) return NextResponse.json({ reviews: [], average: 0, count: 0 });
  try {
    const snap = await adminDb().collection("reviews").where("status", "==", "approved").get();
    const all = snap.docs.map((d) => d.data() as Review).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const reviews: PublicReview[] = all.slice(0, 30).map((r) => ({ id: r.id, name: r.name, rating: r.rating, comment: r.comment, createdAt: r.createdAt }));
    const average = all.length ? Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10 : 0;
    return NextResponse.json({ reviews, average, count: all.length }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ reviews: [], average: 0, count: 0 });
  }
}

/** One review per account. Saving again edits it and sends it back for approval. */
export function POST(req: Request) {
  return handle(async () => {
    const u = await requireClient(req);
    const b = await req.json().catch(() => ({}));
    const rating = Number(b.rating);
    const comment = String(b.comment ?? "").trim().replace(/\s+/g, " ").slice(0, 600);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "Choose a rating from 1 to 5.");
    if (comment.length < 10) throw new HttpError(400, "Please write at least a sentence.");

    const db = adminDb();
    const profile = (await db.collection("users").doc(u.uid).get()).data() as { name?: string } | undefined;
    const name = shortName(profile?.name || u.email.split("@")[0]);
    const ref = db.collection("reviews").doc(u.uid);
    const existing = (await ref.get()).data() as Review | undefined;
    const now = new Date().toISOString();
    const review: Review = {
      id: u.uid,
      uid: u.uid,
      name,
      rating,
      comment,
      status: "pending",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await ref.set(review);
    return NextResponse.json({ review });
  });
}
