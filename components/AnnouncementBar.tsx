"use client";
import { GraduationCap } from "lucide-react";
import { useShop } from "./Providers";

export default function AnnouncementBar() {
  const { openDiscount, cfg } = useShop();
  return (
    <div className="bg-brand text-on-brand text-[13px]">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-x-2 px-4 py-2 text-center">
        <GraduationCap size={15} className="hidden shrink-0 sm:block" />
        <span><span className="hidden sm:inline">Welcome Student Offer: </span><b>{cfg.discountPercent}% off</b> your first order</span>
        <button onClick={openDiscount} className="shrink-0 font-semibold underline underline-offset-2 hover:opacity-80">Claim<span className="hidden sm:inline"> your discount</span></button>
      </div>
    </div>
  );
}
