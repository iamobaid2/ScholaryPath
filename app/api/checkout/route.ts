import { NextResponse } from "next/server";
import Stripe from "stripe";
import { handle, HttpError, requireClient } from "@/lib/server";
import { getOrder } from "@/lib/orders-server";
import { BRAND } from "@/lib/catalog";

// Stripe can't settle in PKR for most accounts, so PKR orders are charged in GBP.
const STRIPE_CURRENCIES = ["GBP", "AUD", "USD", "EUR", "CAD", "NZD", "AED"];

export function POST(req: Request) {
  return handle(async () => {
    const u = await requireClient(req);
    if (!process.env.STRIPE_SECRET_KEY) throw new HttpError(503, "Online payment isn't set up yet. Please pay via WhatsApp for now.");
    const { orderId } = await req.json().catch(() => ({}));
    const order = await getOrder(String(orderId || ""));
    if (order.uid !== u.uid) throw new HttpError(404, "Order not found.");
    if (order.paid) throw new HttpError(400, "This order is already paid.");

    const useOrderCurrency = STRIPE_CURRENCIES.includes(order.currency);
    const currency = useOrderCurrency ? order.currency : "GBP";
    const amount = useOrderCurrency ? order.amount : order.totalGBP;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: Math.round(amount * 100),
            product_data: { name: `${BRAND} – ${order.serviceLabel}`, description: `Order ${order.id}` },
          },
        },
      ],
      success_url: `${origin}/dashboard/orders/${order.id}?paid=1`,
      cancel_url: `${origin}/dashboard/orders/${order.id}`,
    });
    return NextResponse.json({ url: session.url });
  });
}
