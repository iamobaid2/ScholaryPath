import type { Currency, StageId } from "./catalog";
import type { Selection } from "./pricing";

export type OrderFile = { name: string; size: number; path: string };

export type Order = {
  id: string;
  uid: string;
  email: string;
  name: string;
  whatsapp: string;
  country: string;
  university: string;
  degree: string;
  notes: string;
  selection: Selection;
  levelLabel: string;
  serviceLabel: string;
  words: number | null;
  eta: string;
  currency: Currency;
  amount: number; // in `currency`
  totalGBP: number;
  discountGBP: number;
  stage: StageId;
  paid: boolean;
  timeline: { stage: StageId; at: string }[];
  files: OrderFile[];
  adminNote?: string;
  createdAt: string;
};
