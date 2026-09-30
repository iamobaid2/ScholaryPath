import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markPaid } from "@/lib/orders-server";
import { handle, HttpError, requireConfigured } from "@/lib/server";

export function POST(req: Request) {
  return handle(async () => {
    requireConfigured();
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) throw new HttpError(503, "Stripe webhook not configured.");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers.get("stripe-signature") || "";
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      throw new HttpError(400, "Invalid signature.");
    }
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.payment_status === "paid" && s.metadata?.orderId) await markPaid(s.metadata.orderId);
    }
    return NextResponse.json({ received: true });
  });
}
