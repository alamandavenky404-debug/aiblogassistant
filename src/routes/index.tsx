import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quillworks — AI Blog Writing Desk" },
      { name: "description", content: "Generate blog titles, full posts and summaries with AI, then copy or save them." },
      { property: "og:title", content: "Quillworks — AI Blog Writing Desk" },
      { property: "og:description", content: "Generate blog titles, full posts and summaries with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const nav = useNavigate();
  const { session, loading } = useAuth();
  useEffect(() => {
    if (!loading) nav({ to: session ? "/write" : "/auth", replace: true });
  }, [loading, session, nav]);
  return (
    <div className="min-h-screen grid place-items-center bg-paper">
      <span className="font-display text-[40px] tracking-wide">QUILLWORKS</span>
    </div>
  );
}
