"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./Providers";
import { firebaseConfigured } from "@/lib/firebase-client";
import Loader from "./Loader";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => { if (!loading && !user && firebaseConfigured) router.replace(`/login?next=${encodeURIComponent(path)}`); }, [loading, user, router, path]);
  if (!firebaseConfigured) return <div className="mx-auto max-w-xl px-4 py-24 text-center text-muted">Accounts aren&apos;t connected yet. Add your Firebase keys to <code>.env.local</code> (see README).</div>;
  if (loading || !user) return <Loader />;
  return <>{children}</>;
}
