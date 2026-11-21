import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer, Leaf } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CategoryBadge, PageHeader } from "@/components/ww-ui";
import { analyzeWaste, computeStats, type WasteRecord } from "@/lib/waste";
import { useWaste } from "@/lib/waste-store";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Sustainability Report – WasteWise AI" },
      { name: "description", content: "Printable executive sustainability summary generated from your waste records." },
      { property: "og:title", content: "Sustainability Report – WasteWise AI" },
      { property: "og:description", content: "Executive summary of waste, diversion and circular reuse opportunities." },
    ],
  }),
  component: Report,
});

function csvCell(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(records: WasteRecord[]) {
  const s = computeStats(records);
  const rows: (string | number)[][] = [
    ["WasteWise AI Sustainability Report", new Date().toISOString().slice(0, 10)],
    [],
    ["Total waste (kg)", s.total], ["Recyclable (kg)", s.recyclable], ["Reusable (kg)", s.reusable], ["Hazardous/Controlled (kg)", s.hazardous],
    ["Diversion rate (%)", s.diversion], ["Est. CO2e saved (kg)", s.co2],
    [],
    ["Date", "Waste", "Industry", "Quantity (kg)", "State", "Category", "Hazard", "Status", "Disposal", "Est. CO2e saved (kg)"],
    ...records.map((r) => [r.date, r.name, r.industry, r.quantity, r.state, r.category, r.hazard, r.status, r.disposal, r.co2Saved]),
  ];
  const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `wastewise-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast.success("CSV report downloaded");
}

function Report() {
  const { records } = useWaste();
  const s = computeStats(records);
  const top = [...records].sort((a, b) => b.quantity - a.quantity).slice(0, 4);
  const pct = (n: number) => (s.total ? Math.round((n / s.total) * 100) : 0);
  const roadmap = [
    s.hazardous > 0 && { t: "0–30 days", d: `Secure compliant storage and authorised TSDF disposal for ${s.hazardous.toLocaleString()} kg of hazardous/controlled waste.` },
    records.some((r) => /landfill|dump|burn/i.test(r.disposal)) && { t: "0–30 days", d: "Stop landfill / open dumping for streams with recycling or reuse pathways identified." },
    { t: "1–3 months", d: "Introduce colour-coded source segregation and train operators at each workstation." },
    records.some((r) => /informal/i.test(r.disposal)) && { t: "1–3 months", d: "Move scrap sales from informal dealers to authorised recyclers with receipts." },
    { t: "3–6 months", d: `Raise diversion rate from ${s.diversion}% toward ${Math.min(95, s.diversion + 15)}% via recycler contracts and in-house reuse.` },
    { t: "6–12 months", d: "Run a full circular waste audit and explore industrial symbiosis with neighbouring units." },
  ].filter(Boolean) as { t: string; d: string }[];

  return (
    <>
      <PageHeader title="Sustainability Report" subtitle="Executive summary generated live from your waste records."
        action={<div className="no-print flex gap-2">
          <Button variant="outline" onClick={() => downloadCsv(records)} disabled={!records.length}><Download className="h-4 w-4" />Download CSV</Button>
          <Button onClick={() => window.print()} disabled={!records.length}><Printer className="h-4 w-4" />Print / Save PDF</Button>
        </div>} />
      {records.length === 0 ? (
        <div className="rounded-xl border bg-card py-20 text-center text-sm text-muted-foreground">Add waste records to generate a report.</div>
      ) : (
        <article className="rounded-xl border bg-card p-6 shadow-card md:p-10">
          <div className="flex items-start justify-between border-b pb-6">
            <div>
              <div className="flex items-center gap-2 text-primary"><Leaf className="h-5 w-5" /><span className="font-display font-bold">WasteWise AI</span></div>
              <h2 className="mt-3 font-display text-2xl font-bold">Industrial Waste & Circularity Summary</h2>
              <p className="text-sm text-muted-foreground">Generated {new Date().toLocaleDateString("en", { dateStyle: "long" })} · {records.length} waste streams</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 py-6 md:grid-cols-4">
            {[["Total Waste", `${s.total.toLocaleString()} kg`], ["Diversion Rate", `${s.diversion}%`], ["Est. CO2e Saved", `${s.co2.toLocaleString()} kg`], ["Waste Streams", s.streams]].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-accent p-4"><div className="text-xs text-muted-foreground">{l}</div><div className="font-display text-xl font-bold">{v}</div></div>
            ))}
          </div>
          <h3 className="mb-3 font-display font-semibold">Category Breakdown</h3>
          <div className="space-y-3">
            {([["Recyclable", s.recyclable, "bg-chart-1"], ["Reusable", s.reusable, "bg-chart-2"], ["Hazardous / Controlled", s.hazardous, "bg-chart-3"]] as const).map(([l, v, c]) => (
              <div key={l}>
                <div className="mb-1 flex justify-between text-sm"><span>{l}</span><span className="text-muted-foreground">{v.toLocaleString()} kg · {pct(v)}%</span></div>
                <div className="h-2 rounded-full bg-muted"><div className={`h-2 rounded-full ${c}`} style={{ width: `${pct(v)}%` }} /></div>
              </div>
            ))}
          </div>
          <h3 className="mb-3 mt-8 font-display font-semibold">Top Circular Reuse Recommendations</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {top.map((r) => {
              const a = r.analysis ?? analyzeWaste(r);
              return (
                <div key={r.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2"><div className="font-medium">{r.name}</div><CategoryBadge c={r.category} /></div>
                  <div className="text-xs text-muted-foreground">{r.quantity.toLocaleString()} kg · {r.industry}</div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {[a.reuse[0], a.recycling[0]].filter(Boolean).map((t, i) => <li key={i}>• {t}</li>)}
                  </ul>
                </div>
              );
            })}
          </div>
          <h3 className="mb-3 mt-8 font-display font-semibold">Actionable Reduction Roadmap</h3>
          <ol className="space-y-3">
            {roadmap.map((r, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                <div><div className="text-xs font-semibold uppercase tracking-wider text-primary">{r.t}</div><div className="text-sm">{r.d}</div></div>
              </li>
            ))}
          </ol>
          <p className="mt-8 border-t pt-4 text-xs text-muted-foreground">Preliminary AI-generated guidance. CO2e figures are indicative estimates. Verify with certified environmental engineers and local pollution control norms before execution.</p>
        </article>
      )}
    </>
  );
}
