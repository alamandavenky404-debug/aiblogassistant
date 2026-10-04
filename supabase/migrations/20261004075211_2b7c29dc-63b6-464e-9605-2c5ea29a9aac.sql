CREATE TABLE public.saved_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  topic text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_contents TO authenticated;
GRANT ALL ON public.saved_contents TO service_role;
ALTER TABLE public.saved_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.saved_contents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.saved_contents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.saved_contents FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.saved_contents FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX saved_contents_user_idx ON public.saved_contents(user_id, created_at DESC);