import "server-only";
import { adminDb } from "./firebase-admin";
import { HttpError } from "./server";
import { STAGES, type StageId } from "./catalog";
import type { Order } from "./types";
import { notifyPaid } from "./mailer";

export async function getOrder(id: string): Promise<Order> {
  const snap = await adminDb().collection("orders").doc(id).get();
  if (!snap.exists) throw new HttpError(404, "Order not found.");
  return snap.data() as Order;
}

const idx = (s: StageId) => STAGES.findIndex((x) => x.id === s);

export async function setStage(id: string, stage: StageId) {
  const o = await getOrder(id);
  const timeline = o.timeline.filter((t) => t.stage !== stage);
  timeline.push({ stage, at: new Date().toISOString() });
  await adminDb().collection("orders").doc(id).update({ stage, timeline });
}

export async function markPaid(id: string) {
  const o = await getOrder(id);
  if (o.paid) return;
  const timeline = [...o.timeline, { stage: "payment" as StageId, at: new Date().toISOString() }];
  const stage = idx(o.stage) < idx("payment") ? "payment" : o.stage;
  await adminDb().collection("orders").doc(id).update({ paid: true, stage, timeline });
  await notifyPaid({ ...o, paid: true, stage, timeline });
}
