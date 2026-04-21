# MAP

> **Project Name:** saas-voice-chat
> **Last Updated:** 2026-04-20

## Project Overview

The app now has live Convex-backed admin surfaces for text conversations and voice calls, plus a newer premium admin visual system built around soft white cards, pale green support surfaces, and selective dark contrast blocks. Visitor text chat can respond through the Gemini-backed `/api/chat` path with widget-configured model and system prompt settings, and voice recording support uses UploadThing metadata plus Convex cleanup.

## Module Registry

| Module | Description |
|--------|-------------|
| `src/app/admin` | Admin dashboard pages for overview, conversations, calls, widget studio, analytics, and settings. Top-level pages now follow a newer premium admin surface language. |
| `.agents/skills/admin-ui-surface-language` | Repo-local UI skill documenting the exact visual system used for the admin redesign so it can be reused in other projects or future surfaces. |
| `src/components/widget` | Runtime widget UI for visitor text and voice sessions; logs activity into Convex. |
| `src/components/admin/knowledge-base-manager.tsx` | Core Knowledge Base admin manager. Logic is unchanged, but the outer framing was updated to better match the redesigned admin surfaces. |
| `convex/conversations.ts` | Main conversation and call query/mutation surface for dashboard summary, lists, detail views, and message logging. |
| `src/app/api/chat` | Server route that handles Gemini text-chat replies, selecting per-widget model, prompt, and optional knowledge-base context. |
| `src/lib/widget-agent-prompt.ts` | Shared prompt-resolution helpers for text and voice agents, including built-in fallback behavior. |
| `src/lib/conversation-status.ts` | Derived conversation-status rules for inactivity and greeting-only auto-resolution without background jobs. |
| `convex/recordingCleanup.ts` | Internal query/mutation helpers for expired recording metadata. |
| `convex/recordingCleanupActions.ts` | Node-only action that deletes expired UploadThing files. |
| `convex/crons.ts` | Scheduled Convex jobs, currently used for recording cleanup. |
| `src/app/api/uploadthing` | UploadThing App Router endpoint for recording uploads. |
| `src/lib/agent-live-audio.ts` | Raw browser audio capture/playback utilities used by the Gemini Live voice widget. |
| `src/lib/uploadthing.ts` | UploadThing client helpers used by the widget to upload recordings. |

## Architecture Insights

- **Files Indexed:** ~317 at last GoAtlas scan
- **Primary Language:** TypeScript/React
- **Architecture Pattern:** Next.js App Router frontend with Convex backend and client-side widget runtime
- **State Management:** React state/hooks + Convex live queries and mutations

## Key Technologies

- Next.js App Router
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Convex
- Gemini Live API
- UploadThing
- Tauri

## Current Focus Areas

- `Conversations` page is a live inbox-style log of visitor text conversations.
- `Conversations` statuses are now partly derived at read time: old inactive threads appear resolved without a cron or database rewrite.
- `Calls` page is a live log of voice sessions with transcript and recording playback support.
- `Settings` page is now a full `Brand & Workspace` UI with local preview state and no backend persistence yet.
- `Dashboard`, `Widget`, `Conversations`, `Calls`, and top-level `Knowledge Base` framing were visually upgraded to share one coherent admin surface language.
- Widget voice recording flow now targets UploadThing for demo-stage storage with 60-day retention metadata.
- Convex cron infrastructure is in place to delete expired recording files and clear playback metadata.
