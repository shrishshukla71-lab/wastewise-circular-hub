import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Pencil, Search, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CategoryBadge, HazardBadge, PageHeader, Panel, StatusBadge } from "@/components/ww-ui";
import { validate, WasteForm } from "@/components/WasteForm";
import { AnalysisView } from "@/components/AnalysisView";
import { analyzeWaste, type Category, type Status, type WasteRecord } from "@/lib/waste";
import { useWaste } from "@/lib/waste-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Waste Records – WasteWise AI" },
      { name: "description", content: "Search, filter, view, edit and delete your industrial waste records." },
      { property: "og:title", content: "Waste Records – WasteWise AI" },
      { property: "og:description", content: "Manage all logged industrial waste streams." },
    ],
  }),
  component: Records,
});

const FILTERS: ("All" | Category)[] = ["All", "Recyclable", "Reusable", "Hazardous"];
const STATUSES: Status[] = ["Logged", "Recycling", "Reuse Planned", "Awaiting Pickup", "Controlled Storage"];

function Records() {
  const { records, update, remove } = useWaste();
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof FILTERS)[number]>("All");
  const [view, setView] = useState<WasteRecord | null>(null);
  const [edit, setEdit] = useState<WasteRecord | null>(null);
  const [del, setDel] = useState<WasteRecord | null>(null);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});

  const list = useMemo(() => {
    const t = q.toLowerCase();
    return records.filter((r) => (f === "All" || r.category === f) && (!t || `${r.name} ${r.industry} ${r.composition}`.toLowerCase().includes(t)));
  }, [records, q, f]);

  const saveEdit = () => {
    if (!edit) return;
    const e = validate(edit); setErrors(e);
    if (Object.keys(e).length) return;
    const a = analyzeWaste(edit);
    update({ ...edit, category: a.category, hazard: a.hazard, co2Saved: a.co2Saved, analysis: a });
    setEdit(null); toast.success("Record updated");
  };

  return (
    <>
      <PageHeader title="Waste Records" subtitle={`${records.length} waste streams logged`} action={<Button asChild><Link to="/analyzer"><Plus className="h-4 w-4" />New Record</Link></Button>} />
      <Panel>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, industry or composition…" className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((x) => (
              <button key={x} onClick={() => setF(x)} className={cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", f === x ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent")}>
                {x === "Hazardous" ? "Hazardous/Controlled" : x}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{records.length ? "No records match your search or filter." : "No records yet."}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 pr-4">Waste</th><th className="pr-4">Industry</th><th className="pr-4">Qty</th><th className="pr-4">Category</th><th className="pr-4">Status</th><th className="pr-4">Date</th><th className="text-right">Actions</th></tr></thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 pr-4"><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.state}</div></td>
                    <td className="pr-4 text-muted-foreground">{r.industry}</td>
                    <td className="whitespace-nowrap pr-4">{r.quantity.toLocaleString()} kg</td>
                    <td className="pr-4"><CategoryBadge c={r.category} /></td>
                    <td className="pr-4"><StatusBadge s={r.status} /></td>
                    <td className="whitespace-nowrap pr-4 text-muted-foreground">{r.date}</td>
                    <td className="whitespace-nowrap text-right">
                      <Button variant="ghost" size="icon" aria-label="View" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => { setErrors({}); setEdit(r); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setDel(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {view && <>
            <DialogHeader><DialogTitle className="font-display">{view.name}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm sm:grid-cols-4">
              <div><div className="text-xs text-muted-foreground">Industry</div>{view.industry}</div>
              <div><div className="text-xs text-muted-foreground">Quantity</div>{view.quantity.toLocaleString()} kg</div>
              <div><div className="text-xs text-muted-foreground">State</div>{view.state}</div>
              <div><div className="text-xs text-muted-foreground">Disposal</div>{view.disposal}</div>
            </div>
            <p className="text-sm text-muted-foreground">{view.composition}</p>
            <div className="flex flex-wrap gap-2"><HazardBadge h={view.hazard} /><StatusBadge s={view.status} /></div>
            <AnalysisView a={view.analysis ?? analyzeWaste(view)} />
          </>}
        </DialogContent>
      </Dialog>

      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {edit && <>
            <DialogHeader><DialogTitle className="font-display">Edit record</DialogTitle></DialogHeader>
            <WasteForm value={edit} onChange={(v) => setEdit({ ...edit, ...v })} errors={errors} />
            <div>
              <label className="mb-1.5 block text-sm font-medium">Status</label>
              <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as Status })} className="h-10 w-full rounded-lg border bg-background px-3 text-sm">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <p className="text-xs text-muted-foreground">Category, hazard level and recommendations are re-analyzed when you save.</p>
            <DialogFooter><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={saveEdit}>Save changes</Button></DialogFooter>
          </>}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>"{del?.name}" will be permanently removed from your waste records.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (del) { remove(del.id); toast.success("Record deleted"); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
