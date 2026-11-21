import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chatReply, STARTERS } from "@/lib/waste";
import { Markdown } from "./ww-ui";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; text: string }

export function ChatPanel({ compact }: { compact?: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs, typing]);

  const send = (q: string) => {
    const text = q.trim();
    if (!text || typing) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "assistant", text: chatReply(text) }]);
      setTyping(false);
    }, 900);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {msgs.length === 0 && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow"><Bot className="h-6 w-6" /></div>
            <h3 className="font-display text-lg font-semibold">WasteWise Copilot</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Ask about waste segregation, recycling pathways and circular practices for small manufacturing units.</p>
            <div className={cn("mx-auto mt-5 grid gap-2", compact ? "" : "max-w-2xl sm:grid-cols-2")}>
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-lg border bg-card px-3 py-2.5 text-left text-sm transition hover:border-primary-glow hover:bg-accent">{s}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", m.role === "user" ? "bg-muted" : "bg-gradient-primary text-primary-foreground")}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn("max-w-[85%] rounded-xl px-4 py-3", m.role === "user" ? "bg-primary text-primary-foreground" : "border bg-card")}>
              {m.role === "user" ? <p className="text-sm">{m.text}</p> : <Markdown text={m.text} />}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"><Bot className="h-4 w-4" /></div>
            <div className="flex items-center gap-1 rounded-xl border bg-card px-4 py-3">
              {[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-primary-glow" style={{ animationDelay: `${d * 150}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your industrial waste…" className="h-10 flex-1 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <Button type="submit" disabled={!input.trim() || typing} aria-label="Send"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
