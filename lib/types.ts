import type { Currency, StageId } from "./catalog";
import type { Selection } from "./pricing";

/** A client file held in Cloudinary. `path` is the legacy Firebase Storage path of earlier orders. */
export type OrderFile = { name: string; size: number; publicId?: string; resourceType?: string; path?: string };

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
  /** Images of previous marks and feedback (optional on orders created before this existed). */
  feedbackFiles?: OrderFile[];
  adminNote?: string;
  createdAt: string;
};
