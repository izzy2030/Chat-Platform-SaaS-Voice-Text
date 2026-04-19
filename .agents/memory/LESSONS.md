# LESSONS

> Gotchas, pitfalls, and things that surprised the AI agent.

- **Gemini Live Audio Visualizer:** When using the `AgentAudioVisualizerAura` component (ported from the Hydra Invoicing codebase) with the Gemini Live API, pass `analyserNode={null}` instead of the raw microphone stream processor (`audioProcessorRef.current?.processor`). The visualizer handles its animation states ("speaking", "listening") strictly via the `state` prop string. Passing the raw processor causes a `Runtime TypeError: analyserNode.getByteTimeDomainData is not a function`.
- **Dark Mode in Studio:** When building a "dark mode first" command center aesthetic, ensure you use semantic Tailwind classes (`bg-background`, `bg-card`, `bg-muted`, `border-border`, etc.) instead of hardcoding hex colors like `#0a0a0a` or `#18181b`. This ensures the preview and builder seamlessly adapt to the user's system theme preferences without breaking the contrast.