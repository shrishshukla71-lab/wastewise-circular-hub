export type Category = "Recyclable" | "Reusable" | "Hazardous";
export type PhysicalState = "Solid" | "Liquid" | "Sludge" | "Gas";
export type Hazard = "Low" | "Moderate" | "High";
export type Status = "Recycling" | "Reuse Planned" | "Awaiting Pickup" | "Controlled Storage" | "Logged";

export interface WasteInput {
  name: string;
  industry: string;
  quantity: number;
  state: PhysicalState;
  composition: string;
  disposal: string;
}

export interface Analysis {
  category: Category;
  classification: string;
  hazard: Hazard;
  recycling: string[];
  reuse: string[];
  disposal: string[];
  impact: string[];
  tips: string[];
  co2Saved: number;
}

export interface WasteRecord extends WasteInput {
  id: string;
  date: string;
  category: Category;
  hazard: Hazard;
  status: Status;
  co2Saved: number;
  analysis?: Analysis;
}

export const INDUSTRIES = [
  "Textiles & Dyeing",
  "Leather Tannery",
  "Metal Fabrication",
  "Packaging",
  "Food Processing",
  "Plastics & Moulding",
  "Electronics Assembly",
];
export const STATES: PhysicalState[] = ["Solid", "Liquid", "Sludge", "Gas"];
export const DISPOSALS = [
  "Municipal landfill",
  "Open dumping / burning",
  "Sold to informal scrap dealer",
  "Authorised recycler",
  "On-site storage",
  "Discharge to drain (treated)",
  "Common effluent treatment plant (CETP)",
];

export const SAMPLES: { label: string; input: WasteInput }[] = [
  {
    label: "Chrome-Tanned Leather Scraps",
    input: {
      name: "Chrome-tanned leather scraps & shavings",
      industry: "Leather Tannery",
      quantity: 420,
      state: "Solid",
      composition: "Wet-blue shavings and trimmings containing trivalent chromium (Cr III), residual fats and proteins.",
      disposal: "Municipal landfill",
    },
  },
  {
    label: "CNC Aluminum Shavings",
    input: {
      name: "CNC aluminium shavings (swarf)",
      industry: "Metal Fabrication",
      quantity: 260,
      state: "Solid",
      composition: "6061 aluminium chips coated with water-soluble cutting coolant and trace oil.",
      disposal: "Sold to informal scrap dealer",
    },
  },
  {
    label: "Textile Dye Sludge",
    input: {
      name: "Textile dye sludge",
      industry: "Textiles & Dyeing",
      quantity: 800,
      state: "Sludge",
      composition: "ETP sludge with reactive and azo dye residues, salts, and possible heavy metal traces from mordants.",
      disposal: "On-site storage",
    },
  },
];

// ---------- Rule-based analysis engine ----------
interface Rule {
  keys: string[];
  category: Category;
  hazard: Hazard;
  classification: string;
  recycling: string[];
  reuse: string[];
  disposal: string[];
  impact: string[];
  factor: number; // kg CO2e avoided per kg diverted
}

