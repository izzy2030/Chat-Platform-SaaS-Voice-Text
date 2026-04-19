---
name: session-start
description: When starting a new AI agent session, check these items before diving in.
---

# Session Start Checklist

**Purpose:** Get oriented quickly before diving into any task.

---

## Step 1 — Read RESUME.md
- [ ] Read `.agents/memory/RESUME.md` to see where the last session left off.
- [ ] Note any in-progress work, blockers, or open tasks.

## Step 2 — Check git state
- [ ] Run `git status` to see uncommitted changes.
- [ ] Run `git branch -a` to see current branch and any remote branches.
- [ ] Note if there's a detached HEAD or rebase in progress.

## Step 3 — Read MAP.md (if project is unfamiliar)
- [ ] Read `.agents/memory/MAP.md` to refresh on module structure.
- [ ] Note any new modules or deleted modules since last session.

## Step 4 — Check recent changes (if needed)
- [ ] Run `git log --oneline -10` to see recent commits.
- [ ] If there are open PRs, check them with `git fetch && git branch -r`.

## Step 5 — Note any warnings from previous sessions
- [ ] Check `.agents/memory/LESSONS.md` for known gotchas.
- [ ] Check `.agents/memory/CHANGELOG.md` for recent structural changes.

## Step 6 — Identify the current task
- [ ] Ask the user what they need, or pick up from RESUME.md.
- [ ] Create a todo list before starting implementation.

---

**No gate.** This is an advisory skill, not a mandatory procedure.
Use it when starting a fresh session — skip items that don't apply.
