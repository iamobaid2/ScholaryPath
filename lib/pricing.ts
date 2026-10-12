import { DISCOUNT_CODE, WORD_OPTIONS, findOption, type Currency, type DeadlineId, DEADLINES, type Kind } from "./catalog";
import { BANDS_VERSION, DEFAULT_PRICING, type PricingConfig } from "./pricing-defaults";

/** One service in an order. An order holds one or more of these. */
export type Item = {
  service: string;
  wordIndex: number | null;
  complexity: string;
  deadline: string;
  /** Technical services only: whether written documentation is wanted ("" until answered). */
  documentation: "" | "yes" | "no";
};

export type Selection = {
  level: string;
  course: string;
  items: Item[];
  code: string;
};

export const emptyItem: Item = { service: "", wordIndex: null, complexity: "", deadline: "", documentation: "" };

export type ItemQuote = {
  ok: boolean;
  service: string;
  label: string;
  words: number | null;
  eta: string;
  subtotal: number;
};

export type Quote = {
  ok: boolean;
  lines: ItemQuote[];
  subtotal: number;
  discount: number;
  totalGBP: number;
  /** Total words across the order, when any item is priced by length. */
  words: number | null;
  /** The longest delivery time among the services. */
  eta: string;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Technical services ask "do you need documentation?" before anything else. */
export function asksDocumentation(service: string) {
  return !!findOption(service)?.docs;
}

/**
 * Which word-count scale applies, or undefined when length plays no part.
 * Technical work is flat-priced unless documentation is wanted, in which case it is priced like
 * an assignment of that length on top.
 */
export function wordKind(service: string, documentation: Item["documentation"] = ""): Exclude<Kind, "flat"> | undefined {
  const o = findOption(service);
  if (!o) return undefined;
  if (o.kind !== "flat") return o.kind;
  return o.docs && documentation === "yes" ? "assignment" : undefined;
}

export function needsWords(service: string, documentation: Item["documentation"] = "") {
  return wordKind(service, documentation) !== undefined;
}

export function isWeekTimeline(service: string) {
  return findOption(service)?.kind === "thesis";
}

export function mergePricing(partial?: Partial<PricingConfig> | null): PricingConfig {
  const d = DEFAULT_PRICING;
  if (!partial) return d;
  // Prices saved against an older set of word ranges would land on the wrong ranges, so they are ignored.
  const sameRanges = partial.bandsVersion === BANDS_VERSION;
  const pick = (own: number[] | undefined, def: number[]) => def.map((v, i) => (sameRanges ? own?.[i] : undefined) ?? v);
  return {
    bandsVersion: BANDS_VERSION,
    rates: { ...d.rates, ...partial.rates },
    discountPercent: partial.discountPercent ?? d.discountPercent,
    levels: { ...d.levels, ...partial.levels },
    complexity: { ...d.complexity, ...partial.complexity },
    deadlines: { ...d.deadlines, ...partial.deadlines },
    bands: {
      essay: pick(partial.bands?.essay, d.bands.essay),
      assignment: pick(partial.bands?.assignment, d.bands.assignment),
      thesisRanges: d.bands.thesisRanges.map((v, i) => partial.bands?.thesisRanges?.[i] ?? v),
    },
    services: { ...d.services, ...partial.services },
  };
}

export function validCode(code: string) {
  return code.trim().toUpperCase() === DISCOUNT_CODE;
}

const RANK: Record<string, number> = { urgent: 1, fast: 2, standard: 3, w4: 4, w6: 5, w8: 6, w12: 7 };

export function calculateItem(level: string, item: Item, cfg: PricingConfig = DEFAULT_PRICING): ItemQuote | undefined {
  const opt = findOption(item.service);
  if (!opt || !level || !item.complexity || !item.deadline) return undefined;
  if (opt.docs && !item.documentation) return undefined;

  let base = 0;
  let words: number | null = null;
  const val = cfg.services[opt.id] ?? 0;
  const kind = wordKind(item.service, item.documentation);

  if (opt.kind === "flat") base = val;

  if (kind) {
    if (item.wordIndex === null) return undefined;
    const wo = WORD_OPTIONS[kind][item.wordIndex];
    if (!wo) return undefined;
    words = wo.words;
    if (kind === "edit") {
      const volume = words > 20000 ? 0.8 : words > 5000 ? 0.9 : 1;
      base = (words / 1000) * val * volume;
    } else {
      const table = kind === "thesis" ? cfg.bands.thesisRanges : cfg.bands[kind];
      const bandPrice = table[item.wordIndex] ?? 0;
      // Documentation for technical work is the assignment price for that length, added to the flat fee.
      base = opt.kind === "flat" ? base + bandPrice : bandPrice * val;
    }
  }

  const levelMult = opt.levelScaled ? (cfg.levels[level] ?? 1) : 1;
  const subtotal = base * levelMult * (cfg.complexity[item.complexity] ?? 1) * (cfg.deadlines[item.deadline] ?? 1);
  const dl = DEADLINES.find((x) => x.id === (item.deadline as DeadlineId));
  return { ok: true, service: item.service, label: opt.label + (item.documentation === "yes" ? " + documentation" : ""), words, eta: dl?.time ?? "", subtotal: r2(subtotal) };
}

/** Prices the whole order: every service, then the discount on the total. */
export function calculate(sel: Selection, cfg: PricingConfig = DEFAULT_PRICING): Quote {
  const empty: Quote = { ok: false, lines: [], subtotal: 0, discount: 0, totalGBP: 0, words: null, eta: "" };
  if (!sel.items.length) return empty;
  const lines: ItemQuote[] = [];
  for (const item of sel.items) {
    const q = calculateItem(sel.level, item, cfg);
    if (!q) return empty;
    lines.push(q);
  }
  const subtotal = r2(lines.reduce((s, l) => s + l.subtotal, 0));
  const discount = validCode(sel.code) ? r2(subtotal * (cfg.discountPercent / 100)) : 0;
  const withWords = lines.filter((l) => l.words !== null);
  const longest = sel.items.reduce((a, b) => ((RANK[b.deadline] ?? 0) > (RANK[a.deadline] ?? 0) ? b : a));
  return {
    ok: true,
    lines,
    subtotal,
    discount,
    totalGBP: r2(subtotal - discount),
    words: withWords.length ? withWords.reduce((s, l) => s + (l.words ?? 0), 0) : null,
    eta: DEADLINES.find((x) => x.id === (longest.deadline as DeadlineId))?.time ?? "",
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
