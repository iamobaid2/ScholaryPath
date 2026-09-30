import { Suspense } from "react";
import QuoteWizard from "@/components/quote/QuoteWizard";
import Loader from "@/components/Loader";

export const metadata = { title: "Get an instant quote – ScholaryPath" };

export default function QuotePage() {
  return <Suspense fallback={<Loader />}><QuoteWizard /></Suspense>;
}