const RULES: Rule[] = [
  {
    keys: ["chrome", "tann", "wet-blue", "wet blue", "leather"],
    category: "Hazardous",
    hazard: "Moderate",
    classification: "Chromium-bearing proteinaceous solid waste",
    recycling: [
      "Send chrome shavings to an authorised chrome-recovery unit that hydrolyses shavings and recovers basic chromium sulphate for re-tanning.",
      "Collagen hydrolysis of shavings to recover protein hydrolysate for technical (non-food) use.",
      "Segregate untanned trimmings (pre-chrome) for gelatin or glue manufacturers.",
    ],
    reuse: [
      "Bond larger chrome-tanned trimmings into leather board / bonded leather for shoe counters and book covers.",
      "Upcycle offcuts into small goods: key fobs, coasters, patches and labels.",
      "Use as filler in composite panels after testing leachate stability.",
    ],
    disposal: [
      "Never burn chrome-tanned leather: open burning can oxidise Cr(III) to toxic Cr(VI).",
      "Store in covered, impermeable, labelled bins away from rain and alkaline material.",
      "Hand over only to a facility authorised by your State Pollution Control Board for hazardous waste.",
    ],
    impact: [
      "Landfilled chrome waste can leach chromium into groundwater over time.",
      "Recovering chromium reduces demand for fresh chromium salts and their mining footprint.",
    ],
    factor: 1.2,
  },
  {
    keys: ["alumin", "swarf", "copper", "brass", "steel", "iron", "metal", "scrap", "shaving", "chip"],
    category: "Recyclable",
    hazard: "Low",
    classification: "Non-ferrous / ferrous metal scrap (coolant-contaminated)",
    recycling: [
      "Segregate by alloy grade at the machine – mixed alloys sell for significantly less.",
      "Use a chip spinner / centrifuge or briquetting press to remove coolant before sale; dry briquettes command better prices.",
      "Sell to an authorised secondary smelter with a weighbridge receipt for traceability.",
    ],
    reuse: [
      "Recover and filter drained coolant for reuse in the CNC sump.",
      "Larger offcuts can be reused for jigs, fixtures, brackets and prototype parts.",
      "Partner with local foundries for direct closed-loop re-melt arrangements.",
    ],
    disposal: [
      "Store chips in drip trays to collect coolant; do not let oily run-off reach drains.",
      "Treat collected waste oil/coolant as used oil and hand it to an authorised re-refiner.",
      "Keep fine chips away from ignition sources – fine metal dust can be combustible.",
    ],
    impact: [
      "Recycled aluminium uses roughly 5% of the energy needed for primary aluminium.",
      "Removing coolant prevents oil contamination of soil and storm drains.",
    ],
    factor: 8.0,
  },
  {
    keys: ["dye", "sludge", "etp", "effluent", "azo"],
    category: "Hazardous",
    hazard: "High",
    classification: "Effluent treatment sludge with dye and possible heavy-metal residues",
    recycling: [
      "Get the sludge tested (TCLP / leachate test) – the result determines whether co-processing is permitted.",
      "Explore co-processing in cement kilns through an authorised operator, where the sludge's calorific value and inert content are used.",
      "Investigate dye recovery or reuse of salt-rich reject streams via your CETP or ZLD provider.",
    ],
    reuse: [
      "If tests show non-hazardous status, stabilised sludge may be trialled in non-structural bricks or paver blocks – only with regulatory approval.",
      "Reuse treated water from the ETP for floor washing or initial rinse cycles.",
    ],
    disposal: [
      "Dewater (filter press / drying beds) to cut volume and transport cost.",
      "Store on an impermeable, roofed platform with leachate collection.",
      "Dispose only via a Treatment, Storage and Disposal Facility (TSDF) with manifest records.",
    ],
    impact: [
      "Untreated dye sludge can contaminate soil and water and harm aquatic life.",
      "Volume reduction through dewatering directly lowers disposal cost and transport emissions.",
    ],
    factor: 0.4,
  },
  {
    keys: ["cotton", "fabric", "textile", "yarn", "cutting", "fibre", "fiber", "rag"],
    category: "Reusable",
    hazard: "Low",
    classification: "Post-industrial textile waste",
    recycling: [
      "Sort by fibre (cotton, polyester, blends) and colour – pure streams fetch higher value.",
      "Send cotton cuttings to mechanical recyclers for shoddy / recycled yarn.",
      "Polyester waste can go to PET fibre recyclers.",
    ],
    reuse: [
      "Convert offcuts into cleaning rags, stuffing, patchwork or small accessories.",
      "Supply to non-woven felt or insulation manufacturers.",
      "Offer to local artisans and self-help groups for upcycled products.",
    ],
    disposal: [
      "Keep dry and baled to prevent mould and fire risk.",
      "Avoid open burning – synthetic fibres release toxic fumes.",
    ],
    impact: [
      "Each kg of recycled cotton avoids significant water and energy used in virgin fibre production.",
    ],
    factor: 3.0,
  },
  {
    keys: ["cardboard", "carton", "paper", "corrugat", "kraft"],
    category: "Recyclable",
    hazard: "Low",
    classification: "Fibre-based packaging waste",
    recycling: [
      "Bale clean, dry corrugated board and sell to paper mills.",
      "Keep wax-coated or food-soiled board separate – it lowers bale value.",
    ],
    reuse: [
      "Reuse intact cartons for internal material movement or outbound shipping.",
      "Shred into void-fill packing material.",
    ],
    disposal: ["Store under cover; wet board loses value and can rot.", "Compost heavily soiled paper where permitted."],
    impact: ["Recycling paper reduces pressure on forests and landfill methane emissions."],
    factor: 0.9,
  },
  {
    keys: ["plastic", "ldpe", "hdpe", "pet", "film", "polyprop", "wrap", "pp "],
    category: "Recyclable",
    hazard: "Low",
    classification: "Thermoplastic packaging / process scrap",
    recycling: [
      "Segregate by polymer type (PET, HDPE, LDPE, PP) using resin codes.",
      "Grind clean in-house regrind and reuse in non-critical moulding (typically up to 10–20% blend).",
      "Sell baled film to authorised plastic recyclers registered under EPR rules.",
    ],
    reuse: ["Reuse stretch film cores and pallets with suppliers.", "Convert scrap into regrind for low-grade products."],
    disposal: ["Never burn plastic waste.", "Store away from heat; keep contaminated film separate."],
    impact: ["Recycled plastic cuts fossil feedstock demand and marine leakage risk."],
    factor: 1.5,
  },
  {
    keys: ["food", "peel", "organic", "husk", "whey", "spent", "vegetable", "fruit", "bran"],
    category: "Reusable",
    hazard: "Low",
    classification: "Biodegradable organic process residue",
    recycling: [
      "Compost or vermicompost on-site, or send to a biogas digester.",
      "Partner with a biogas / bio-CNG plant for energy recovery.",
    ],
    reuse: [
      "Supply suitable by-products as animal feed (subject to food safety checks).",
      "Extract value-added products: pectin from peels, protein from whey, fibre from husks.",
    ],
    disposal: [
      "Collect daily in closed bins to avoid odour, pests and leachate.",
      "Do not mix with plastics or chemicals.",
    ],
    impact: ["Diverting organics from landfill avoids methane, a potent greenhouse gas."],
    factor: 0.6,
  },
  {
    keys: ["solvent", "acid", "alkali", "chemical", "oil", "paint", "thinner", "battery", "e-waste", "pcb"],
    category: "Hazardous",
    hazard: "High",
    classification: "Chemical / controlled hazardous waste",
    recycling: [
      "Spent solvents can often be distilled and recovered by authorised solvent recyclers.",
      "Used oil should go to a registered re-refiner.",
      "E-waste and batteries must go to authorised dismantlers / recyclers.",
    ],
    reuse: ["Reuse recovered solvent for equipment cleaning.", "Return chemical containers to suppliers under take-back schemes."],
    disposal: [
      "Store in compatible, sealed, labelled containers with secondary containment.",
      "Keep incompatible chemicals apart; maintain Safety Data Sheets on site.",
      "Dispose only via a licensed TSDF with manifest documentation.",
    ],
    impact: ["Improper disposal can cause soil and groundwater contamination and fire risk."],
    factor: 0.5,
  },
];

