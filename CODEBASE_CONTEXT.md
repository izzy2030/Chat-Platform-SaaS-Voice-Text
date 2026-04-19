# CODEBASE_CONTEXT

## Project Purpose

SaaS voice chat platform built with Next.js and Convex. The app exposes an admin dashboard, a live visitor text inbox, a voice-call log with transcript and recording playback, and a unified widget studio for configuring the runtime chat widget.

## Stack And Entry Points

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Convex
- Voice: Gemini Live API and browser audio processing
- Uploads: UploadThing for voice recording storage
- Main areas:
  - `src/app/admin`
  - `src/components/widget`
  - `convex/conversations.ts`
  - `convex/recordingCleanup.ts`
  - `convex/recordingCleanupActions.ts`
  - `convex/crons.ts`
  - `src/app/api/uploadthing`
  - `src/lib/agent-live-audio.ts`
  - `src/lib/uploadthing.ts`

## Core Data Flow

- Visitor text chat and voice activity are logged into Convex from the widget.
- Admin pages read live Convex-backed conversation and call data.
- Voice recordings are uploaded through UploadThing, while Convex stores the metadata and playback state.
- A Convex cron deletes expired remote files and clears the matching metadata rows.

## Current State

- Conversations page is a live inbox-style log of visitor text chats.
- Calls page is a live log of voice sessions with transcripts, recording counts, playback metadata, and CSV/TXT export.
- Widget Studio lives at `/admin/widget/[widgetId]` and is fully styled with a high-fidelity mobile preview.
- Voice recordings now mix visitor and AI audio before `MediaRecorder` capture.
- Voice transcripts are saved live to Convex during the interaction.
- TypeScript issues around the UploadThing router were already addressed.

## Conventions And Traps

- Always read `convex/_generated/ai/guidelines.md` before working on Convex code.
- New Convex public functions may require `npx convex dev --once` before the frontend sees them.
- `CONVEX_DEPLOYMENT` must be a deployment name, not the cloud URL.
- If recordings are stored outside Convex storage, Convex metadata should remain the source of truth.
- `lucide-react` here exports `Waves`, not `Waveform`.
- Repo-wide typecheck still has unrelated noise in `next.config.ts` and admin theming, so backend work may need `npx convex dev --once --typecheck disable`.
- For the Gemini Live visualizer, pass `analyserNode={null}` to `AgentAudioVisualizerAura`.

## Current Work

- Verifying mixed audio recording quality in a live browser environment.
- Refining the voice UI to better show when the agent is thinking versus speaking.

## Next Task

- Move the hardcoded 60-day demo retention into a configurable Widget Studio setting.
- Add a Test Webhook button to the Widget Studio.
- Add success/celebration animations when a goal is reached.

## Files To Read Next

- `README.md`
- `CLAUDE.md`
- `.agents/memory/RESUME.md`
- `.agents/memory/MAP.md`
- `convex/_generated/ai/guidelines.md`
