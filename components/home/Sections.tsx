"use client";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Plus, Quote } from "lucide-react";
import Reveal from "../Reveal";
import ServiceIcon from "../ServiceIcon";
import { SERVICE_CATEGORIES } from "@/lib/catalog";
import { FAQ, TESTIMONIALS } from "@/lib/content";
import { useShop } from "../Providers";

export function HowItWorks() {
  const steps = [
    ["Choose your profile", "Pick your level, degree and the service you need."],
    ["See your price instantly", "Word count, complexity and deadline update your quote live."],
    ["Add your material", "Upload instructions, guidelines and feedback in one place."],
    ["Book and track", "Pay securely and follow progress from order to delivery."],
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-20">
      <Reveal><h2 className="text-center text-3xl font-semibold sm:text-4xl">From question to order in <span className="accent">3–5 minutes</span></h2></Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-4">
        {steps.map(([t, d], i) => (
          <Reveal key={t} delay={i * 0.08}>
            <div className="card h-full p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft font-display font-semibold text-brand">{i + 1}</div>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <h2 className="text-3xl font-semibold sm:text-4xl">Everything you need, <span className="accent">in one place</span></h2>
        <p className="mt-3 max-w-2xl text-muted">Six service areas, each with transparent pricing built right into the quote calculator.</p>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICE_CATEGORIES.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 0.08}>
            <Link href={`/quote?cat=${c.id}`} className="card group block h-full p-6 transition hover:-translate-y-1 hover:border-brand" style={{ ["--tw-shadow" as string]: "var(--shadow)" }}>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-on-brand"><ServiceIcon name={c.icon} /></div>
              <h3 className="mt-4 text-lg font-semibold">{c.label}</h3>
              <p className="mt-1 text-sm text-muted">{c.blurb}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-brand">Get a price <ArrowRight size={15} className="transition group-hover:translate-x-1" /></div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Testimonials() {
  if (!TESTIMONIALS.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal><h2 className="text-center text-3xl font-semibold">Trusted by students and researchers</h2></Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <Reveal key={t.name}><figure className="card h-full p-6"><Quote className="text-brand" size={20} /><blockquote className="mt-3 text-sm">{t.quote}</blockquote><figcaption className="mt-4 text-sm font-semibold">{t.name}<span className="block font-normal text-muted">{t.role}</span></figcaption></figure></Reveal>
        ))}
      </div>
    </section>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <Reveal><h2 className="text-center text-3xl font-semibold sm:text-4xl">Frequently asked questions</h2></Reveal>
      <div className="mt-10 space-y-3">
        {FAQ.map((f, i) => (
          <Reveal key={f.q}>
            <div className="card overflow-hidden">
              <button className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {f.q}
                <motion.span animate={{ rotate: open === i ? 45 : 0 }} className="shrink-0 text-brand"><Plus size={20} /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <p className="px-5 pb-5 text-sm text-muted">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FinalCta() {
  const { openDiscount, cfg } = useShop();
  return (
    <section className="mx-auto max-w-6xl px-4">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-brand p-10 text-center text-on-brand md:p-14">
          <h2 className="text-3xl font-semibold sm:text-4xl">Ready to see your price?</h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">Start your quote now. First-time students get {cfg.discountPercent}% off.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/quote" className="btn bg-surface text-fg hover:-translate-y-0.5">Get instant quote</Link>
            <button onClick={openDiscount} className="btn border border-on-brand/40 text-on-brand hover:bg-on-brand/10">Claim discount</button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
