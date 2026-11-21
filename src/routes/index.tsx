import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Recycle, Scale, Layers, ArrowRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useWaste } from "@/lib/waste-store";
import { computeStats, monthlyTrend } from "@/lib/waste";
import { CategoryBadge, PageHeader, Panel, StatusBadge } from "@/components/ww-ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview – WasteWise AI" },
      { name: "description", content: "Industrial waste dashboard: totals, diversion rate, CO2e saved and monthly trends." },
      { property: "og:title", content: "WasteWise AI – Smart Industrial Waste Management" },
      { property: "og:description", content: "Track industrial waste, find recycling and reuse opportunities, and report on sustainability." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { records } = useWaste();
  const s = computeStats(records);
  const pie = [
    { name: "Recyclable", value: s.recyclable, color: "var(--chart-1)" },
    { name: "Reusable", value: s.reusable, color: "var(--chart-2)" },
    { name: "Hazardous", value: s.hazardous, color: "var(--chart-3)" },
  ].filter((p) => p.value > 0);
  const trend = monthlyTrend(records);
  const kpis = [
    { label: "Total Waste Recorded", value: `${s.total.toLocaleString()} kg`, icon: Scale },
    { label: "Diversion Rate", value: `${s.diversion}%`, icon: Recycle, sub: "Recyclable + Reusable" },
    { label: "Est. CO2e Saved", value: `${s.co2.toLocaleString()} kg`, icon: Leaf },
    { label: "Active Waste Streams", value: s.streams, icon: Layers },
  ];
  return (
    <>
      <PageHeader title="Overview" subtitle="Live snapshot of your facility's waste streams and circularity performance." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{k.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary"><k.icon className="h-4 w-4" /></span>
            </div>
            <div className="mt-3 font-display text-2xl font-bold">{k.value}</div>
            {k.sub && <div className="text-xs text-muted-foreground">{k.sub}</div>}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Panel title="Waste Distribution" className="lg:col-span-2">
          {pie.length === 0 ? <Empty /> : (
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                    {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} kg`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
        <Panel title="Monthly Diversion Trend" className="lg:col-span-3">
          {trend.length === 0 ? <Empty /> : (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip formatter={(v: number) => `${v.toLocaleString()} kg`} />
                  <Legend />
                  <Bar dataKey="diverted" name="Diverted (kg)" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="disposed" name="Controlled disposal (kg)" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>
      <Panel title="Recent Waste Activity" className="mt-6" action={<Link to="/records" className="flex items-center gap-1 text-sm font-medium text-primary">View all <ArrowRight className="h-4 w-4" /></Link>}>
        {records.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-4">Waste</th><th className="pr-4">Industry</th><th className="pr-4">Qty</th><th className="pr-4">Category</th><th>Status</th></tr></thead>
              <tbody>
                {[...records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{r.name}</td>
                    <td className="pr-4 text-muted-foreground">{r.industry}</td>
                    <td className="pr-4">{r.quantity.toLocaleString()} kg</td>
                    <td className="pr-4"><CategoryBadge c={r.category} /></td>
                    <td><StatusBadge s={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}

function Empty() {
  return <div className="py-12 text-center text-sm text-muted-foreground">No records yet. <Link to="/analyzer" className="font-medium text-primary">Analyze your first waste stream</Link>.</div>;
}
