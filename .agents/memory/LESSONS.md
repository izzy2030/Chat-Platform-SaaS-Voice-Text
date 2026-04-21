# LESSONS

> Gotchas, pitfalls, and things that surprised the AI agent.

- **Convex Deployments:** Adding new public queries or mutations is not enough locally; the dev deployment must be refreshed with `npx convex dev --once` or the frontend will fail at runtime with "Could not find public function ..." even if generated API types already exist.
- **Convex Environment Variables:** The Convex CLI expects `CONVEX_DEPLOYMENT` to be a deployment name like `dev:capable-deer-588`, not the cloud URL. If `.env.local` contains the wrong shape, override it when running Convex commands.
- **UploadThing Cleanup:** If recordings are stored outside Convex storage, keep Convex as the metadata source of truth and run deletion through a Node internal action plus cron. Clearing metadata after deleting the remote file keeps the Calls page from trying to play dead URLs.
- **Lucide Icons:** This repo's `lucide-react` version exports `Waves`, not `Waveform`. Import mismatches fail the Next build immediately.
- **Typecheck Noise:** Repo-wide typecheck still has unrelated failures in `next.config.ts` and the admin theming area. For backend pushes during this workstream, `npx convex dev --once --typecheck disable` has been the practical workaround.
- **Gemini Live Audio Visualizer:** When using the `AgentAudioVisualizerAura` component (ported from the Hydra Invoicing codebase) with the Gemini Live API, pass `analyserNode={null}` instead of the raw microphone stream processor (`audioProcessorRef.current?.processor`). The visualizer handles its animation states ("speaking", "listening") strictly via the `state` prop string. Passing the raw processor causes a `Runtime TypeError: analyserNode.getByteTimeDomainData is not a function`.
- **Dark Mode in Studio:** When building a "dark mode first" command center aesthetic, ensure you use semantic Tailwind classes (`bg-background`, `bg-card`, `bg-muted`, `border-border`, etc.) instead of hardcoding hex colors like `#0a0a0a` or `#18181b`. This ensures the preview and builder seamlessly adapt to the user's system theme preferences without breaking the contrast.
- **Widget Config Changes Need Convex Refresh:** Adding new widget config fields like `aiModel` or `systemPrompt` requires `npx convex dev --once` before the admin autosave UI will stop throwing validator errors against the older deployment.
- **No Cron Needed for Conversation Closure:** For inbox-style statuses, deriving an effective status in Convex query responses is simpler than a cron job when the product only needs UI semantics rather than durable database rewrites.