const FALLBACK: Rule = {
  keys: [],
  category: "Recyclable",
  hazard: "Moderate",
  classification: "Mixed industrial process waste (requires characterisation)",
  recycling: [
    "Run a basic waste characterisation (composition, moisture, contaminants) to identify recyclable fractions.",
    "Segregate at source into dry recyclables, organics and potentially hazardous material.",
    "Contact authorised recyclers in your area with a sample and composition sheet.",
  ],
  reuse: [
    "Check if neighbouring units could use this stream as a raw material (industrial symbiosis).",
    "Explore take-back arrangements with your raw-material supplier.",
  ],
  disposal: [
    "Store in labelled, covered containers until characterised.",
    "If hazard status is unclear, treat as hazardous until proven otherwise.",
  ],
  impact: ["Better segregation typically unlocks recycling revenue and lowers landfill fees."],
  factor: 0.5,
};

export function analyzeWaste(input: WasteInput): Analysis {
  const text = `${input.name} ${input.composition} ${input.industry}`.toLowerCase();
  let best = FALLBACK;
  let bestScore = 0;
  for (const r of RULES) {
    const score = r.keys.reduce((s, k) => s + (text.includes(k) ? 1 : 0), 0);
    if (score > bestScore) {
      best = r;
      bestScore = score;
    }
  }
  let hazard = best.hazard;
  let category = best.category;
  const disposal = [...best.disposal];
  const tips: string[] = [];

  if (input.state === "Liquid" || input.state === "Sludge") {
    if (hazard === "Low") hazard = "Moderate";
    disposal.unshift(`${input.state} waste: use leak-proof containers with bunding / secondary containment to prevent spills.`);
    tips.push("Install flow meters on process lines to find the biggest sources of liquid loss.");
  }
  if (input.state === "Gas") {
    hazard = "High";
    category = "Hazardous";
    disposal.unshift("Gaseous emissions need capture (scrubbers, filters) and monitoring under your air consent conditions.");
  }
  if (/heavy metal|lead|cadmium|mercury|cr\(vi\)|hexavalent|toxic/.test(text)) {
    hazard = "High";
    category = "Hazardous";
  }
  const d = input.disposal.toLowerCase();
  if (d.includes("burn") || d.includes("dump")) {
    tips.push("Stop open dumping/burning immediately – it is a major health and compliance risk.");
  }
  if (d.includes("landfill")) {
    tips.push(`Diverting this ${input.quantity.toLocaleString()} kg stream from landfill should be the first priority.`);
  }
  if (d.includes("informal")) {
    tips.push("Shift from informal dealers to authorised recyclers to get receipts and traceability for audits.");
  }
  if (input.quantity >= 1000) {
    tips.push("At this volume, a dedicated segregation area and monthly recycler contract are usually cost-effective.");
  } else if (input.quantity < 100) {
    tips.push("For small volumes, pool waste with nearby units for collection to reach viable recycler minimums.");
  }
  tips.push(
    `Track this stream monthly in WasteWise to measure reduction against today's ${input.quantity.toLocaleString()} kg baseline.`,
    "Train operators on source segregation with colour-coded bins and simple visual guides.",
  );

  const divertible = category === "Hazardous" ? 0.3 : 0.85;
  const co2Saved = Math.round(input.quantity * best.factor * divertible);

  return {
    category,
    hazard,
    classification: best.classification,
    recycling: best.recycling,
    reuse: best.reuse,
    disposal,
    impact: [
      ...best.impact,
      `Estimated ~${co2Saved.toLocaleString()} kg CO2e could be avoided by diverting this stream (indicative estimate).`,
    ],
    tips,
    co2Saved,
  };
}

