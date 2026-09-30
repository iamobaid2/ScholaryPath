import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Temporary diagnostics: reports runtime + whether the Firebase Admin SDK loads. No secrets are returned.
export async function GET() {
  const out: Record<string, unknown> = {
    node: process.version,
    env: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      keyStartsWith: (process.env.FIREBASE_PRIVATE_KEY || "").slice(0, 12),
      keyHasRealNewlines: (process.env.FIREBASE_PRIVATE_KEY || "").includes("\n"),
      keyHasEscapedNewlines: (process.env.FIREBASE_PRIVATE_KEY || "").includes("\\n"),
    },
  };
  for (const mod of ["firebase-admin/app", "firebase-admin/auth", "firebase-admin/firestore"]) {
    try {
      await import(mod);
      out[mod] = "ok";
    } catch (e) {
      out[mod] = String((e as Error)?.message || e).slice(0, 400);
    }
  }
  try {
    const { adminConfigured, adminDb } = await import("@/lib/firebase-admin");
    out.configured = adminConfigured();
    if (adminConfigured()) {
      await adminDb().collection("config").doc("pricing").get();
      out.firestore = "ok";
    }
  } catch (e) {
    out.firestore = String((e as Error)?.message || e).slice(0, 400);
  }
  return NextResponse.json(out);
}
