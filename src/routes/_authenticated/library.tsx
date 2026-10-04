import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { deleteItem, libraryQuery } from "@/lib/library";
import { kindLabel } from "@/components/Generator";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Saved Library — Quillworks" },
      { name: "description", content: "All your saved AI-generated titles, drafts and summaries." },
      { property: "og:title", content: "Saved Library — Quillworks" },
      { property: "og:description", content: "All your saved AI-generated titles, drafts and summaries." },
    ],
  }),
  component: Library,
});

const FILTERS = ["all", "titles", "write", "summarize"] as const;

function Library() {
  const { data = [], isLoading } = useQuery(libraryQuery);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const items = filter === "all" ? data : data.filter((d) => d.kind === filter);

  async function remove(id: string) {
    try {
      await deleteItem(id);
      await qc.invalidateQueries({ queryKey: ["library"] });
      toast.success("Deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <>
      <div className="anim-rise flex flex-wrap items-end justify-between gap-4 border-b-2 border-line pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">library / archive</span>
          <h1 className="mt-1 font-display text-[46px] leading-[0.9] tracking-wide">Saved pieces</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`chip font-medium ${filter === f ? "bg-ink text-paper" : "text-muted-foreground hover:text-ink"}`}
            >
              {f === "all" ? "All" : kindLabel(f) + "s"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {isLoading && <p className="label-mono">loading…</p>}
        {!isLoading && items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing here yet — generate something and hit Save.</p>
        )}
        {items.map((s) => {
          const open = openId === s.id;
          return (
            <div key={s.id} className="anim-rise border-2 border-line bg-panel">
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <button onClick={() => setOpenId(open ? null : s.id)} className="text-left min-w-0 flex-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
                    {kindLabel(s.kind)} · {new Date(s.created_at).toLocaleDateString()}
                  </span>
                  <div className="mt-1 font-display text-[24px] leading-none truncate">{s.title}</div>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(s.content); toast.success("Copied"); }}
                    className="chip hover:bg-soft"
                  >Copy</button>
                  <button onClick={() => remove(s.id)} className="chip hover:bg-destructive hover:text-destructive-foreground">Delete</button>
                </div>
              </div>
              {open && (
                <div className="border-t-2 border-line p-5 prose-quill">
                  <ReactMarkdown>{s.content}</ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
