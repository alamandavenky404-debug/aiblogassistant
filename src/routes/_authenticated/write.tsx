import { createFileRoute } from "@tanstack/react-router";
import { Generator } from "@/components/Generator";

export const Route = createFileRoute("/_authenticated/write")({
  head: () => ({
    meta: [
      { title: "AI Blog Content Generator — Quillworks" },
      { name: "description", content: "Turn a topic into a complete, structured blog post draft." },
      { property: "og:title", content: "AI Blog Content Generator — Quillworks" },
      { property: "og:description", content: "Turn a topic into a complete, structured blog post draft." },
    ],
  }),
  component: () => (
    <Generator
      kind="write" eyebrow="write / generate" heading="Full-content studio" inputLabel="topic"
      placeholder="Draft on: why long-form writing still wins" cta="Generate draft" hint="~20s · 800 words"
    />
  ),
});
