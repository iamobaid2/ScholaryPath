"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Inbox } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import StatusBadge from "@/components/StatusBadge";
import Loader from "@/components/Loader";
import { useAuth } from "@/components/Providers";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";
import { formatAmount } from "@/lib/pricing";

function Orders() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    token().then((t) => api<{ orders: Order[] }>("/api/orders", t)).then((d) => setOrders(d.orders)).catch((e) => setErr(e.message));
  }, [token]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">My orders</h1>
          <p className="mt-1 text-sm text-muted">{user?.displayName ? `Hi ${user.displayName.split(" ")[0]}, ` : ""}track progress and payments here.</p>
        </div>
        <Link href="/quote" className="btn btn-primary">New quote</Link>
      </div>
      {err && <p className="mt-6 text-danger">{err}</p>}
      {!orders && !err && <Loader variant="inline" label="Loading your orders" />}
      {orders && orders.length === 0 && (
        <div className="card mt-8 grid place-items-center gap-3 p-12 text-center"><Inbox className="text-muted" size={32} /><p className="text-muted">No orders yet.</p><Link href="/quote" className="btn btn-primary">Get your first quote</Link></div>
      )}
      <div className="mt-8 space-y-3">
        {orders?.map((o, i) => (
          <motion.div key={o.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={`/dashboard/orders/${o.id}`} className="card group flex flex-wrap items-center justify-between gap-4 p-5 transition hover:border-brand">
              <div>
                <div className="text-xs font-semibold text-muted">{o.id}</div>
                <div className="font-semibold">{o.serviceLabel}</div>
                <div className="mt-1 text-sm text-muted">{o.selection.course} · {o.eta}</div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge order={o} />
                <div className="font-display text-lg font-semibold">{formatAmount(o.amount, o.currency)}</div>
                <ArrowRight size={18} className="text-muted transition group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export default function Page() { return <RequireAuth><Orders /></RequireAuth>; }
