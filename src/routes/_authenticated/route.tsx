import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { libraryQuery } from "@/lib/library";

export const Route = createFileRoute("/_authenticated")({
  component: AppShell,
});

const NAV = [
  { to: "/titles", label: "Titles", key: "a" },
  { to: "/write", label: "Write", key: "b" },
  { to: "/summarize", label: "Summarize", key: "c" },
  { to: "/library", label: "Library", key: "d" },
] as const;

function AppShell() {
  const { session, user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !session) nav({ to: "/auth" });
  }, [loading, session, nav]);

  if (loading || !session) {
    return <div className="min-h-screen grid place-items-center bg-paper label-mono">loading desk…</div>;
  }
  const name = (user?.email ?? "writer").split("@")[0];

  return (
    <div className="min-h-screen w-full bg-paper text-ink">
      <header className="relative overflow-hidden bg-ink text-paper">
        <div className="anim-slide absolute inset-y-0 left-0 w-[14px] bg-accent" />
        <div className="anim-slide absolute inset-y-0 left-[24px] w-[6px] bg-accent/40" />
        <div className="anim-slide absolute -top-2 right-8 -rotate-12 h-[120px] w-[72px] bg-accent/15" />
        <div className="anim-slide absolute top-6 right-40 -rotate-12 h-[90px] w-[40px] bg-accent/10" />
        <div className="relative flex items-center justify-between px-4 md:px-8 py-5 pl-12 md:pl-16">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center bg-accent font-display text-[17px] leading-none text-paper">Q</span>
            <span className="font-display text-[26px] md:text-[30px] tracking-wide leading-none">QUILLWORKS</span>
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.22em] text-paper/40">/ ai desk</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">{name} · writer</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60 hover:text-paper"
            >
              sign out
            </button>
            <span className="size-8 rounded-full bg-accent/85 grid place-items-center font-display text-[15px] text-paper">
              {name[0]?.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        <aside className="md:w-60 shrink-0 border-b-2 md:border-b-0 md:border-r-2 border-line md:min-h-[calc(100vh-81px)] flex flex-col">
          <div className="hidden md:block px-5 pt-6 pb-3"><span className="label-mono">workspace</span></div>
          <nav className="flex md:flex-col px-3 py-2 md:py-0 gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="group flex items-center justify-between gap-4 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-ink"
                activeProps={{ className: "!bg-ink !text-paper" }}
              >
                <span className="flex items-center gap-3">
                  <span className="h-4 w-[3px] bg-transparent group-data-[status=active]:bg-accent group-hover:bg-accent" />
                  {n.label}
                </span>
                <span className="font-mono text-[10px] opacity-50">({n.key})</span>
              </Link>
            ))}
          </nav>
          <SavedCount />
        </aside>
        <main className="flex-1 min-w-0 px-4 md:px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SavedCount() {
  const { data } = useQuery(libraryQuery);
  const n = data?.length ?? 0;
  return (
    <div className="hidden md:block mt-auto p-3">
      <div className="border-2 border-line p-3 bg-panel">
        <div className="flex items-center justify-between">
          <span className="label-mono">saved pieces</span>
          <span className="font-display text-[18px] leading-none text-accent">{n}</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-soft">
          <div className="h-full bg-accent" style={{ width: `${Math.min(100, n * 5)}%` }} />
        </div>
      </div>
    </div>
  );
}
