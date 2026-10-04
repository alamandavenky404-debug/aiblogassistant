import { createFileRoute } from "@tanstack/react-router";
import { Generator } from "@/components/Generator";

export const Route = createFileRoute("/_authenticated/titles")({
  head: () => ({
    meta: [
      { title: "AI Blog Title Generator — Quillworks" },
      { name: "description", content: "Generate eight scroll-stopping blog titles for any topic." },
      { property: "og:title", content: "AI Blog Title Generator — Quillworks" },
      { property: "og:description", content: "Generate eight scroll-stopping blog titles for any topic." },
    ],
  }),
  component: () => (
    <Generator
      kind="titles" eyebrow="titles / generate" heading="Headline press" inputLabel="topic"
      placeholder="e.g. remote work burnout for startup founders" cta="Generate titles" hint="~5s · 8 titles"
    />
  ),
});
