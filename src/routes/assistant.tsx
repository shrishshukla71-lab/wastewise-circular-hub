import { createFileRoute } from "@tanstack/react-router";
import { ChatPanel } from "@/components/ChatPanel";
import { PageHeader } from "@/components/ww-ui";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Waste Assistant – WasteWise AI" },
      { name: "description", content: "Chat with an industrial sustainability copilot about segregation, recycling and circular practices." },
      { property: "og:title", content: "AI Waste Assistant – WasteWise AI" },
      { property: "og:description", content: "Sustainability copilot for small manufacturing units." },
    ],
  }),
  component: () => (
    <>
      <PageHeader title="AI Waste Assistant" subtitle="Your copilot for circular economy and safe waste handling in small-scale manufacturing." />
      <div className="h-[calc(100vh-14rem)] min-h-[500px] overflow-hidden rounded-xl border bg-card shadow-card"><ChatPanel /></div>
    </>
  ),
});
