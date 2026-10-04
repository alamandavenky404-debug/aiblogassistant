import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateContent } from "./ai.server";

export const generate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        kind: z.enum(["titles", "write", "summarize"]),
        input: z.string().trim().min(3).max(20000),
        tone: z.string().max(40).default("Confident"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const text = await generateContent(data.kind, data.input, data.tone);
    return { text };
  });
