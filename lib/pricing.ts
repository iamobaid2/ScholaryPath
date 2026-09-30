import { DISCOUNT_CODE, WORD_OPTIONS, findOption, type Currency, type DeadlineId, DEADLINES, EXTRAS } from "./catalog";
import { DEFAULT_PRICING, type PricingConfig } from "./pricing-defaults";

export type Selection = {
  level: string;
  course: string;
  service: string;
  wordIndex: number | null;
  complexity: string;
  deadline: string;
  extras: string[];
  code: string;
};

export type Quote = {
  ok: boolean;
  base: number;
  levelAdj: number;
  complexityAdj: number;
  deadlineAdj: number;
  extrasTotal: number;
  subtotal: number;
  discount: number;
  totalGBP: number;
  words: number | null;
  eta: string;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function needsWords(service: string) {
  const o = findOption(service);
  return !!o && o.kind !== "flat";
}

export function isWeekTimeline(service: string) {
  const k = findOption(service)?.kind;
  return k === "thesis" || k === "phd";
}

export function mergePricing(partial?: Partial<PricingConfig> | null): PricingConfig {
  const d = DEFAULT_PRICING;
  if (!partial) return d;
  return {
    rates: { ...d.rates, ...partial.rates },
    discountPercent: partial.discountPercent ?? d.discountPercent,
    levels: { ...d.levels, ...partial.levels },
    complexity: { ...d.complexity, ...partial.complexity },
    deadlines: { ...d.deadlines, ...partial.deadlines },
    bands: { ...d.bands, ...partial.bands },
    services: { ...d.services, ...partial.services },
    extras: { ...d.extras, ...partial.extras },
  };
}

export function validCode(code: string) {
  return code.trim().toUpperCase() === DISCOUNT_CODE;
}

export function calculate(sel: Selection, cfg: PricingConfig = DEFAULT_PRICING): Quote {
  const empty: Quote = { ok: false, base: 0, levelAdj: 0, complexityAdj: 0, deadlineAdj: 0, extrasTotal: 0, subtotal: 0, discount: 0, totalGBP: 0, words: null, eta: "" };
  const opt = findOption(sel.service);
  if (!opt || !sel.level || !sel.complexity || !sel.deadline) return empty;

  let base = 0;
  let words: number | null = null;
  const val = cfg.services[opt.id] ?? 0;

  if (opt.kind === "flat") {
    base = val;
  } else {
    if (sel.wordIndex === null) return empty;
    const wo = WORD_OPTIONS[opt.kind][sel.wordIndex];
    if (!wo) return empty;
    words = wo.words;
    if (opt.kind === "edit") {
      const volume = words > 20000 ? 0.8 : words > 5000 ? 0.9 : 1;
      base = (words / 1000) * val * volume;
    } else {
      base = (cfg.bands[opt.kind][sel.wordIndex] ?? 0) * val;
    }
  }

  const levelMult = opt.levelScaled ? (cfg.levels[sel.level] ?? 1) : 1;
  const afterLevel = base * levelMult;
  const afterComplexity = afterLevel * (cfg.complexity[sel.complexity] ?? 1);
  const afterDeadline = afterComplexity * (cfg.deadlines[sel.deadline] ?? 1);
  const extrasTotal = sel.extras.reduce((s, id) => s + (EXTRAS.some((e) => e.id === id) ? (cfg.extras[id] ?? 0) : 0), 0);
  const subtotal = afterDeadline + extrasTotal;
  const discount = validCode(sel.code) ? subtotal * (cfg.discountPercent / 100) : 0;
  const dl = DEADLINES.find((d) => d.id === (sel.deadline as DeadlineId));

  return {
    ok: true,
    base: r2(base),
    levelAdj: r2(afterLevel - base),
    complexityAdj: r2(afterComplexity - afterLevel),
    deadlineAdj: r2(afterDeadline - afterComplexity),
    extrasTotal: r2(extrasTotal),
    subtotal: r2(subtotal),
    discount: r2(discount),
    totalGBP: r2(subtotal - discount),
    words,
    eta: dl?.time ?? "",
  };
}

export function convert(gbp: number, currency: Currency, cfg: PricingConfig = DEFAULT_PRICING) {
  const v = gbp * (cfg.rates[currency] ?? 1);
  return currency === "PKR" ? Math.round(v / 50) * 50 : Math.round(v * 100) / 100;
}

export function formatMoney(gbp: number, currency: Currency, cfg: PricingConfig = DEFAULT_PRICING) {
  const v = convert(gbp, currency, cfg);
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: v % 1 === 0 || currency === "PKR" ? 0 : 2,
  }).format(v);
}

export function formatAmount(amount: number, currency: Currency) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: amount % 1 === 0 || currency === "PKR" ? 0 : 2,
  }).format(amount);
}
