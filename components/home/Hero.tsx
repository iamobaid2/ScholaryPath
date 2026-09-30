"use client";
import WhatsAppIcon from "../WhatsAppIcon";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Timer, ShieldCheck, ClipboardCheck } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { useShop } from "../Providers";
import { calculate } from "@/lib/pricing";

export default function Hero() {
  const { money, cfg } = useShop();
  const sample = calculate({ level: "master", course: "", service: "edit-academic", wordIndex: 4, complexity: "standard", deadline: "fast", extras: [], code: "" }, cfg).totalGBP;
  const item = (i: number) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const } });
  return (
    <section className="relative overflow-hidden">

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 md:grid-cols-[1.15fr_1fr] md:pt-24">
        <div>
          <motion.span {...item(0)} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-muted">
            <Timer size={14} className="text-brand-2" /> Price in under a minute, no waiting for quotes
          </motion.span>
          <motion.h1 {...item(1)} className="mt-5 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            Professional <span className="accent">academic &amp; research</span> support services
          </motion.h1>
          <motion.p {...item(2)} className="mt-5 max-w-xl text-lg text-muted">
            Expert editing, proofreading, formatting, research consultation, technical guidance and professional document services for students, researchers and professionals worldwide.
          </motion.p>
          <motion.div {...item(3)} className="mt-8 flex flex-wrap gap-3">
            <Link href="/quote" className="btn btn-primary">Get instant quote <ArrowRight size={18} /></Link>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><WhatsAppIcon size={18} /> Talk with an expert</a>
          </motion.div>
          <motion.div {...item(4)} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-brand-2" /> Secure payments</span>
            <span className="flex items-center gap-2"><ClipboardCheck size={16} className="text-brand-2" /> Live order tracking</span>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.97, rotate: 0 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} className="relative">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="card p-6" style={{ boxShadow: "var(--shadow)" }}>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">Sample quote</div>
            <div className="mt-3 space-y-3 text-sm">
              {[["Level", "Master's"], ["Service", "Academic Editing"], ["Length", "10,000 words"], ["Deadline", "Fast · 3–7 days"]].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-line pb-2"><span className="text-muted">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div className="text-muted text-sm">Estimated price</div>
              <div className="font-display text-3xl font-semibold text-brand">{money(sample)}</div>
            </div>
            <Link href="/quote" className="btn btn-primary mt-5 w-full">Build yours</Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
