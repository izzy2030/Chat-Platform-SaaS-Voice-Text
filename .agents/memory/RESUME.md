# RESUME

> Where the AI agent left off.

## Current State

- Refactored the Widget creation and management experience into a unified Hub (`/admin/widget`) and an immersive Studio (`/admin/widget/[widgetId]`).
- The Studio features three tabs (Content, Design, Embed) with an auto-save feature and a real-time preview.
- Integrated the Gemini 3.1 Flash Live voice agent using the `Hydra Invoicing` codebase as a reference.
- Added a "Voice Call" tab to the chat widget that connects to the `gemini-3.1-flash-live-preview` model.
- Ported the glowing orb visualizer (`AgentAudioVisualizerAura`) and raw audio processing utilities.
- Fixed all TypeScript compilation errors and ensured proper Light/Dark mode support using standard Tailwind classes.

## In Progress

- Awaiting user feedback on the newly integrated Voice Agent and the Widget Builder UI.

## Next Steps

- Refine the voice agent's system instructions or visualizer aesthetics based on user feedback.
- Further testing of the embed script and iframe integrations on external domains.

## Open Questions

- Should the voice agent have any ability to execute tools within the chat widget context (e.g., fetching user account data)?