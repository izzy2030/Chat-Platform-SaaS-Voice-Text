<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->

## Architecture

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (serverless database + functions)
- **Auth**: Clerk (protects `/admin` routes)
- **AI**: Genkit with Gemini API integration
- **File Storage**: UploadThing
- **UI Generation**: Stitch MCP integration

## Development Commands

- `npm run dev`: Start dev server on port 9002 with Turbopack
- `npm run typecheck`: TypeScript type checking
- `npm run lint`: ESLint checking
- `npm run genkit:dev`: Start Genkit AI development server
- `npm run genkit:watch`: Genkit with file watching

## Environment Setup

Required environment variables in `.env.local`:
- Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- Convex URL (`NEXT_PUBLIC_CONVEX_URL`)
- UploadThing token (`UPLOADTHING_TOKEN`)
- Gemini API key (`NEXT_PUBLIC_GEMINI_API_KEY`)
- Stitch API key (`STITCH_API_KEY`)

## Data Model

Core tables:
- `projects`: User projects containing widgets
- `widgets`: Configurable chat widgets (text/voice) with themes and webhooks
- `conversations`: Chat sessions with visitors
- `conversationMessages`: Messages (text/audio) with optional file storage

## Code Structure

- `src/app/admin/`: Admin panel pages (dashboard, widgets, conversations, etc.)
- `src/app/widget/[widgetId]/`: Public widget embed pages
- `src/components/widget/`: Chat widget components
- `src/hooks/`: Custom hooks for voice agent, audio visualization
- `convex/`: Backend functions, schema, crons
- `src/lib/`: Utilities, auth, upload handling

## Design Skills

Premium design skills are available globally at `~/.claude/skills/premium-design/`. Use these for:
- "premium design", "editorial", "luxe", "high end", "atelier"
- "make it premium", "creative agency site", "portfolio site"

Components are in `references/catalog/components/` and design tokens in `references/design-tokens.md`.

## Key Conventions

- **Path mappings**: `@/*` for `src/*`, `convex/*` for `./convex/*`
- **File routing**: Convex functions use file-based routing (`convex/widgets.ts` → `api.widgets.*`)
- **Voice features**: Audio recordings stored in Convex storage with expiration
- **Webhooks**: Widgets send events to configured webhook URLs
- **Themes**: Comprehensive theming system for widget customization
