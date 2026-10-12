import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireClient } from "@/lib/server";
import { CURRENCIES, LEVELS, COMPLEXITY, DEADLINES, findOption, type Currency } from "@/lib/catalog";
import { asksDocumentation, calculate, convert, isWeekTimeline, mergePricing, needsWords, type Item, type Selection } from "@/lib/pricing";
import type { Order, OrderFile } from "@/lib/types";
import { notifyNewOrder } from "@/lib/mailer";

const str = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);

export function GET(req: Request) {
  return handle(async () => {
    const u = await requireClient(req);
    const snap = await adminDb().collection("orders").where("uid", "==", u.uid).get();
    const orders = snap.docs.map((d) => d.data() as Order).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return NextResponse.json({ orders });
  });
}

export function POST(req: Request) {
  return handle(async () => {
    const u = await requireClient(req);
    const b = await req.json().catch(() => null);
    if (!b) throw new HttpError(400, "Invalid request.");

    const s = b.selection ?? {};
    const rawItems: unknown[] = Array.isArray(s.items) ? s.items.slice(0, 8) : [];
    const items: Item[] = rawItems.map((r) => {
      const x = (r ?? {}) as Record<string, unknown>;
      return {
        service: str(x.service, 60),
        wordIndex: Number.isInteger(x.wordIndex) ? (x.wordIndex as number) : null,
        complexity: str(x.complexity, 30),
        deadline: str(x.deadline, 30),
        documentation: x.documentation === "yes" || x.documentation === "no" ? x.documentation : "",
      };
    });
    const sel: Selection = { level: str(s.level, 30), course: str(s.course, 120), items, code: str(s.code, 30) };
    if (!items.length || !LEVELS.some((l) => l.id === sel.level) || !sel.course) throw new HttpError(400, "Your quote is incomplete.");
    for (const it of items) {
      const opt = findOption(it.service);
      if (!opt || !COMPLEXITY.some((c) => c.id === it.complexity)) throw new HttpError(400, "Your quote is incomplete.");
      const dl = DEADLINES.find((d) => d.id === it.deadline);
      if (!dl || (dl.group === "weeks") !== isWeekTimeline(it.service)) throw new HttpError(400, "Please choose a valid deadline.");
      if (asksDocumentation(it.service) && !it.documentation) throw new HttpError(400, "Please say whether you need documentation.");
      if (needsWords(it.service, it.documentation) && it.wordIndex === null) throw new HttpError(400, "Please choose a word count.");
    }

    const currency: Currency = CURRENCIES.includes(b.currency) ? b.currency : "GBP";

    const name = str(b.name, 120), whatsapp = str(b.whatsapp, 40), country = str(b.country, 80);
    if (!name || !country || whatsapp.replace(/\D/g, "").length < 7) throw new HttpError(400, "Please complete your name, WhatsApp and country.");

    const db = adminDb();
    const pricingDoc = (await db.collection("config").doc("pricing").get()).data();
    const cfg = mergePricing(pricingDoc);
    const q = calculate(sel, cfg);
    if (!q.ok) throw new HttpError(400, "Your quote is incomplete.");

    // Sequential order id: EDU + year + 4-digit counter
    const counterRef = db.collection("meta").doc("counters");
    const n = await db.runTransaction(async (t) => {
      const cur = ((await t.get(counterRef)).data()?.orders as number) || 0;
      t.set(counterRef, { orders: cur + 1 }, { merge: true });
      return cur + 1;
    });
    const id = `EDU${new Date().getFullYear()}${String(n).padStart(4, "0")}`;

    // Files were already uploaded straight to Cloudinary by the browser. Only accept ones from this
    // client's own folder, so an order can't claim somebody else's upload.
    const prefix = `scholarlypath/orders/${u.uid}/`;
    const toFiles = (list: unknown, max: number): OrderFile[] =>
      (Array.isArray(list) ? list : [])
        .slice(0, max)
        .filter((f: { publicId?: string }) => typeof f?.publicId === "string" && f.publicId.startsWith(prefix))
        .map((f: { name?: string; size?: number; publicId: string; resourceType?: string }) => ({
          name: str(f.name, 120) || "file",
          size: Number(f.size) || 0,
          publicId: f.publicId,
          resourceType: ["image", "raw", "video"].includes(String(f.resourceType)) ? String(f.resourceType) : "image",
        }));
    const files = toFiles(b.files, 15);
    // Images of earlier marks and tutor feedback, kept apart from the brief itself.
    const feedbackFiles = toFiles(b.feedbackFiles, 10);

    const now = new Date().toISOString();
    const order: Order = {
      id,
      uid: u.uid,
      email: u.email,
      name,
      whatsapp,
      country,
      university: str(b.university, 160),
      degree: str(b.degree, 160),
      notes: str(b.notes, 2000),
      selection: sel,
      levelLabel: LEVELS.find((l) => l.id === sel.level)!.label,
      serviceLabel: q.lines.map((l) => l.label).join(" + "),
      words: q.words,
      eta: q.eta,
      currency,
      amount: convert(q.totalGBP, currency, cfg),
      totalGBP: q.totalGBP,
      discountGBP: q.discount,
      stage: "received",
      paid: false,
      timeline: [{ stage: "received", at: now }],
      files,
      feedbackFiles,
      createdAt: now,
    };
    await db.collection("orders").doc(id).set(order);
    await notifyNewOrder(order);
    return NextResponse.json({ order });
  });
}
