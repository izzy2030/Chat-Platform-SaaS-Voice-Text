# MEMORY SYSTEM

> How the AI agent maintains project knowledge across sessions.

## Files

| File | Purpose |
|------|---------|
| `MAP.md` | Module registry — what each part does and where it lives |
| `SYMBOLS.md` | Symbol index — every named class and function with file paths |
| `CHANGELOG.md` | Recent structural changes |
| `CONVENTIONS.md` | Coding standards the agent should follow |
| `LESSONS.md` | Gotchas, pitfalls, and surprises |
| `RESUME.md` | Where the agent left off (session state) |

## When to Update

- **After every structural change** — new files, renamed symbols, moved modules
- **After learning something new** — add to LESSONS.md
- **When starting a session** — read RESUME.md and MAP.md
- **When ending a session** — update RESUME.md with current state

## When NOT to Update

- No structural changes (cosmetic edits, typo fixes)
- Only test changes (unless new test patterns were introduced)
- Config-only changes (unless they affect module structure)

## How It Works

1. Agent reads memory files at session start
2. Agent uses project knowledge to make informed changes
3. Agent updates memory files after structural changes
4. Next session picks up where it left off

This is **incremental** — each session adds to what previous sessions built.
The memory gets more valuable over time.
