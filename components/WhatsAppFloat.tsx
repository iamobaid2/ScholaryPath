"use client";
import WhatsAppIcon from "./WhatsAppIcon";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { waLink } from "@/lib/whatsapp";

export default function WhatsAppFloat() {
  const onQuote = usePathname().startsWith("/quote");
  return (
    <motion.a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.1 }}
      className={`fixed right-5 ${onQuote ? "bottom-20 lg:bottom-5" : "bottom-5"} z-40 grid h-14 w-14 place-items-center rounded-full bg-[#1faa59] text-white shadow-lg`}
    >
      <WhatsAppIcon size={28} />
    </motion.a>
  );
}
