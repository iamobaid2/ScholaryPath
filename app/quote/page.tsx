import { Suspense } from "react";
import QuoteWizard from "@/components/quote/QuoteWizard";

export const metadata = { title: "Get an instant quote – ScholaryPath" };

export default function QuotePage() {
  return <Suspense><QuoteWizard /></Suspense>;
}
