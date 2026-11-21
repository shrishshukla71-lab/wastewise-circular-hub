import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedRecords, type WasteRecord } from "./waste";

const KEY = "wastewise-records-v1";

interface Store {
  records: WasteRecord[];
  add: (r: WasteRecord) => void;
  update: (r: WasteRecord) => void;
  remove: (id: string) => void;
  reset: () => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
}

const Ctx = createContext<Store | null>(null);

export function WasteProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<WasteRecord[]>(() => seedRecords());
  const [loaded, setLoaded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setRecords(JSON.parse(raw) as WasteRecord[]);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(records));
  }, [records, loaded]);

  const value: Store = {
    records,
    add: (r) => setRecords((p) => [r, ...p]),
    update: (r) => setRecords((p) => p.map((x) => (x.id === r.id ? r : x))),
    remove: (id) => setRecords((p) => p.filter((x) => x.id !== id)),
    reset: () => setRecords(seedRecords()),
    chatOpen,
    setChatOpen,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWaste() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useWaste outside provider");
  return c;
}
