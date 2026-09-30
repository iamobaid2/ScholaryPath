"use client";
import { COUNTRIES, countryByIso, flag } from "@/lib/countries";
import type { Phone } from "@/lib/validation";
import Select from "./Select";

const OPTIONS = COUNTRIES.map((c) => ({ value: c.iso, label: c.name, hint: `+${c.dial}`, prefix: flag(c.iso) }));

export default function PhoneInput({ value, onChange, invalid, placeholder = "300 1234567" }: { value: Phone; onChange: (p: Phone) => void; invalid?: boolean; placeholder?: string }) {
  return (
    <div className="flex gap-2">
      <div className="w-[7.25rem] shrink-0 sm:w-32">
        <Select
          value={value.iso}
          onChange={(iso) => onChange({ ...value, iso })}
          options={OPTIONS}
          searchable
          ariaLabel="Country calling code"
          invalid={invalid && !value.iso}
          menuClassName="w-72 max-w-[calc(100vw-2rem)]"
          display={(o) => (o ? <span className="flex items-center gap-1.5"><span className="text-base leading-none">{o.prefix}</span>{o.hint}</span> : <span className="text-muted">Code</span>)}
        />
      </div>
      <input
        className={`input !h-11 !py-0 ${invalid ? "!border-danger" : ""}`}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={placeholder}
        value={value.number}
        onChange={(e) => onChange({ ...value, number: e.target.value.replace(/[^\d\s-]/g, "").slice(0, 18) })}
        aria-label="Phone number"
        aria-invalid={invalid}
        title={countryByIso(value.iso)?.name}
      />
    </div>
  );
}
