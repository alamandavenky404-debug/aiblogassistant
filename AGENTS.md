<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- AI generation runs in `src/lib/ai.functions.ts` (auth-protected server fn) via the Lovable AI Gateway Responses API; saved items live in the `saved_contents` table read/written from the browser under RLS. Why: keeps keys server-side and data per-user.
- `/_authenticated` layout gates pages client-side (session lives in browser storage). Why: SSR has no session.
