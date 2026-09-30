"use client";
import WhatsAppIcon from "./WhatsAppIcon";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import CurrencySelect from "./CurrencySelect";
import { useAuth } from "./Providers";
import { waLink } from "@/lib/whatsapp";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
    // marketing links are for visitors only; signed-in users get their own menu
  const links = user
    ? isAdmin
      ? [{ href: "/admin", label: "Orders & pricing" }]
      : [{ href: "/dashboard", label: "My orders" }, { href: "/quote", label: "New quote" }]
    : [
        { href: "/#services", label: "Services" },
        { href: "/#how", label: "How it works" },
        { href: "/#faq", label: "FAQ" },
      ];
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo href={isAdmin ? "/admin" : user ? "/dashboard" : "/"} />
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((l) => (<Link key={l.href} href={l.href} className="text-muted transition hover:text-fg">{l.label}</Link>))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {!isAdmin && (
            <CurrencySelect />
          )}
          {user ? (
            <button onClick={logout} className="text-sm text-muted hover:text-fg">Sign out</button>
          ) : (
            <Link href="/login" className="text-sm text-muted hover:text-fg">Sign in</Link>
          )}
          {!isAdmin && <Link href="/quote" className="btn btn-primary !py-2.5">Get instant quote</Link>}
        </div>
        <button className="md:hidden p-2" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="border-t border-line bg-bg px-4 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {links.map((l) => (<Link key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</Link>))}
            {user ? <button className="text-left" onClick={() => { logout(); setOpen(false); }}>Sign out</button> : <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>}
            {!isAdmin && (
              <>
                <CurrencySelect />
                <Link href="/quote" onClick={() => setOpen(false)} className="btn btn-primary">Get instant quote</Link>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><WhatsAppIcon size={16} /> Talk with an expert</a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
