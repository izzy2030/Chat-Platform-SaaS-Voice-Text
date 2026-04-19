---
name: task-completion
description: Post-task checklist for documentation, time logging, and memory updates.
---

# Task Completion

**Purpose:** Keep project memory up-to-date after every meaningful change.

---

## Step 1 — Verify the work
- [ ] All requested changes are implemented.
- [ ] No debug code, TODO comments, or temporary fixes left behind.
- [ ] Code follows project conventions (check `CONVENTIONS.md`).

## Step 2 — Update project memory (if structural changes were made)

### MAP.md
- [ ] If a new module was added or removed → update the module registry.
- [ ] If module responsibilities changed → update the MAP section.
- Single-file mode: update the module section in MAP.md.

### SYMBOLS.md
- [ ] If new public symbols were created → add them to SYMBOLS.md.
- [ ] If symbols were renamed or deleted → update accordingly.
- Single-file mode: update the module section in SYMBOLS.md.

### CHANGELOG.md
- [ ] Add a one-line entry describing what changed.
- Format: `- YYYY-MM-DD: Brief description of the change`

### LESSONS.md
- [ ] If you learned something surprising or hit a gotcha → add it.

### RESUME.md
- [ ] Update with what was accomplished and what's next.

## Step 3 — Git
- [ ] `git add -A` to stage all changes.
- [ ] `git diff --staged` to review what will be committed.
- [ ] Write a clear commit message (focus on "why").
- [ ] `git commit -m "message"`
- [ ] `git push origin <branch>` if working on a shared branch.

## Step 4 — Time log (if applicable)
- [ ] If this was a development task, record it in your time tracking.
- Format: `date, duration, brief description`

## Step 5 — Communicate
- [ ] Tell the user what was done.
- [ ] Flag any follow-up work or open questions.
- [ ] Update RESUME.md with the current state.

---

**No gate.** This is an advisory skill, not a mandatory procedure.
Update what's relevant — skip sections that don't apply to the current change.
