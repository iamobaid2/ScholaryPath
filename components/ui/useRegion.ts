"use client";
import { useEffect, useState } from "react";
import { countryByIso } from "@/lib/countries";

/** Best-guess ISO country code from the browser locale (empty until mounted or if unknown). */
export default function useRegion() {
  const [iso, setIso] = useState("");
  useEffect(() => {
    const loc = navigator.languages?.[0] || navigator.language || "";
    const r = loc.split("-")[1]?.toUpperCase() || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only value, resolved after hydration
    if (countryByIso(r)) setIso(r);
  }, []);
  return iso;
}
