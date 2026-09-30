"use client";
import { GraduationCap } from "lucide-react";
import { useShop } from "./Providers";

export default function AnnouncementBar() {
  const { openDiscount, cfg } = useShop();
  return (
    <div className="bg-brand text-on-brand text-[13px]">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-center gap-2 text-center flex-wrap">
        <GraduationCap size={15} className="shrink-0" />
        <span>Welcome Student Offer: <b>{cfg.discountPercent}% off</b> your first order</span>
        <button onClick={openDiscount} className="underline underline-offset-2 font-semibold hover:opacity-80">Claim your discount</button>
      </div>
    </div>
  );
}
