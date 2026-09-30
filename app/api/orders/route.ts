import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { handle, HttpError, requireClient } from "@/lib/server";
import { CURRENCIES, LEVELS, COMPLEXITY, DEADLINES, findOption, type Currency } from "@/lib/catalog";
import { calculate, convert, isWeekTimeline, mergePricing, needsWords, type Selection } from "@/lib/pricing";
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
    const sel: Selection = {
      level: str(s.level, 30),
      course: str(s.course, 120),
      service: str(s.service, 60),
      wordIndex: Number.isInteger(s.wordIndex) ? s.wordIndex : null,
      complexity: str(s.complexity, 30),
      deadline: str(s.deadline, 30),
      extras: Array.isArray(s.extras) ? s.extras.map((x: unknown) => str(x, 30)).slice(0, 20) : [],
      code: str(s.code, 30),
    };
    const opt = findOption(sel.service);
    if (!opt || !LEVELS.some((l) => l.id === sel.level) || !COMPLEXITY.some((c) => c.id === sel.complexity) || !sel.course)
      throw new HttpError(400, "Your quote is incomplete.");
    const dl = DEADLINES.find((d) => d.id === sel.deadline);
    if (!dl || (dl.group === "weeks") !== isWeekTimeline(sel.service)) throw new HttpError(400, "Please choose a valid deadline.");
    if (needsWords(sel.service) && sel.wordIndex === null) throw new HttpError(400, "Please choose a word count.");

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

    const files: OrderFile[] = (Array.isArray(b.files) ? b.files : []).slice(0, 15).map((f: { name?: string; size?: number }, i: number) => {
      const safe = str(f.name, 120).replace(/[^\w.\- ]+/g, "_") || "file";
      return { name: str(f.name, 120) || "file", size: Number(f.size) || 0, path: `orders/${u.uid}/${id}/${i}-${safe}` };
    });

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
      serviceLabel: opt.label,
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
      createdAt: now,
    };
    await db.collection("orders").doc(id).set(order);
    await notifyNewOrder(order);
    return NextResponse.json({ order });
  });
}
