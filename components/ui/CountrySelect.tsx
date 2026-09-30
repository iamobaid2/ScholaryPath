"use client";
import { COUNTRIES, flag } from "@/lib/countries";
import Select from "./Select";

const OPTIONS = COUNTRIES.map((c) => ({ value: c.iso, label: c.name, prefix: flag(c.iso) }));

export default function CountrySelect({ value, onChange, invalid }: { value: string; onChange: (iso: string) => void; invalid?: boolean }) {
  return <Select value={value} onChange={onChange} options={OPTIONS} searchable placeholder="Select country" ariaLabel="Country" invalid={invalid} menuClassName="w-full min-w-64" />;
}
