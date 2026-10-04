import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SavedItem = {
  id: string;
  kind: string;
  title: string;
  content: string;
  topic: string | null;
  created_at: string;
};

export const libraryQuery = queryOptions({
  queryKey: ["library"],
  queryFn: async (): Promise<SavedItem[]> => {
    const { data, error } = await supabase
      .from("saved_contents")
      .select("id, kind, title, content, topic, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export async function saveItem(item: { kind: string; title: string; content: string; topic: string }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Please sign in again.");
  const { error } = await supabase.from("saved_contents").insert({ ...item, user_id: u.user.id });
  if (error) throw error;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from("saved_contents").delete().eq("id", id);
  if (error) throw error;
}

export function deriveTitle(text: string, fallback: string) {
  const line = text.split("\n").map((l) => l.replace(/^[#\d.\s*-]+/, "").trim()).find(Boolean);
  return (line || fallback).slice(0, 120);
}