export function defaultStatus(c: Category): Status {
  return c === "Recyclable" ? "Recycling" : c === "Reusable" ? "Reuse Planned" : "Controlled Storage";
}

function rec(id: string, date: string, input: WasteInput, status: Status): WasteRecord {
  const a = analyzeWaste(input);
  return { ...input, id, date, category: a.category, hazard: a.hazard, co2Saved: a.co2Saved, status, analysis: a };
}

export function seedRecords(): WasteRecord[] {
  return [
    rec("seed-1", "2026-06-12", { name: "Cotton fabric cutting waste", industry: "Textiles & Dyeing", quantity: 1250, state: "Solid", composition: "Mixed-colour 100% cotton offcuts from cutting tables.", disposal: "Sold to informal scrap dealer" }, "Reuse Planned"),
    rec("seed-2", "2026-07-03", SAMPLES[1]!.input, "Recycling"),
    rec("seed-3", "2026-08-18", { name: "Corrugated cardboard cartons", industry: "Packaging", quantity: 940, state: "Solid", composition: "Clean 3-ply and 5-ply corrugated boxes from inbound material.", disposal: "Authorised recycler" }, "Recycling"),
    rec("seed-4", "2026-09-07", SAMPLES[0]!.input, "Controlled Storage"),
    rec("seed-5", "2026-10-14", { name: "Fruit peel and pulp residue", industry: "Food Processing", quantity: 1600, state: "Solid", composition: "Mango and citrus peels, seeds and pulp from juice line.", disposal: "Municipal landfill" }, "Reuse Planned"),
    rec("seed-6", "2026-11-02", SAMPLES[2]!.input, "Awaiting Pickup"),
  ];
}

