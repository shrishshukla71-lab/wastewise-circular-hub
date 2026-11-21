import { AlertTriangle, Factory, Recycle, Repeat, ShieldCheck, Sprout } from "lucide-react";
import type { Analysis } from "@/lib/waste";
import { CategoryBadge, HazardBadge } from "./ww-ui";

function Block({ icon: Icon, title, items }: { icon: typeof Recycle; title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" />{title}</h3>
      <ul className="space-y-1.5">
        {items.map((t, i) => <li key={i} className="flex gap-2 text-sm text-muted-foreground"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-glow" /><span>{t}</span></li>)}
      </ul>
    </div>
  );
}

export function AnalysisView({ a }: { a: Analysis }) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-accent p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Classification</div>
        <div className="mt-1 font-display text-lg font-semibold">{a.classification}</div>
        <div className="mt-2 flex flex-wrap gap-2"><CategoryBadge c={a.category} /><HazardBadge h={a.hazard} /></div>
      </div>
      <Block icon={Recycle} title="Recycling Opportunities" items={a.recycling} />
      <Block icon={Repeat} title="Industrial Reuse / Upcycling" items={a.reuse} />
      <Block icon={ShieldCheck} title="Responsible Disposal & Handling" items={a.disposal} />
      <Block icon={Sprout} title="Environmental Impact" items={a.impact} />
      <Block icon={Factory} title="Practical Waste Reduction Tips" items={a.tips} />
      <div className="flex gap-2 rounded-lg border border-warning bg-warning-soft p-3 text-xs">
        <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
        <span>Preliminary AI-generated guidance. Verify with certified environmental engineers and local pollution control norms before execution.</span>
      </div>
    </div>
  );
}
