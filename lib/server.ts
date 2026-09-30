import "server-only";
import { NextResponse } from "next/server";
import { adminAuth, adminConfigured } from "./firebase-admin";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function handle(fn: () => Promise<Response>) {
  return fn().catch((e) => {
    if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  });
}

export function requireConfigured() {
  if (!adminConfigured()) throw new HttpError(503, "The server is not connected to Firebase yet. Add the Firebase keys to .env.local (see README).");
}

export function adminEmails() {
  return (process.env.ADMIN_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

export async function requireUser(req: Request) {
  requireConfigured();
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) throw new HttpError(401, "Please sign in first.");
  try {
    const d = await adminAuth().verifyIdToken(token);
    return { uid: d.uid, email: (d.email || "").toLowerCase(), emailVerified: !!d.email_verified };
  } catch {
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }
}

export async function requireAdmin(req: Request) {
  const u = await requireUser(req);
  if (!adminEmails().includes(u.email)) throw new HttpError(403, "Admin access only.");
  return u;
}

// Client-side endpoints are not available to admin accounts (and vice-versa via requireAdmin).
export async function requireClient(req: Request) {
  const u = await requireUser(req);
  if (adminEmails().includes(u.email)) throw new HttpError(403, "Admin accounts can't use client features.");
  return u;
}
