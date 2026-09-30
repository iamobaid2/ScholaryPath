"use client";
import Link from "next/link";
import Logo from "./Logo";
import { useAuth } from "./Providers";
import { BRAND, CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/catalog";
import { waLink } from "@/lib/whatsapp";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="mt-0 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-muted">Expert academic, research and professional support for students and researchers worldwide.</p>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">Contact</div>
          <a className="block text-muted hover:text-fg" href={waLink()} target="_blank" rel="noopener noreferrer">WhatsApp {WHATSAPP_DISPLAY}</a>
          <a className="block text-muted hover:text-fg" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </div>
        <div className="text-sm">
          <div className="mb-2 font-semibold">Explore</div>
          <Link className="block text-muted hover:text-fg" href="/quote">Get instant quote</Link>
          {user ? <Link className="block text-muted hover:text-fg" href="/dashboard">My orders</Link> : <Link className="block text-muted hover:text-fg" href="/#faq">FAQ</Link>}
        </div>
      </div>
      <div className="border-t border-line px-4 py-5 text-center text-xs text-muted">
        <p className="mx-auto max-w-3xl">
          <b>Academic integrity:</b> our services provide guidance, feedback and model material to support your learning. Please use all materials in line with your institution&apos;s academic policies.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
      </div>
    </footer>
  );
}
