# CHANGELOG

> Recent structural changes to this project.

- **2026-04-19**: Implemented full-call audio mixing in `AudioProcessor` and `AudioPlayer`, enabling `MediaRecorder` to capture both user and AI audio.
- **2026-04-19**: Enabled live transcripts for voice calls by saving `inputTranscription` and AI model text output to Convex.
- **2026-04-19**: Fixed TypeScript errors in `src/app/api/uploadthing/core.ts` by adding a middleware block to handle input metadata.
- **2026-04-19**: Reworked the admin `Conversations` page into a live Convex-backed inbox for visitor text chat history, including dashboard summary integration.
- **2026-04-19**: Replaced the placeholder `Calls` page with a live voice-session log showing transcripts, recording counts, and playback metadata.
- **2026-04-19**: Added Convex conversation/call queries and mutations for dashboard summary, inbox listing, call listing, and transcript detail.
- **2026-04-19**: Added UploadThing recording uploads plus Convex cron cleanup for expiring demo voice recordings.
- **2026-04-19**: Fixed the admin widget list parse error caused by a duplicated trailing dialog block.
- **2026-04-18**: Replaced the fragmented widget creation flow (`/admin/widget/create` and `/admin/theming/[widgetId]`) with a unified Widget Studio (`/admin/widget/[widgetId]`).
- **2026-04-18**: Expanded the Convex database schema for `widgets` to include granular `theme` properties for colors, typography, and text content.
- **2026-04-18**: Integrated Gemini 3.1 Flash Live voice agent into `ChatWidgetComponent` with a dual-tab (Text/Voice) interface.
- **2026-04-18**: Added raw audio processing (`src/lib/agent-live-audio.ts`) and a shader-based visualizer (`src/components/agent-audio-visualizer-aura.tsx`, `src/components/react-shader-toy.tsx`).
