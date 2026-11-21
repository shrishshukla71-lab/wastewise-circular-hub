import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Category, Hazard, Status } from "@/lib/waste";

const catStyle: Record<Category, string> = {
  Recyclable: "bg-secondary text-secondary-foreground",
  Reusable: "bg-info-soft text-info",
  Hazardous: "bg-danger-soft text-destructive",
};
export function CategoryBadge({ c }: { c: Category }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", catStyle[c])}>{c === "Hazardous" ? "Hazardous / Controlled" : c}</span>;
}
const hazStyle: Record<Hazard, string> = {
  Low: "bg-secondary text-secondary-foreground",
  Moderate: "bg-warning-soft text-foreground",
  High: "bg-destructive text-destructive-foreground",
};
export function HazardBadge({ h }: { h: Hazard }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", hazStyle[h])}>{h} hazard</span>;
}
export function StatusBadge({ s }: { s: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", s === "Controlled Storage" || s === "Awaiting Pickup" ? "bg-warning" : "bg-primary-glow")} />
      {s}
    </span>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-card", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="font-display text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

/** Tiny markdown: **bold**, _italic_, lists, numbered lists, paragraphs. */
export function Markdown({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((p, i) =>
      p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p.startsWith("_") && p.endsWith("_") && p.length > 2 ? <em key={i} className="text-muted-foreground">{p.slice(1, -1)}</em> : p,
    );
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {text.split("\n").map((l, i) => {
        if (!l.trim()) return <div key={i} className="h-1" />;
        const b = l.match(/^- (.*)/);
        if (b) return <div key={i} className="flex gap-2 pl-1"><span className="text-primary-glow">•</span><span>{inline(b[1]!)}</span></div>;
        const n = l.match(/^(\d+)\. (.*)/);
        if (n) return <div key={i} className="flex gap-2 pl-1"><span className="font-semibold text-primary">{n[1]}.</span><span>{inline(n[2]!)}</span></div>;
        return <p key={i}>{inline(l)}</p>;
      })}
    </div>
  );
}
