# RESUME

> Where the AI agent left off.

## Current State

- The admin dashboard, conversations page, and calls page now read real Convex-backed conversation data.
- `Conversations` acts like an inbox/log of visitor text chats.
- `Calls` acts like a voice-session log with transcript detail, recording playback, and **CSV/TXT transcript export**.
- **Unified Widget Studio** at `/admin/widget/[widgetId]` is fully styled with a high-fidelity mobile preview and matches the emerald/green design language.
- **Voice recordings now capture both the visitor and the AI agent** by mixing streams in the `AudioProcessor`.
- **Transcripts for voice calls are now saved live** to Convex as messages during the interaction.
- The widget now persists session identity per widget and logs activity into Convex.
- UploadThing handles recording storage with Convex metadata and a 60-day expiry managed by Convex crons.
- TypeScript errors in the UploadThing router and general project health have been addressed.

## In Progress

- Verifying the mixed audio recording quality in a live browser environment (if possible).
- Refining the voice UI to better indicate when the agent is "thinking" vs "speaking" now that transcripts are saved.

## Next Steps

- Move the hardcoded 60-day demo retention to a configurable setting in the Widget Studio.
- Add a "Test Webhook" button to the Widget Studio for easier integration debugging.
- Implement "Success Confetti" or other celebration animations in the widget when a goal is reached.

## Open Questions

- Should the recording retention window stay fixed for demo use, or be exposed as a product setting later?
- Should old pre-UploadThing call records be migrated, or is it acceptable that only new voice sessions have playable recordings?
