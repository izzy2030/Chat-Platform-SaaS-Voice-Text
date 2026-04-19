---
name: goatlas-cli
description: When you need to understand, search, or modify a codebase. Use GoAtlas
  CLI commands with --json flag instead of grepping blindly. Primary code intelligence engine.
---

# GoAtlas CLI Skill

**Purpose:** GoAtlas is an indexed code intelligence engine connected to this
project. It has already parsed the AST, built a call graph, mapped API endpoints,
detected processes and communities, and (optionally) built a Neo4j knowledge
graph. Use its CLI commands with `--json` output — they're fast, accurate,
and reliable.

---

## How to call GoAtlas

Every command uses the same pattern:

```bash
docker exec goatlas-fork-goatlas-1 /app/goatlas <command> [flags] --json
```

## Command Reference

| You want to... | Use this command |
|---|---|
| List indexed repos | `goatlas list-repos --json` |
| Find a symbol by name | `goatlas find-symbol "name" --json` |
| Search for symbols by keyword | `goatlas search-code "query" --kind func --limit 20 --json` |
| Read a file with line range | `goatlas read-file /path --start 1 --end 50 --json` |
| See who calls a function | `goatlas find-callers "functionName" --depth 5 --json` |
| List all symbols in a file | `goatlas get-file-symbols path/to/file.tsx --json` |
| List HTTP API endpoints | `goatlas list-endpoints --json` |
| Get React components/hooks | `goatlas list-components --kind component --limit 30 --json` |
| List services/repos | `goatlas list-services --json` |
| See execution flows | `goatlas list-processes --repo saas-voice-chat --json` |
| See code communities | `goatlas list-communities --repo saas-voice-chat --json` |
| Check if index is stale | `goatlas check-staleness --repo saas-voice-chat --json` |
| Analyze impact of a change | `goatlas analyze-impact "functionName" --depth 5 --json` |
| Index a repository | `goatlas index /path --json` |
| Re-index after changes | `goatlas index /path --incremental --json` |
| Build knowledge graph | `goatlas build-graph` |
| Detect processes/communities | `goatlas detect` |
| Ask LLM agent a question | `goatlas ask "question about the codebase" --json` |
| Generate wiki from graph | `goatlas wiki /output/dir` |

## When to skip GoAtlas

- You have the exact file path from an error stack trace
- You're searching for a string literal, log message, or error code
- GoAtlas container is not running

## Workflow: Understanding a new area of the code

1. `search-code` with the feature/concept name
2. `read-file` on the most relevant result
3. `find-callers` on key functions to understand the call graph
4. `analyze-impact` to see what else will break if you change it

## Workflow: Before making changes

1. `analyze-impact` on any function you're modifying
2. `find-callers` to know what tests to check
3. After changes: call `index` with `--incremental` to update the index

---

**Advisory skill.** Use when code understanding is needed — not a mandatory gate.
