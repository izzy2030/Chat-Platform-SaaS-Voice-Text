# CHANGELOG

> Recent structural changes to this project.

- **2026-04-18**: Replaced the fragmented widget creation flow (`/admin/widget/create` and `/admin/theming/[widgetId]`) with a unified Widget Studio (`/admin/widget/[widgetId]`).
- **2026-04-18**: Expanded the Convex database schema for `widgets` to include granular `theme` properties for colors, typography, and text content.
- **2026-04-18**: Integrated Gemini 3.1 Flash Live voice agent into `ChatWidgetComponent` with a dual-tab (Text/Voice) interface.
- **2026-04-18**: Added raw audio processing (`src/lib/agent-live-audio.ts`) and a shader-based visualizer (`src/components/agent-audio-visualizer-aura.tsx`, `src/components/react-shader-toy.tsx`).