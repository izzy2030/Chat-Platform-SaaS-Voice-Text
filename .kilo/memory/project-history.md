# Project History — Chat Platform SaaS Voice/Text

_Last updated: 2026-04-20_

## Project Overview

SaaS platform for embedding voice and text chat widgets on external sites. Users create widgets, configure them (theme, AI model, knowledge base), and embed them via iframe.

**Stack**: Next.js 16 / React 19 / TypeScript / Tailwind CSS / Convex / Clerk / Gemini API / UploadThing

---

## Session 1 — Core Feature Build (2026-04-20)

### Knowledge Base + AI Model + Built-in Gemini Chat

#### What was built:

1. **Knowledge Base selector** added to widget Studio (Tools tab)
2. **New "Tools" tab** added as 3rd tab in the widget edit page (Content → Design → Tools → Embed)
3. **AI Model selector** at top of Tools tab with three Gemini options:
   - `gemini-2.5-flash` (default)
   - `gemini-3-flash-preview`
   - `gemini-3.1-flash-lite-preview`
4. **"Add Tool" placeholder dropdown** (disabled, "More tools coming soon...")
5. **Built-in Gemini text chat** — `/api/chat` endpoint calls Gemini with selected model when no webhook URL is configured
6. **Knowledge Base context injection** — KB chunks fetched and injected into Gemini system prompt
7. **Multi-turn conversation history** passed to Gemini for context
8. **Created `/api/widget-config` route** — was missing, needed for the widget iframe page
9. **Fixed env variable** to use `NEXT_PUBLIC_GEMINI_API_KEY` in `/api/chat` and `/api/gemini-session`

#### Key discoveries during implementation:

- The `/api/widget-config` route was referenced but **did not exist** — had to be created
- `getById` Convex query requires `userId` (auth), so a new `getPublicConfig` query was needed for public widget
- Text chat previously had **no built-in AI** — only sent to external webhook. The Gemini path is entirely new.
- Dialog components use **Base UI** (`@base-ui/react/dialog`), NOT Radix — they don't support `asChild`
- Button component also doesn't support `asChild` (uses Reakit-style primitives)
- No ESLint config exists in project
- Convex HTTP API for queries: `POST /api/query` with `{ path, args, format: "json" }`, returns `{ status, value }`

#### Files modified:

- `convex/schema.ts` — Added `aiModel` to widget `config` object
- `convex/widgets.ts` — Added `aiModel` to `create`/`update` mutation args; added `getPublicConfig` query
- `convex/knowledgeBases.ts` — Added `getChunksByKbId` query
- `src/app/admin/widget/[widgetId]/page.tsx` — Main Studio page: 4 tabs, KB selector, AI model selector, Tools tab
- `src/components/widget/chat-widget.tsx` — Updated props, added `/api/chat` fallback when no webhook URL
- `src/app/widget/[widgetId]/page.tsx` — Updated config state type to include `config` and `knowledgeBaseId`
- `src/app/api/gemini-session/route.ts` — Fixed env var to `NEXT_PUBLIC_GEMINI_API_KEY`
- `src/app/admin/layout.tsx` — Removed Analytics nav item and `BarChart3` import

#### Files created:

- `src/app/api/widget-config/route.ts` — Public widget config API (maps Convex shape to widget shape)
- `src/app/api/chat/route.ts` — Server-side Gemini text generation with model selection and KB context

#### Files deleted:

- `src/app/admin/analytics/page.tsx` — Removed as redundant with Dashboard

---

## Architecture Notes

### Important constraints:

- **Voice agent** (`src/hooks/use-voice-agent.ts`) uses `gemini-3.1-flash-live-preview` — **DO NOT MODIFY**
- Gemini API env var: `NEXT_PUBLIC_GEMINI_API_KEY`
- Genkit packages are installed but **completely unused** (no `src/ai/` directory)
- Path mappings: `@/*` for `src/*`, `convex/*` for `./convex/*`

### Data model:

- `projects` → User projects containing widgets
- `widgets` → Configurable chat widgets (text/voice) with themes, AI model, KB link, webhooks
- `conversations` → Chat sessions with visitors
- `conversationMessages` → Messages (text/audio) with optional file storage
- `knowledgeBases` → Knowledge bases with chunks for RAG
- `knowledgeBaseChunks` → Text chunks for KB context injection

### Navigation (sidebar):

1. Dashboard (`/admin`)
2. Widget (`/admin/widget`)
3. Conversations (`/admin/conversations`)
4. Calls (`/admin/calls`)
5. Knowledge Base (`/admin/knowledge-base`)
6. Settings (`/admin/settings`)

### Widget Studio tabs:

1. Content — Welcome message, suggested prompts, system prompt
2. Design — Theme colors, position, avatar
3. Tools — AI model selector, Knowledge Base selector, future tools placeholder
4. Embed — Embed code snippet

---

## Future / Not Yet Done

- No sidebar entry for Knowledge Base page (already exists at `/admin/knowledge-base` but not discoverable)
- No actual "tools" beyond Knowledge Base (placeholder only)
- Webhook-based text chat still works as before when webhook URL is set
- Analytics page removed — dashboard covers it
