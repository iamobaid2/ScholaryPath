import "server-only";
import nodemailer from "nodemailer";
import { adminEmails } from "./server";
import type { Order } from "./types";
import { BRAND } from "./catalog";

function transport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

async function send(to: string | string[], subject: string, text: string) {
  const t = transport();
  const list = Array.isArray(to) ? to : [to];
  if (!t || !list.length) {
    console.log(`[mail not sent – SMTP not configured] to=${list.join(",")} subject="${subject}"\n${text}`);
    return;
  }
  try {
    await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: list, subject, text });
  } catch (e) {
    console.error("Mail failed", e);
  }
}

const summary = (o: Order) =>
  [
    `Order ID: ${o.id}`,
    `Service: ${o.serviceLabel}`,
    `Level: ${o.levelLabel}`,
    `Subject: ${o.selection.course}`,
    o.words ? `Words: ${o.words.toLocaleString("en")}` : null,
    `Complexity: ${o.selection.complexity}`,
    `Deadline: ${o.eta}`,
    `Amount: ${o.amount} ${o.currency} (£${o.totalGBP} GBP)`,
    `Files: ${o.files.length ? o.files.map((f) => f.name).join(", ") : "none"}`,
  ]
    .filter(Boolean)
    .join("\n");

export async function notifyNewOrder(o: Order) {
  const to = process.env.ADMIN_NOTIFY_EMAIL ? [process.env.ADMIN_NOTIFY_EMAIL] : adminEmails();
  await send(
    to,
    `New Order Received – ${o.id}`,
    `New Order Received\n\n${summary(o)}\n\nClient: ${o.name}\nEmail: ${o.email}\nWhatsApp: ${o.whatsapp}\nCountry: ${o.country}\nUniversity: ${o.university}\nDegree: ${o.degree}\nNotes: ${o.notes || "-"}`
  );
  await send(
    o.email,
    `${BRAND} – we received your order ${o.id}`,
    `Hi ${o.name},\n\nThanks for your order. Here is your summary:\n\n${summary(o)}\n\nYou can pay and track progress any time from your dashboard.\n\n– ${BRAND}`
  );
}

export async function notifyPaid(o: Order) {
  const to = process.env.ADMIN_NOTIFY_EMAIL ? [process.env.ADMIN_NOTIFY_EMAIL] : adminEmails();
  await send(to, `Payment received – ${o.id}`, `Payment confirmed for ${o.id}.\n\n${summary(o)}`);
  await send(o.email, `${BRAND} – payment confirmed for ${o.id}`, `Hi ${o.name},\n\nWe've received your payment for order ${o.id}. Your expert will be assigned shortly.\n\n– ${BRAND}`);
}
