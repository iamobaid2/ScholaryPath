"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/components/Providers";
import Loader from "@/components/Loader";

function Inner() {
  const { user } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";
  useEffect(() => { if (user) router.replace(next); }, [user, next, router]);
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-semibold">Welcome</h1>
      <p className="mt-2 text-muted">Sign in to book orders, pay securely and track progress.</p>
      <div className="card mt-8 p-6"><AuthForm initialMode="login" /></div>
    </div>
  );
}
export default function LoginPage() { return <Suspense fallback={<Loader />}><Inner /></Suspense>; }
