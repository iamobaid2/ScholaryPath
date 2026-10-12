"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useAuth, useContent } from "./Providers";
import { api } from "@/lib/api";
import type { Review } from "@/lib/public-types";

const STATUS: Record<Review["status"], string> = {
  pending: "Thanks! Your review is waiting for approval and will appear on the site once it's published.",
  approved: "Your review is live on the website. You can edit it, but it will be checked again.",
  rejected: "This review wasn't published. You're welcome to change it and send it again.",
};

/** One review per client, for the owner to approve before it appears on the home page. */
export default function ReviewForm() {
  const { token } = useAuth();
  const { refresh } = useContent();
  const [mine, setMine] = useState<Review | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    token()
      .then((t) => api<{ review: Review | null }>("/api/reviews/mine", t))
      .then((d) => {
        if (d.review) { setMine(d.review); setRating(d.review.rating); setComment(d.review.comment); }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!rating) return setErr("Choose a star rating.");
    if (comment.trim().length < 10) return setErr("Please write at least a sentence.");
    setBusy(true);
    try {
      const d = await api<{ review: Review }>("/api/reviews", await token(), { method: "POST", body: JSON.stringify({ rating, comment }) });
      setMine(d.review);
      setEditing(false);
      refresh();
    } catch (e2) { setErr(e2 instanceof Error ? e2.message : "Couldn't save your review."); } finally { setBusy(false); }
  }

  if (!loaded) return null;
  const show = hover || rating;
  const showForm = !mine || editing;

  return (
    <section className="card mt-10 p-6">
      <h2 className="text-xl">{mine ? "Your review" : "Leave a review"}</h2>
      {!mine && <p className="mt-1 text-sm text-muted">Tell other students what it was like to work with us.</p>}

      {mine && !editing && (
        <div className="mt-3">
          <div className="flex gap-0.5 text-brand-2">{Array.from({ length: 5 }, (_, i) => (<Star key={i} size={18} fill={i < mine.rating ? "currentColor" : "none"} />))}</div>
          <p className="mt-2 text-sm">“{mine.comment}”</p>
          <p className={`mt-3 text-sm ${mine.status === "approved" ? "text-ok" : mine.status === "rejected" ? "text-danger" : "text-muted"}`}>{STATUS[mine.status]}</p>
          <button className="btn btn-ghost btn-sm mt-3" onClick={() => setEditing(true)}>Edit review</button>
        </div>
      )}

      {showForm && (
        <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
          <div>
            <span className="label">Your rating</span>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="p-0.5 text-brand-2 transition hover:scale-110">
                  <Star size={28} fill={n <= show ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="review-comment">Your review</label>
            <textarea id="review-comment" className="input min-h-28" maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What went well? How was the quality, communication and delivery?" />
            <div className="mt-1 text-right text-xs text-muted">{comment.length}/600</div>
          </div>
          {err && <p className="text-sm text-danger">{err}</p>}
          <div className="flex gap-2">
            <button className="btn btn-primary" disabled={busy}>{busy ? "Sending…" : mine ? "Save changes" : "Submit review"}</button>
            {editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(false); setRating(mine?.rating ?? 0); setComment(mine?.comment ?? ""); }}>Cancel</button>}
          </div>
          <p className="text-xs text-muted">Reviews are checked before they&apos;re published, and only your first name and last initial are shown.</p>
        </form>
      )}
    </section>
  );
}
