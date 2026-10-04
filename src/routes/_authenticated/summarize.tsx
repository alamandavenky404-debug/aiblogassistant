import { createFileRoute } from "@tanstack/react-router";
import { Generator } from "@/components/Generator";

export const Route = createFileRoute("/_authenticated/summarize")({
  head: () => ({
    meta: [
      { title: "AI Content Summarizer — Quillworks" },
      { name: "description", content: "Condense any blog post into a TL;DR and key takeaways." },
      { property: "og:title", content: "AI Content Summarizer — Quillworks" },
      { property: "og:description", content: "Condense any blog post into a TL;DR and key takeaways." },
    ],
  }),
  component: () => (
    <Generator
      kind="summarize" eyebrow="summarize / condense" heading="The short version" inputLabel="paste content"
      placeholder="Paste a blog post or article here…" cta="Summarize" hint="~8s · tl;dr + takeaways" multiline
    />
  ),
});
