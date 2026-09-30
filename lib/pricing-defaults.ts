import type { Currency } from "./catalog";

// ============================================================================
// EDIT PRICES HERE (or live from /admin → Pricing, which overrides these in Firestore).
// All prices are in GBP. Exchange rates are per 1 GBP.
// ============================================================================
export type PricingConfig = {
  rates: Record<Currency, number>;
  discountPercent: number;
  levels: Record<string, number>; // multiplier
  complexity: Record<string, number>; // multiplier
  deadlines: Record<string, number>; // multiplier
  bands: { essay: number[]; assignment: number[]; thesis: number[]; phd: number[] };
  // Per service option: bands kinds → multiplier, "edit" → GBP per 1,000 words, "flat" → GBP flat price
  services: Record<string, number>;
  extras: Record<string, number>; // GBP flat
};

export const DEFAULT_PRICING: PricingConfig = {
  rates: { GBP: 1, AUD: 1.95, USD: 1.27, EUR: 1.17, CAD: 1.74, NZD: 2.13, AED: 4.66, PKR: 355 },
  discountPercent: 15,
  levels: { highschool: 0.85, bachelor: 1, master: 1.25, phd: 1.6, mba: 1.35, diploma: 0.9 },
  complexity: { standard: 1, advanced: 1.2, expert: 1.45 },
  // Thesis timelines are placeholders (no surcharge) until deadline details are confirmed.
  deadlines: { standard: 1, fast: 1.25, urgent: 1.5, w4: 1, w6: 1, w8: 1, w12: 1 },
  bands: {
    essay: [20, 22, 25, 28, 31, 34], // ≈ A$40–70
    assignment: [22, 32, 42, 52, 62, 73], // ≈ A$45–150
    thesis: [180, 290, 400], // 10k / 20k / 30k
    phd: [1500, 2000, 2500], // 40k / 50k / 60k+
  },
  services: {
    // writing (multiplier on the essay / assignment band)
    essay: 1, assignment: 1, coursework: 1.1, "research-paper": 1.2, "case-study": 1.1, report: 1,
    "literature-review": 1.15, "annotated-bibliography": 0.8, presentation: 0.7,
    // thesis (multiplier on the thesis band; phd-thesis uses the phd band)
    "thesis-proposal": 0.35, "dissertation-proposal": 0.35, "lit-review-chapter": 0.3, "methodology-chapter": 0.25,
    "results-chapter": 0.3, "discussion-chapter": 0.3, "thesis-formatting": 0.3, "thesis-full": 1, "dissertation-full": 1, "phd-thesis": 1,
    // editing: GBP per 1,000 words
    "edit-basic": 6, "edit-academic": 10, "edit-premium": 15,
    // research
    "methodology-consult": 35, "research-design": 40, statistics: 45, "data-interpretation": 55, "journal-formatting": 60, manuscript: 1.8,
    // professional (flat)
    "cv-writing": 30, "cv-editing": 18, "cover-letter": 18, sop: 40, "personal-statement": 40, linkedin: 25,
    // technical (flat)
    programming: 45, python: 55, java: 55, cpp: 55, sql: 45, "data-analysis": 70, ml: 95, "ai-projects": 120, uiux: 90,
  },
  extras: { formatting: 3, referencing: 3, citation: 2, reflist: 3, tables: 2, figures: 2, plagiarism: 5, journal: 4, latex: 5 },
};
