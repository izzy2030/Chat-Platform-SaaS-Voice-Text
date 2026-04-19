# MAP

> **Project Name:** saas-voice-chat
> **Last Updated:** 2026-04-19

## Project Overview

The app now has live Convex-backed admin surfaces for text conversations and voice calls. Visitor text chat is logged into Convex from the widget, and voice recording support is being moved onto UploadThing with Convex metadata plus scheduled cleanup.

## Module Registry

| Module | Description |
|--------|-------------|
| `src/app/admin` | Admin dashboard pages for overview, conversations, calls, widget studio, analytics, and settings. |
| `src/components/widget` | Runtime widget UI for visitor text and voice sessions; logs activity into Convex. |
| `convex/conversations.ts` | Main conversation and call query/mutation surface for dashboard summary, lists, detail views, and message logging. |
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
- `Calls` page is a live log of voice sessions with transcript and recording playback support.
- Widget voice recording flow now targets UploadThing for demo-stage storage with 60-day retention metadata.
- Convex cron infrastructure is in place to delete expired recording files and clear playback metadata.
