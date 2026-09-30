"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import CurrencySelect from "./CurrencySelect";
import WhatsAppIcon from "./WhatsAppIcon";
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href={isAdmin ? "/admin" : user ? "/dashboard" : "/"} />

        <nav className="hidden items-center gap-7 whitespace-nowrap text-sm lg:flex">
          {links.map((l) => (<Link key={l.href} href={l.href} className="text-muted transition hover:text-fg">{l.label}</Link>))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {!isAdmin && <CurrencySelect />}
          {user ? (
            <button onClick={logout} className="btn btn-ghost btn-sm">Sign out</button>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link href="/quote" className="btn btn-primary btn-sm">Get instant quote</Link>
            </>
          )}
        </div>

        <button className="-mr-2 grid h-10 w-10 place-items-center rounded-lg lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-20 overflow-y-auto bg-bg px-4 pb-8 pt-4 lg:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={close} className="border-b border-line py-4 text-base font-medium">{l.label}</Link>
            ))}
          </nav>
          <div className="mt-6 space-y-3">
            {!isAdmin && (
              <div className="flex items-center justify-between rounded-lg border border-line px-4 py-2.5">
                <span className="text-sm text-muted">Currency</span>
                <CurrencySelect />
              </div>
            )}
            {user ? (
              <button className="btn btn-ghost w-full" onClick={() => { logout(); close(); }}>Sign out</button>
            ) : (
              <>
                <Link href="/quote" onClick={close} className="btn btn-primary w-full">Get instant quote</Link>
                <Link href="/login" onClick={close} className="btn btn-ghost w-full">Sign in</Link>
              </>
            )}
            {!isAdmin && (
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-ghost w-full"><WhatsAppIcon size={18} /> Talk with an expert</a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
