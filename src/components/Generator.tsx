import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { generate } from "@/lib/ai.functions";
import { deriveTitle, libraryQuery, saveItem } from "@/lib/library";

const TONES = ["Confident", "Conversational", "Analytical", "Playful"];

type Props = {
  kind: "titles" | "write" | "summarize";
  eyebrow: string;
  heading: string;
  inputLabel: string;
  placeholder: string;
  cta: string;
  hint: string;
  multiline?: boolean;
};

export function Generator(p: Props) {
  const run = useServerFn(generate);
  const qc = useQueryClient();
  const { data: saved = [] } = useQuery(libraryQuery);
  const [input, setInput] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const today = saved.filter(
    (s) => s.kind === p.kind && new Date(s.created_at).toDateString() === new Date().toDateString(),
  ).length;

  async function go() {
    if (input.trim().length < 3) { toast.error("Give the AI a bit more to work with."); return; }
    setBusy(true);
    setOutput("");
    try {
      const r = await run({ data: { kind: p.kind, input, tone } });
      setOutput(r.text);
    } catch (e) {
      toast.error((e as Error).message || "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  async function save() {
    setSaving(true);
    try {
      await saveItem({
        kind: p.kind,
        title: p.kind === "titles" ? `Titles: ${input.slice(0, 80)}` : deriveTitle(output, input),
        content: output,
        topic: input.slice(0, 500),
      });
      await qc.invalidateQueries({ queryKey: ["library"] });
      toast.success("Saved to library");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="anim-rise flex items-end justify-between border-b-2 border-line pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">{p.eyebrow}</span>
          <h1 className="mt-1 font-display text-[40px] md:text-[46px] leading-[0.9] tracking-wide text-balance">{p.heading}</h1>
        </div>
        <div className="text-right">
          <div className="font-display text-[46px] leading-none text-accent">{String(today).padStart(2, "0")}</div>
          <span className="label-mono">saved today</span>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 min-w-0">
          <div className="anim-rise [animation-delay:120ms] border-2 border-line bg-panel p-5">
            <span className="label-mono">{p.inputLabel}</span>
            {p.multiline ? (
              <textarea
                value={input} onChange={(e) => setInput(e.target.value)} placeholder={p.placeholder} rows={9}
                className="mt-2 w-full border-2 border-line bg-transparent px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-accent resize-y"
              />
            ) : (
              <div className="mt-2 flex items-center gap-2 border-2 border-line px-3 py-2 focus-within:border-accent">
                <input
                  value={input} onChange={(e) => setInput(e.target.value)} placeholder={p.placeholder}
                  onKeyDown={(e) => e.key === "Enter" && !busy && go()}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
                />
                <span className="caret h-4 w-[2px] bg-accent" />
              </div>
            )}

            {p.kind !== "summarize" && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <span className="label-mono">tone</span>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t} onClick={() => setTone(t)}
                      className={`chip font-medium ${t === tone ? "bg-ink text-paper" : "text-muted-foreground hover:text-ink"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button onClick={go} disabled={busy} className="btn-accent">
                {busy ? "Generating…" : `${p.cta} →`}
              </button>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.hint}</span>
            </div>
          </div>

          <div className="anim-rise [animation-delay:200ms] mt-5 border-2 border-line bg-panel">
            <div className="flex items-center justify-between border-b-2 border-line px-4 py-2">
              <span className="label-mono">output</span>
              <div className="flex gap-2">
                <button onClick={copy} disabled={!output} className="chip hover:bg-soft disabled:opacity-40">Copy</button>
                <button
                  onClick={save} disabled={!output || saving}
                  className="chip border-accent bg-accent text-primary-foreground disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
            <div className="p-5 min-h-40">
              {busy ? (
                <div className="space-y-3">
                  <div className="h-7 w-2/3 bg-soft animate-pulse" />
                  <div className="h-3 w-full bg-soft animate-pulse" />
                  <div className="h-3 w-5/6 bg-soft animate-pulse" />
                  <div className="h-3 w-4/6 bg-soft animate-pulse" />
                </div>
              ) : output ? (
                <div className="anim-clip prose-quill">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Your generated piece will land here.</p>
              )}
            </div>
          </div>
        </div>

        <div className="anim-rise [animation-delay:280ms] border-2 border-line bg-panel p-5 self-start">
          <div className="flex items-center justify-between">
            <span className="label-mono">saved library</span>
            <Link to="/library" className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">all →</Link>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {saved.slice(0, 4).map((s) => (
              <Link key={s.id} to="/library" className="border-2 border-line p-3 hover:bg-soft">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent">{kindLabel(s.kind)} · saved</span>
                <div className="mt-1 font-display text-[20px] leading-none line-clamp-2">{s.title}</div>
              </Link>
            ))}
            {saved.length === 0 && <p className="text-sm text-muted-foreground">Nothing saved yet.</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export function kindLabel(k: string) {
  return k === "titles" ? "title" : k === "write" ? "draft" : "summary";
}
