import { useState } from "react";
import { DISPOSALS, INDUSTRIES, STATES, type WasteInput } from "@/lib/waste";
import { cn } from "@/lib/utils";

export const EMPTY: WasteInput = { name: "", industry: "", quantity: 0, state: "Solid", composition: "", disposal: "" };

export function validate(v: WasteInput) {
  const e: Partial<Record<keyof WasteInput, string>> = {};
  if (v.name.trim().length < 3) e.name = "Enter a waste name (at least 3 characters).";
  if (!v.industry.trim()) e.industry = "Select or enter an industry.";
  if (!(v.quantity > 0)) e.quantity = "Quantity must be greater than 0 kg.";
  if (v.quantity > 10_000_000) e.quantity = "Quantity looks too large.";
  if (v.composition.trim().length < 10) e.composition = "Describe the composition (at least 10 characters).";
  if (!v.disposal.trim()) e.disposal = "Select the current disposal method.";
  return e;
}

const field = "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function WasteForm({ value, onChange, errors }: { value: WasteInput; onChange: (v: WasteInput) => void; errors: Partial<Record<keyof WasteInput, string>> }) {
  const custom = value.industry !== "" && !INDUSTRIES.includes(value.industry);
  const [other, setOther] = useState(custom);
  const set = <K extends keyof WasteInput>(k: K, v: WasteInput[K]) => onChange({ ...value, [k]: v });
  const Err = ({ k }: { k: keyof WasteInput }) => (errors[k] ? <p className="mt-1 text-xs text-destructive">{errors[k]}</p> : null);
  const L = ({ children }: { children: string }) => <label className="mb-1.5 block text-sm font-medium">{children}</label>;
  const showOther = other || custom;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <L>Waste Name / Type</L>
        <input className={cn(field, errors.name && "border-destructive")} value={value.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Cotton fabric offcuts" />
        <Err k="name" />
      </div>
      <div>
        <L>Industry / Source</L>
        <select className={cn(field, errors.industry && "border-destructive")} value={showOther ? "__other" : value.industry}
          onChange={(e) => { if (e.target.value === "__other") { setOther(true); set("industry", ""); } else { setOther(false); set("industry", e.target.value); } }}>
          <option value="">Select industry…</option>
          {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          <option value="__other">Other (custom)…</option>
        </select>
        {showOther && <input className={cn(field, "mt-2")} value={value.industry} onChange={(e) => set("industry", e.target.value)} placeholder="Enter your industry" />}
        <Err k="industry" />
      </div>
      <div>
        <L>Quantity (kg)</L>
        <input type="number" min={0} className={cn(field, errors.quantity && "border-destructive")} value={value.quantity || ""} onChange={(e) => set("quantity", Number(e.target.value))} placeholder="e.g. 250" />
        <Err k="quantity" />
      </div>
      <div className="sm:col-span-2">
        <L>Physical State</L>
        <div className="grid grid-cols-4 gap-2">
          {STATES.map((s) => (
            <button type="button" key={s} onClick={() => set("state", s)}
              className={cn("rounded-lg border py-2 text-sm font-medium transition", value.state === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent")}>{s}</button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <L>Composition / Description</L>
        <textarea rows={3} className={cn(field, "h-auto py-2", errors.composition && "border-destructive")} value={value.composition} onChange={(e) => set("composition", e.target.value)} placeholder="Materials, contaminants, chemicals, moisture…" />
        <Err k="composition" />
      </div>
      <div className="sm:col-span-2">
        <L>Current Disposal Method</L>
        <select className={cn(field, errors.disposal && "border-destructive")} value={value.disposal} onChange={(e) => set("disposal", e.target.value)}>
          <option value="">Select method…</option>
          {[...new Set([...DISPOSALS, ...(value.disposal ? [value.disposal] : [])])].map((d) => <option key={d}>{d}</option>)}
        </select>
        <Err k="disposal" />
      </div>
    </div>
  );
}
