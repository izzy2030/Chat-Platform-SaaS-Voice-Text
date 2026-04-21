# RESUME

> Where the AI agent left off.

## Current State

- The admin dashboard, conversations page, and calls page now read real Convex-backed conversation data.
- `Conversations` acts like an inbox/log of visitor text chats.
- `Calls` acts like a voice-session log with transcript detail, recording playback, and **CSV/TXT transcript export**.
- **Unified Widget Studio** at `/admin/widget/[widgetId]` is fully styled with a high-fidelity mobile preview and matches the emerald/green design language.
- The top-level admin surfaces were visually upgraded with a reusable premium UI language:
  - soft off-white page atmosphere
  - mostly white primary cards
  - pale green support surfaces
  - selective dark contrast blocks only where emphasis is earned
- `src/app/admin/settings/page.tsx` is no longer a placeholder; it is now a full `Brand & Workspace` screen with:
  - Brand Kit
  - Brand Voice
  - Workspace Identity
  - Assistant Defaults
  - live preview rail
- `src/app/admin/page.tsx` and `src/app/admin/widget/page.tsx` were heavily redesigned to match this new surface language.
- `src/app/admin/conversations/page.tsx` and `src/app/admin/calls/page.tsx` were updated so their list areas stay light while the detail panes carry the stronger dark contrast treatment.
- `src/components/admin/knowledge-base-manager.tsx` received top-level framing updates so Knowledge Base feels cohesive with the rest of the admin.
- A reusable repo-local skill now exists at `.agents/skills/admin-ui-surface-language/SKILL.md` documenting the exact UI approach for reuse in other projects.
- The text widget now has a working Gemini-backed brain via `/api/chat`, with per-widget `aiModel` selection from the Widget Studio.
- Widget Studio now has a horizontally scrollable tab rail plus a new **System Prompt** tab that stores `config.systemPrompt`.
- Text and voice agents now share the same prompt override rule: custom prompt overrides built-ins, blank prompt falls back to defaults.
- **Voice recordings now capture both the visitor and the AI agent** by mixing streams in the `AudioProcessor`.
- **Transcripts for voice calls are now saved live** to Convex as messages during the interaction.
- The widget now persists session identity per widget and logs activity into Convex.
- UploadThing handles recording storage with Convex metadata and a 60-day expiry managed by Convex crons.
- Conversation statuses are now partially derived at read time: greeting-only threads auto-resolve after 2 minutes of inactivity, other inactive threads after 15 minutes, and the admin conversation detail panel supports manual close.
- TypeScript errors in the UploadThing router and general project health have been addressed.

## In Progress

- Verifying the mixed audio recording quality in a live browser environment (if possible).
- Refining the voice UI to better indicate when the agent is "thinking" vs "speaking" now that transcripts are saved.
- Deciding how far to propagate the new admin surface language into secondary pages and smaller shared components.

## Next Steps

- If continuing the UI work, do a second pass to normalize smaller shared patterns:
  - badges
  - empty states
  - small metrics
  - helper rails
  - section headers
- If desired, wire the new Settings page fields to persistent storage instead of local preview-only state.
- Consider making new widgets inherit account-level defaults from Settings once backend storage exists.
- Consider adding a manual "Reopen conversation" or "Escalate" action so operators can override derived resolved states from the admin UI.
- Decide whether the derived auto-resolved status rules should also appear on the Calls page detail actions or stay read-only there.
- Move the hardcoded 60-day demo retention to a configurable setting in the Widget Studio.

## Open Questions

- Should the new `Brand & Workspace` settings become true account-level persisted data in Convex, Clerk metadata, or another store?
- Should the new surface-language skill stay repo-local only, or be promoted into a reusable global skill?
- Is the missing analytics route intentional, or should `src/app/admin/analytics/page.*` be restored so `.next/types/validator.ts` stops failing typecheck?
- Should inactive auto-resolved conversations ever be written back durably to Convex, or is derived UI status enough?
- Should the text agent eventually support webhook-plus-LLM hybrid routing, or stay as webhook-first and Gemini fallback?
- Should the recording retention window stay fixed for demo use, or be exposed as a product setting later?
- Should old pre-UploadThing call records be migrated, or is it acceptable that only new voice sessions have playable recordings?
