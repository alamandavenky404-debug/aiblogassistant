import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Quillworks AI Desk" },
      { name: "description", content: "Sign in to your AI blog writing desk." },
      { property: "og:title", content: "Sign in — Quillworks AI Desk" },
      { property: "og:description", content: "Sign in to your AI blog writing desk." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) nav({ to: "/write" });
  }, [session, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/write" },
        });
        if (error) throw error;
        if (!data.session) toast.success("Check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-paper">
      <div className="relative overflow-hidden bg-ink text-paper p-10 flex flex-col justify-between">
        <div className="anim-slide absolute inset-y-0 left-0 w-[14px] bg-accent" />
        <div className="anim-slide absolute inset-y-0 left-[24px] w-[6px] bg-accent/40" />
        <div className="anim-slide absolute top-10 right-10 -rotate-12 h-[200px] w-[110px] bg-accent/15" />
        <div className="relative pl-8 flex items-center gap-3">
          <span className="grid size-8 place-items-center bg-accent font-display text-[17px] text-paper">Q</span>
          <span className="font-display text-[30px] tracking-wide leading-none">QUILLWORKS</span>
        </div>
        <div className="relative pl-8">
          <h1 className="font-display text-[72px] md:text-[96px] leading-[0.85] tracking-wide">
            Write the<br />long game.
          </h1>
          <p className="mt-4 max-w-sm text-paper/60 text-sm">
            Titles, full drafts and summaries — generated, copied, saved.
          </p>
        </div>
        <span className="relative pl-8 font-mono text-[10px] uppercase tracking-[0.22em] text-paper/40">/ ai desk</span>
      </div>
      <div className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="anim-rise w-full max-w-sm border-2 border-line bg-panel p-6">
          <span className="label-mono text-accent">{mode === "in" ? "sign in" : "create account"}</span>
          <h2 className="mt-1 font-display text-[40px] leading-none tracking-wide">
            {mode === "in" ? "Back to the desk" : "Pull up a chair"}
          </h2>
          <label className="mt-6 block label-mono">email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border-2 border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <label className="mt-4 block label-mono">password</label>
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full border-2 border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button disabled={busy} className="btn-accent mt-6 w-full">
            {busy ? "Working…" : mode === "in" ? "Sign in →" : "Create account →"}
          </button>
          <button type="button" onClick={google} className="chip mt-3 w-full py-3 hover:bg-soft">
            Continue with Google
          </button>
          <button
            type="button" onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="mt-5 w-full text-xs text-muted-foreground hover:text-ink"
          >
            {mode === "in" ? "No account? Create one" : "Have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