export function computeStats(records: WasteRecord[]) {
  const total = records.reduce((s, r) => s + r.quantity, 0);
  const by = (c: Category) => records.filter((r) => r.category === c).reduce((s, r) => s + r.quantity, 0);
  const recyclable = by("Recyclable");
  const reusable = by("Reusable");
  const hazardous = by("Hazardous");
  const diversion = total ? Math.round(((recyclable + reusable) / total) * 100) : 0;
  const co2 = records.reduce((s, r) => s + r.co2Saved, 0);
  return { total, recyclable, reusable, hazardous, diversion, co2, streams: records.length };
}

export function monthlyTrend(records: WasteRecord[]) {
  const map = new Map<string, { month: string; diverted: number; disposed: number; key: string }>();
  for (const r of records) {
    const key = r.date.slice(0, 7);
    const d = new Date(r.date + "T00:00:00");
    const month = d.toLocaleString("en", { month: "short" });
    const e = map.get(key) ?? { month, diverted: 0, disposed: 0, key };
    if (r.category === "Hazardous") e.disposed += r.quantity;
    else e.diverted += r.quantity;
    map.set(key, e);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

// ---------- Chat assistant ----------
export const STARTERS = [
  "How can a small textile unit reduce dye water waste?",
  "Reuse ideas for metal scrap?",
  "What is a circular waste audit?",
  "Safe storage for chemical sludge?",
];

const ANSWERS: { keys: string[]; answer: string }[] = [
  {
    keys: ["dye", "textile", "water"],
    answer: `**Reducing dye water waste in a small textile unit**

1. **Measure first** – fit simple water meters on dyeing machines to find the highest-use steps.
2. **Lower liquor ratio** – moving to low-liquor-ratio machines or optimised batches can cut water use substantially.
3. **Right-first-time dyeing** – standardise recipes, weigh chemicals accurately and control pH/temperature to reduce re-dyeing.
4. **Reuse rinse water** – collect the final, cleaner rinse and reuse it for the first rinse of the next batch.
5. **Segregate streams** – keep concentrated dye bath separate from rinse water; it makes treatment cheaper.
6. **Switch chemistry** – use high-fixation reactive dyes and low-salt recipes where possible.

**Next step:** run a one-week water balance and log each stream in the Waste Analyzer.

_Verify treatment changes with a qualified environmental engineer and your State Pollution Control Board norms._`,
  },
  {
    keys: ["metal", "scrap", "aluminium", "aluminum", "steel", "swarf"],
    answer: `**Reuse & value ideas for metal scrap**

- **Segregate by alloy** at each machine – clean, single-grade scrap earns much more.
- **Briquette chips** to squeeze out coolant; reuse filtered coolant in your machines.
- **Reuse offcuts** for jigs, fixtures, brackets, shims and prototypes.
- **Nest parts better** – nesting software on laser/plasma cutting reduces skeleton scrap.
- **Closed-loop contracts** – agree with a local foundry or supplier to take back your scrap at a fixed rate.
- **Keep records** – weighbridge slips from authorised recyclers support audits and ESG reporting.

_Prices and grades vary locally; confirm with authorised recyclers._`,
  },
  {
    keys: ["audit", "circular"],
    answer: `**What is a circular waste audit?**

A structured review of every material that enters and leaves your unit, to find where waste can be avoided, reused or recycled.

**Typical steps:**
1. **Map the process** – list raw materials, process steps and outputs.
2. **Quantify waste streams** – weigh each stream for 1–4 weeks.
3. **Characterise** – composition, hazard level, contamination.
4. **Apply the hierarchy** – Reduce → Reuse → Recycle → Recover → Dispose.
5. **Find partners** – recyclers, neighbouring units (industrial symbiosis), suppliers' take-back.
6. **Set targets & track** – e.g. diversion rate, kg per unit produced.

WasteWise's Records and Report tabs help you with steps 2, 5 and 6.`,
  },
  {
    keys: ["sludge", "chemical", "storage", "store", "hazard"],
    answer: `**Safe storage for chemical sludge**

- **Container:** compatible, closed, leak-proof drums or lined bags; never open heaps.
- **Location:** roofed, impermeable (concrete) floor with bunding and leachate collection.
- **Labelling:** waste name, hazard symbols, date of generation, source.
- **Segregation:** keep acids, alkalis, oxidisers and oily waste apart.
- **PPE & access:** gloves, goggles, masks; restrict access to trained staff.
- **Time limits:** hazardous waste generally should not be stored indefinitely – check the storage period allowed under your local hazardous waste rules.
- **Disposal:** only through a licensed TSDF or authorised co-processor, with manifests kept on file.

_Confirm specifics with your State Pollution Control Board and a certified environmental consultant._`,
  },
  {
    keys: ["plastic", "packag", "film"],
    answer: `**Reducing packaging & plastic waste**

- Agree **returnable crates/pallets** with your top suppliers and customers.
- **Segregate by resin type** (PET, HDPE, LDPE, PP) for higher recycler value.
- Reuse clean **regrind** in non-critical products.
- Right-size boxes and switch to **mono-material** packaging for easier recycling.
- Work only with recyclers registered under applicable EPR rules.`,
  },
  {
    keys: ["food", "organic", "compost", "biogas"],
    answer: `**Managing food-processing waste**

- **Prevent:** improve yield (peeling, trimming settings) and stock rotation.
- **Feed:** suitable by-products to animal feed (with safety checks).
- **Extract value:** pectin from peels, protein from whey, oil from seeds.
- **Recover energy:** biogas digesters or bio-CNG partnerships.
- **Compost:** on-site windrow or vermicomposting for residues.

Keep organics free of plastic and chemicals to keep these options open.`,
  },
];

export function chatReply(q: string): string {
  const t = q.toLowerCase();
  let best: string | null = null;
  let bestScore = 0;
  for (const a of ANSWERS) {
    const s = a.keys.reduce((n, k) => n + (t.includes(k) ? 1 : 0), 0);
    if (s > bestScore) {
      bestScore = s;
      best = a.answer;
    }
  }
  if (best) return best;
  return `**General guidance for small manufacturing units**

1. **Segregate at source** – colour-coded bins for dry recyclables, organics and hazardous waste.
2. **Measure** – weigh each waste stream weekly; you can't reduce what you don't track.
3. **Apply the waste hierarchy** – Reduce → Reuse → Recycle → Recover → Dispose.
4. **Use authorised partners** – keep receipts and manifests for compliance.
5. **Look for industrial symbiosis** – your waste may be another unit's raw material.

Try the **Waste Analyzer** with your specific waste for tailored recommendations, or ask me about textiles, metals, packaging, food waste, sludge or circular audits.

_I provide preliminary guidance only and cannot certify compliance._`;
}
