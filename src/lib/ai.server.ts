import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";

export type GenKind = "titles" | "write" | "summarize";

const SYSTEM: Record<GenKind, string> = {
  titles:
    "You are an expert blog editor. Generate exactly 8 compelling, SEO-friendly blog post titles for the given topic. Return one title per line, numbered 1-8, no extra commentary.",
  write:
    "You are a skilled blog writer. Write a complete, well-structured blog post (about 700-900 words) in Markdown with a # title, an engaging intro, ## section headings, and a conclusion. No preamble.",
  summarize:
    "You are a precise editor. Summarize the given blog content: start with a one-sentence TL;DR, then 3-5 concise bullet-point key takeaways in Markdown. No preamble.",
};

export async function generateContent(kind: GenKind, input: string, tone: string) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured.");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const prompt =
    kind === "summarize"
      ? `Content to summarize:\n\n${input}`
      : `Topic: ${input}\nTone: ${tone}`;
  let streamError: unknown;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: SYSTEM[kind],
    prompt,
    onError: ({ error }) => {
      streamError = error;
    },
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  const text = await result.text;
  if (!text.trim()) {
    const e = streamError as { statusCode?: number; message?: string } | undefined;
    if (e?.statusCode === 429) throw new Error("Too many requests — please wait a moment and try again.");
    if (e?.statusCode === 402) throw new Error("AI credits are exhausted. Add credits to your workspace to continue.");
    throw new Error(e?.message || "The AI returned no content. Please try again.");
  }
  return text;
}
