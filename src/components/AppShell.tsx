import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, Bot, FileText, FlaskConical, LayoutDashboard, Leaf, Menu, MessageSquare, Plus, RotateCcw, Database, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useWaste } from "@/lib/waste-store";
import { ChatPanel } from "./ChatPanel";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/analyzer", label: "Waste Analyzer", icon: FlaskConical },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/records", label: "Waste Records", icon: Database },
  { to: "/report", label: "Sustainability Report", icon: FileText },
] as const;

function SideNav({ onNav }: { onNav?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Leaf className="h-5 w-5" /></div>
        <div>
          <div className="font-display text-lg font-bold text-sidebar-accent-foreground">WasteWise AI</div>
          <div className="text-[11px] uppercase tracking-wider opacity-70">Industrial Waste Mgmt</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} onClick={onNav} activeOptions={{ exact: n.to === "/" }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
            <n.icon className="h-4 w-4" />{n.label}
          </Link>
        ))}
      </nav>
      <div className="m-3 rounded-lg border border-sidebar-border p-4 text-xs">
        <BarChart3 className="mb-2 h-4 w-4 text-sidebar-primary" />
        Built for MSMEs: textiles, tanneries, metal, packaging & food processing.
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobile, setMobile] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { chatOpen, setChatOpen, reset } = useWaste();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-sans">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 lg:block"><SideNav /></aside>
      {mobile && (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobile(false)} />
          <div className="relative h-full w-64">
            <SideNav onNav={() => setMobile(false)} />
            <button onClick={() => setMobile(false)} className="absolute right-3 top-5 text-sidebar-foreground" aria-label="Close menu"><X className="h-5 w-5" /></button>
          </div>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-8">
          <button className="lg:hidden" onClick={() => setMobile(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-glow opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary-glow" /></span>
            Demo Mode: Active
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setConfirm(true)}><RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Reset Sample Data</span></Button>
            <Button variant="outline" size="sm" onClick={() => setChatOpen(true)}><MessageSquare className="h-4 w-4" /><span className="hidden sm:inline">Ask AI</span></Button>
            <Button size="sm" className="bg-gradient-primary shadow-glow" onClick={() => navigate({ to: "/analyzer" })}><Plus className="h-4 w-4" />Analyze Waste</Button>
          </div>
        </header>
        <main className={cn("mx-auto max-w-7xl p-4 md:p-8")}>{children}</main>
      </div>

      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b p-4"><SheetTitle className="font-display">AI Waste Assistant</SheetTitle></SheetHeader>
          <div className="min-h-0 flex-1"><ChatPanel compact /></div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to sample data?</AlertDialogTitle>
            <AlertDialogDescription>This replaces all your saved waste records with the 6 original sample records.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { reset(); toast.success("Sample data restored"); }}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
