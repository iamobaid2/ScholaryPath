"use client";
import { useShop } from "./Providers";
import Select from "./ui/Select";
import { CURRENCIES, type Currency } from "@/lib/catalog";

const NAMES: Record<Currency, string> = {
  GBP: "British Pound", AUD: "Australian Dollar", USD: "US Dollar", EUR: "Euro",
  CAD: "Canadian Dollar", NZD: "New Zealand Dollar", AED: "UAE Dirham", PKR: "Pakistani Rupee",
};
const OPTIONS = CURRENCIES.map((c) => ({ value: c, label: NAMES[c], hint: c }));

export default function CurrencySelect({ size = "md", align = "right" }: { size?: "sm" | "md"; align?: "left" | "right" }) {
  const { currency, setCurrency } = useShop();
  return (
    <div className={size === "sm" ? "w-[4.75rem]" : "w-[5.5rem]"}>
      <Select
        value={currency}
        onChange={(v) => setCurrency(v as Currency)}
        options={OPTIONS}
        ariaLabel={`Currency: ${currency}`}
        align={align}
        menuClassName="w-60"
        buttonClassName={size === "sm" ? "h-8 px-2.5 text-xs font-medium" : "h-10 px-3 text-sm font-medium"}
        display={(o) => o?.hint ?? currency}
      />
    </div>
  );
}
