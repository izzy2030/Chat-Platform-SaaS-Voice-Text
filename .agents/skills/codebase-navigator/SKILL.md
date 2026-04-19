---
name: codebase-navigator
description: When you need to understand, search, or modify a codebase. Use tools
  instead of grepping blindly.
---

# Codebase Navigator

**Purpose:** Find code efficiently using the right tool for the job.
Prefer targeted search, then fall back to project memory files.

---

## Tier 1 — Tools

Use the right tool for what you need:

| You want to... | Use this |
|---|---|
| Find a specific file | `glob` or `list_directory` |
| Search for code patterns | `grep_search` |
| Search across the whole project | `agent` with Explore subagent |
| Read a file | `read_file` with offset/limit |

### Good patterns
- **Specific to general** — start with `glob` if you know the file pattern
- **Narrow scope** — use `path` parameter on `grep_search` when you know the area
- **Read strategically** — read entry points first (main, index, config, routes)

## Tier 2 — Project Memory (fallback)

| File | What it tells you |
|---|---|
| `MAP.md` | Module registry — every module, its responsibility, key entry points |
| `SYMBOLS.md` | Symbol index — every class and named function with file paths |
| `CHANGELOG.md` | Recent structural changes to the codebase |

### Finding where something lives
1. Check `SYMBOLS.md` — find the module, read its symbol file
2. Read the file via `read_file` tool or `grep_search`

### Understanding module ownership
1. Check `MAP.md` for the module that owns the responsibility

### Tracing a flow
1. Check `MAP.md` Critical Business Logic Flows
2. Follow the entry points listed there

## When to skip the index entirely

- You have the exact file path from an error stack trace
- You're searching for a string literal, log message, or error code
- The index is stale (check timestamp at top of MAP.md / SYMBOLS.md)

---

**No gate.** This is an advisory skill, not a mandatory procedure.
