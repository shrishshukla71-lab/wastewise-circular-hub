import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Save, Sparkles, Wand2, FlaskConical, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, Panel } from "@/components/ww-ui";
import { EMPTY, validate, WasteForm } from "@/components/WasteForm";
import { AnalysisView } from "@/components/AnalysisView";
import { analyzeWaste, defaultStatus, SAMPLES, type Analysis, type WasteInput } from "@/lib/waste";
import { useWaste } from "@/lib/waste-store";

export const Route = createFileRoute("/analyzer")({
  head: () => ({
    meta: [
      { title: "Waste Analyzer – WasteWise AI" },
      { name: "description", content: "Analyze any industrial waste stream for classification, recycling, reuse and safe disposal guidance." },
      { property: "og:title", content: "Waste Analyzer – WasteWise AI" },
      { property: "og:description", content: "AI guidance on recycling and reuse for industrial waste." },
    ],
  }),
  component: Analyzer,
});

function Analyzer() {
  const [v, setV] = useState<WasteInput>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ a: Analysis; input: WasteInput } | null>(null);
  const [saved, setSaved] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const { add } = useWaste();
  const navigate = useNavigate();

  const run = () => {
    const e = validate(v);
    setErrors(e);
    if (Object.keys(e).length) { toast.error("Please fix the highlighted fields"); return; }
    setLoading(true); setResult(null); setSaved(false);
    setTimeout(() => { setResult({ a: analyzeWaste(v), input: v }); setLoading(false); }, 1400);
  };

  const save = () => {
    if (!result) return;
    const { a, input } = result;
    add({ ...input, id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), category: a.category, hazard: a.hazard, co2Saved: a.co2Saved, status: defaultStatus(a.category), analysis: a });
    setSaved(true);
    toast.success("Saved to Waste Records", { action: { label: "View", onClick: () => navigate({ to: "/records" }) } });
  };

  return (
    <>
      <PageHeader title="Waste Analyzer" subtitle="Describe a waste stream and get tailored circular-economy recommendations." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium"><Wand2 className="h-4 w-4 text-primary" />1-Click Sample Autofill</div>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button key={s.label} onClick={() => { setV(s.input); setErrors({}); setFormKey((k) => k + 1); }}
                  className="rounded-full border bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition hover:border-primary-glow">{s.label}</button>
              ))}
            </div>
          </div>
          <WasteForm key={formKey} value={v} onChange={setV} errors={errors} />
          <div className="mt-6 flex gap-2">
            <Button className="flex-1 bg-gradient-primary shadow-glow" onClick={run} disabled={loading}><Sparkles className="h-4 w-4" />{loading ? "Analyzing…" : "Analyze Waste"}</Button>
            <Button variant="outline" onClick={() => { setV(EMPTY); setErrors({}); setResult(null); setFormKey((k) => k + 1); }}>Clear</Button>
          </div>
        </Panel>
        <Panel title="AI Analysis" action={result && <Button size="sm" onClick={save} disabled={saved}>{saved ? <><CheckCircle2 className="h-4 w-4" />Saved</> : <><Save className="h-4 w-4" />Save to Waste Records</>}</Button>}>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              {[0, 1, 2, 3].map((i) => <div key={i} className="space-y-2"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-5/6" /></div>)}
            </div>
          ) : result ? (
            <>
              <AnalysisView a={result.a} />
              <Button className="mt-5 w-full" size="lg" onClick={save} disabled={saved}>{saved ? <><CheckCircle2 className="h-4 w-4" />Saved to Waste Records</> : <><Save className="h-4 w-4" />Save to Waste Records</>}</Button>
            </>
          ) : (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-primary"><FlaskConical className="h-7 w-7" /></div>
              <p className="font-medium">No analysis yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Fill in the form or pick a sample, then click Analyze Waste.</p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
