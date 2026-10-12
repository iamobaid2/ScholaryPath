"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, FileText, Star, X } from "lucide-react";
import Reveal from "../Reveal";
import { useAuth, useContent } from "../Providers";
import { SHOWCASE_KINDS, type ShowcaseItem } from "@/lib/public-types";

/** A first-page picture of an uploaded PDF, using Cloudinary's page transformation. */
const pdfPreview = (url: string) => url.replace("/upload/", "/upload/pg_1,w_700,h_460,c_fill,g_north/").replace(/\.pdf($|\?)/i, ".jpg$1");
const thumb = (url: string) => url.replace("/upload/", "/upload/w_700,f_auto,q_auto/");

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-brand-2" role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (<Star key={i} size={size} fill={i < Math.round(value) ? "currentColor" : "none"} />))}
    </span>
  );
}

/** The owner's showcase: students' marks and high-scoring work. Hidden until something is published. */
export function ShowcaseSection() {
  const { showcase } = useContent();
  const kinds = SHOWCASE_KINDS.filter((k) => showcase.some((s) => s.kind === k.id));
  const [tab, setTab] = useState("");
  const [zoom, setZoom] = useState<ShowcaseItem | undefined>(undefined);
  if (!showcase.length) return null;
  const active = kinds.some((k) => k.id === tab) ? tab : kinds[0].id;
  const items = showcase.filter((s) => s.kind === active);

  return (
    <section id="work" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <h2 className="text-3xl sm:text-4xl">Work that <span className="accent">scored well</span></h2>
        <p className="mt-3 max-w-2xl text-muted">Results from students we&apos;ve supported, and examples of the standard you can expect.</p>
      </Reveal>

      <div className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max gap-1 rounded-lg bg-surface-2 p-1 text-sm font-medium">
          {kinds.map((k) => (
            <button key={k.id} onClick={() => setTab(k.id)} className={`whitespace-nowrap rounded-md px-4 py-2 transition ${active === k.id ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"}`}>{k.short}</button>
          ))}
        </div>
      </div>

      {active === "marks" ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((s) => (
            <Reveal key={s.id}>
              <button onClick={() => setZoom(s)} className="card group block w-full overflow-hidden p-0 text-left transition hover:-translate-y-1 hover:border-brand">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary image with its own transformations */}
                <img src={thumb(s.imageUrl)} alt={s.title} loading="lazy" className="aspect-[4/3] w-full bg-surface-2 object-cover" />
                <div className="p-3">
                  <div className="truncate text-sm font-medium">{s.title}</div>
                  {(s.grade || s.subject) && <div className="truncate text-xs text-muted">{[s.subject, s.grade].filter(Boolean).join(" · ")}</div>}
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => {
            const cover = s.imageUrl ? thumb(s.imageUrl) : s.fileUrl ? pdfPreview(s.fileUrl) : "";
            return (
              <Reveal key={s.id}>
                <article className="card flex h-full flex-col overflow-hidden">
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary image with its own transformations
                    <img src={cover} alt="" loading="lazy" className="aspect-[3/2] w-full bg-surface-2 object-cover" />
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg">{s.title}</h3>
                      {s.grade && <span className="shrink-0 rounded-md bg-ok/10 px-2.5 py-1 text-xs font-medium text-ok">{s.grade}</span>}
                    </div>
                    {(s.subject || s.level) && <p className="mt-1 text-sm text-muted">{[s.subject, s.level].filter(Boolean).join(" · ")}</p>}
                    {s.description && <p className="mt-2 text-sm text-muted">{s.description}</p>}
                    {s.fileUrl && (
                      <a href={s.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-medium text-brand hover:underline">
                        <FileText size={16} /> View PDF <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {zoom && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoom(undefined)}>
            <button aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-bg p-0 text-fg"><X size={20} /></button>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary image */}
            <img src={zoom.imageUrl} alt={zoom.title} className="max-h-[88vh] max-w-full rounded-lg bg-surface object-contain" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/** Approved client reviews. Hidden until there is at least one. */
export function ReviewsSection() {
  const { reviews, average, reviewCount } = useContent();
  const { user, isAdmin } = useAuth();
  if (!reviews.length) return null;
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl">What clients <span className="accent">say</span></h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Stars value={average} /> <span><b className="text-fg">{average}</b> from {reviewCount} review{reviewCount === 1 ? "" : "s"}</span></p>
          </div>
          {!isAdmin && <Link href={user ? "/dashboard" : "/login?next=/dashboard"} className="btn btn-ghost btn-sm">Write a review</Link>}
        </div>
      </Reveal>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <Reveal key={r.id}>
            <figure className="card flex h-full flex-col p-6">
              <Stars value={r.rating} />
              <blockquote className="mt-3 text-sm leading-relaxed">“{r.comment}”</blockquote>
              <figcaption className="mt-auto pt-4 text-sm font-semibold">{r.name}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
