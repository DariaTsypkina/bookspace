# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **This repository (session end):** Session Completion ниже **обязателен**, включая `git push`. Профиль «conservative / не пушить» **не** отменяет push при завершении сессии.
- Explicit «do not commit» / «do not push» in the **current** user message still wins for that turn only.

## Session Completion

When ending a work session, you MUST complete ALL steps below. Work is NOT complete until git push succeeds.

### MANDATORY WORKFLOW

1. **File issues for remaining work** — Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) — Tests, linters, builds
3. **Update issue status** — Close finished work, update in-progress items; update `PROJECT-STATUS.md`
4. **PUSH TO REMOTE** — This is MANDATORY:

```bash
git pull --rebase
git push
git status  # MUST show "up to date with origin"
```

Push the **current feature/fix branch**. Do not push directly to `develop`/`master`; do not force-push shared branches (see git-flow).

5. **Clean up** — Clear stashes, prune remote branches
6. **Verify** — All changes committed AND pushed
7. **Hand off** — Provide context for next session

Also sync Beads when relevant: `bd dolt push`.

### CRITICAL RULES

- Work is NOT complete until git push succeeds
- NEVER stop before pushing — that leaves work stranded locally
- NEVER say "ready to push when you are" — YOU must push
- If push fails, resolve and retry until it succeeds
- If a required sync or push is blocked after retries, stop and report the exact command and error
<!-- END BEADS INTEGRATION -->


## Build & Test

_Add your build and test commands here_

```bash
# Example:
# npm install
# npm test
```

## Architecture Overview

_Add a brief overview of your project architecture_

## Conventions & Patterns

_Add your project-specific conventions here_
