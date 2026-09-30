"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { fbAuth, firebaseConfigured } from "@/lib/firebase-client";
import { DEFAULT_PRICING, type PricingConfig } from "@/lib/pricing-defaults";
import { CURRENCIES, DISCOUNT_CODE, type Currency } from "@/lib/catalog";
import { formatMoney } from "@/lib/pricing";

type AuthCtx = { user: User | null; loading: boolean; logout: () => Promise<void>; token: () => Promise<string>; isAdmin: boolean; roleReady: boolean };
const Auth = createContext<AuthCtx>({ user: null, loading: true, logout: async () => {}, token: async () => "", isAdmin: false, roleReady: true });
export const useAuth = () => useContext(Auth);

type ShopCtx = {
  cfg: PricingConfig;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  money: (gbp: number) => string;
  code: string;
  setCode: (c: string) => void;
  discountOpen: boolean;
  openDiscount: () => void;
  closeDiscount: () => void;
};
const Shop = createContext<ShopCtx>(null as never);
export const useShop = () => useContext(Shop);

const safeGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleReady, setRoleReady] = useState(true);
  const [cfg, setCfg] = useState<PricingConfig>(DEFAULT_PRICING);
  const [currency, setCurrencyState] = useState<Currency>("GBP");
  const [code, setCodeState] = useState("");
  const [discountOpen, setDiscountOpen] = useState(false);

  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(fbAuth(), async (u) => {
      setIsAdmin(false);
      setRoleReady(!u);
      setUser(u);
      setLoading(false);
      if (u) {
        const t = await u.getIdToken();
        const ok = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.ok).catch(() => false);
        setIsAdmin(ok);
        setRoleReady(true);
      }
    });
  }, []);

  useEffect(() => {
    fetch("/api/pricing").then((r) => r.json()).then((d) => d.config && setCfg(d.config)).catch(() => {});
    /* eslint-disable react-hooks/set-state-in-effect -- restoring saved preferences after hydration */
    const c = safeGet("sp_currency") as Currency | null;
    if (c && CURRENCIES.includes(c)) setCurrencyState(c);
    const d = safeGet("sp_code");
    if (d) setCodeState(d);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const setCurrency = useCallback((c: Currency) => { setCurrencyState(c); safeSet("sp_currency", c); }, []);
  const setCode = useCallback((c: string) => { setCodeState(c); safeSet("sp_code", c); }, []);

  const auth = useMemo<AuthCtx>(
    () => ({
      user, loading, isAdmin, roleReady,
      logout: () => (firebaseConfigured ? signOut(fbAuth()) : Promise.resolve()),
      token: async () => (user ? user.getIdToken() : ""),
    }),
    [user, loading, isAdmin, roleReady]
  );

  const shop = useMemo<ShopCtx>(
    () => ({
      cfg, currency, setCurrency, code, setCode,
      money: (g) => formatMoney(g, currency, cfg),
      discountOpen, openDiscount: () => setDiscountOpen(true), closeDiscount: () => setDiscountOpen(false),
    }),
    [cfg, currency, setCurrency, code, setCode, discountOpen]
  );

  return (
    <Auth.Provider value={auth}>
      <Shop.Provider value={shop}>{children}</Shop.Provider>
    </Auth.Provider>
  );
}

export { DISCOUNT_CODE };
