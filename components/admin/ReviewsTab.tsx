"use client";
import { useCallback, useEffect, useState } from "react";
import { Check, Star, Trash2, X } from "lucide-react";
import { useAuth, useContent } from "../Providers";
import Loader from "../Loader";
import { api } from "@/lib/api";
import type { Review, ReviewStatus } from "@/lib/public-types";

const FILTERS: [ReviewStatus | "all", string][] = [["pending", "Needs approval"], ["approved", "Published"], ["rejected", "Rejected"], ["all", "All"]];
const TONE: Record<ReviewStatus, string> = { pending: "bg-brand-2/15 text-brand-2", approved: "bg-ok/10 text-ok", rejected: "bg-danger/10 text-danger" };

export default function ReviewsTab() {
  const { token } = useAuth();
  const { refresh } = useContent();
  const [reviews, setReviews] = useState<Review[] | undefined>(undefined);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [err, setErr] = useState("");

  const load = useCallback(() => {
    token().then((t) => api<{ reviews: Review[] }>("/api/admin/reviews", t)).then((d) => setReviews(d.reviews)).catch((e) => setErr(e.message));
  }, [token]);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: ReviewStatus) {
    try { await api(`/api/admin/reviews/${id}`, await token(), { method: "PATCH", body: JSON.stringify({ status }) }); load(); refresh(); } catch (e) { setErr((e as Error).message); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    try { await api(`/api/admin/reviews/${id}`, await token(), { method: "DELETE" }); load(); refresh(); } catch (e) { setErr((e as Error).message); }
  }

  if (!reviews) return err ? <p className="text-danger">{err}</p> : <Loader variant="inline" label="Loading reviews" />;
  const list = reviews.filter((r) => filter === "all" || r.status === filter);

  return (
    <div>
      {err && <p className="mb-4 text-danger">{err}</p>}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`rounded-full border px-4 py-1.5 text-sm ${filter === id ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-muted"}`}>
            {label} ({id === "all" ? reviews.length : reviews.filter((r) => r.status === id).length})
          </button>
        ))}
      </div>
      {!list.length ? (
        <div className="card p-8 text-center text-sm text-muted">No reviews here.</div>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-medium">{r.name}<span className={`rounded-md px-2 py-0.5 text-xs ${TONE[r.status]}`}>{r.status}</span></div>
                  <div className="mt-1 flex gap-0.5 text-brand-2">{Array.from({ length: 5 }, (_, i) => (<Star key={i} size={15} fill={i < r.rating ? "currentColor" : "none"} />))}</div>
                </div>
                <div className="flex items-center gap-2">
                  {r.status !== "approved" && <button className="btn btn-primary btn-sm" onClick={() => void setStatus(r.id, "approved")}><Check size={16} /> Publish</button>}
                  {r.status !== "rejected" && <button className="btn btn-ghost btn-sm" onClick={() => void setStatus(r.id, "rejected")}><X size={16} /> Reject</button>}
                  <button aria-label="Delete review" className="p-1 text-muted hover:text-danger" onClick={() => void remove(r.id)}><Trash2 size={18} /></button>
                </div>
              </div>
              <p className="mt-3 text-sm">“{r.comment}”</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
