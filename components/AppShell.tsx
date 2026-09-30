"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./Providers";
import { firebaseConfigured } from "@/lib/firebase-client";
import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import DiscountModal from "./DiscountModal";

/**
 * Role-based routing (client side; the API routes enforce the same rules on the server):
 *  - /admin      → admins only (visitors go to /login, clients to /dashboard)
 *  - /dashboard  → signed-in clients only (admins go to /admin)
 *  - everything else (home, quote, login) → not for admins, who are sent to /admin
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, roleReady } = useAuth();
  const path = usePathname();
  const router = useRouter();

  const area = path.startsWith("/admin") ? "admin" : path.startsWith("/dashboard") ? "user" : "public";
  let target: string | null = null;
  let wait = false;

  if (firebaseConfigured) {
    const unknown = loading || (!!user && !roleReady);
    if (area === "admin") {
      if (unknown) wait = true;
      else if (!user) target = `/login?next=${encodeURIComponent(path)}`;
      else if (!isAdmin) target = "/dashboard";
    } else if (area === "user") {
      if (unknown) wait = true;
      else if (isAdmin) target = "/admin";
    } else {
      if (user && !roleReady) wait = true;
      else if (isAdmin) target = "/admin";
    }
  }

  useEffect(() => { if (target) router.replace(target); }, [target, router]);

  if (wait || target) return <div className="grid min-h-screen place-items-center text-sm text-muted">Loading…</div>;

  return (
    <>
      {!isAdmin && <AnnouncementBar />}
      <Navbar />
      <main className="flex-1">{children}</main>
      {!user && <Footer />}
      {!isAdmin && <WhatsAppFloat />}
      {!isAdmin && <DiscountModal />}
    </>
  );
}
