# SYMBOLS

> **Last Updated:** 2026-04-19
> **Repository:** saas-voice-chat

## Important Hand-Maintained Symbols

> The earlier auto-generated symbol dump pulled in a large amount of `.next` build output. Keep this file focused on source symbols that matter during active development.

| Symbol | Kind | File | Description |
|--------|------|------|-------------|
| `AdminPage` | component | `src/app/admin/page.tsx` | Main dashboard overview; now reads dynamic conversation summary data from Convex. |
| `ConversationsPage` | component | `src/app/admin/conversations/page.tsx` | Admin inbox view for visitor text conversations backed by Convex. |
| `CallsPage` | component | `src/app/admin/calls/page.tsx` | Admin call log view for voice sessions, transcripts, and recording playback. |
| `ChatWidgetComponent` | component | `src/components/widget/chat-widget.tsx` | Runtime customer widget for text chat and Gemini Live voice interactions. |
| `AudioProcessor` | class | `src/lib/agent-live-audio.ts` | Browser microphone capture pipeline; exposes the stream used for live voice recording. |
| `uploadFiles` | helper | `src/lib/uploadthing.ts` | Client helper used by the widget to send recordings to UploadThing. |
| `uploadRouter` | UploadThing router | `src/app/api/uploadthing/core.ts` | Defines the recording upload endpoint used by the widget. |
| `listByUser` | Convex query | `convex/conversations.ts` | Lists conversations for the current user with filters for the admin inbox. |
| `getById` | Convex query | `convex/conversations.ts` | Returns full conversation or call detail including transcript/messages. |
| `getDashboardSummary` | Convex query | `convex/conversations.ts` | Supplies dashboard widgets with conversation stats and latest items. |
| `listCallsByUser` | Convex query | `convex/conversations.ts` | Lists voice interactions for the Calls page. |
| `recordVisitorMessage` | Convex mutation | `convex/conversations.ts` | Stores visitor-side text/audio activity and optional recording metadata. |
| `recordAgentMessage` | Convex mutation | `convex/conversations.ts` | Stores AI-side responses for the same conversation stream. |
| `getExpiredUploadThingMessages` | Convex internal query | `convex/recordingCleanup.ts` | Finds expired recording rows eligible for deletion. |
| `clearExpiredUploadThingMessages` | Convex internal mutation | `convex/recordingCleanup.ts` | Removes stale UploadThing playback metadata after remote file deletion. |
| `deleteExpiredRecordings` | Convex internal action | `convex/recordingCleanupActions.ts` | Deletes expired UploadThing files and clears metadata in Convex. |
| `WidgetTheme` | interface | `src/lib/themes.ts` | Defines the visual look of the widget, now expanded with "Content" (headerSubtitle, botName) and "Design" (accentColor, botBubbleBgColor, inputBgColor) properties matching the Convex schema. |
| `BuilderPage` | component | `src/app/admin/widget/[widgetId]/page.tsx` | The unified Widget Studio for editing theme and content, featuring a high-fidelity live preview. |

## Notes

- Prefer source files over generated `.next` output when searching for symbols.
- If a full symbol inventory is needed again, regenerate it with filters that exclude build artifacts.
