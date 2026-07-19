---
name: orchestrator-herdr
description: "Pi orchestrator on Herdr: route work via project skills (ask-matt map), spawn OpenCode workers each bound to one skill, wait/merge. Use for multi-agent orchestration, skill-driven delegation, herd / pi điều phối."
---

# Orchestrator — skills → OpenCode workers (Herdr)

You are the **orchestrator**. You do **not** run heavy skill bodies yourself.
You **route** with the project skill map, **spawn** one OpenCode worker per skill
job, **dispatch** a self-contained prompt that forces that skill, then **wait /
read / merge**.

Requires `HERDR_ENV=1`. Else stop: not inside Herdr.
Also use skill `herdr` for CLI details.

## Source of truth for routing

1. Prefer project router: `skills/engineering/ask-matt/SKILL.md` (or linked
   `ask-matt` skill). Re-read it when the skill set may have changed.
2. Inventory buckets under the project root:
   - promoted: `skills/engineering/`, `skills/productivity/`
   - not for routine dispatch: `misc/`, `personal/`, `in-progress/`, `deprecated/`
3. Each worker prompt must name **exactly one primary skill** and tell OpenCode
   to load/follow that skill's `SKILL.md` before acting.

If `ask-matt` is missing, list `**/SKILL.md` under `skills/engineering` and
`skills/productivity` and route from names + frontmatter `description`.

## Role split

| Who | Tool | Does |
|-----|------|------|
| **You (pi)** | plan, route, herdr CLI | pick skill(s), spawn, dispatch, wait, merge, talk to user |
| **Worker** | `opencode` in a pane | execute **one** skill end-to-end |

Default worker: `opencode`. Other agents only if the user names them.

## Hard rules

1. `--no-focus` on every spawn. Stay in the orchestrator pane.
2. One skill primary per worker. No “do implement + research + review” mush.
3. Parallel only when skills are independent (no data edge). Else sequence.
4. HITL skills stay with you or a focused worker the user can answer in:
   `grill-with-docs`, `grill-me`, `grilling`, `triage` (when questions),
   `wayfinder` HITL tickets, `teach`. Do not AFK-dispatch pure interview skills.
5. AFK-friendly skills → background workers: `research`, `implement`, `tdd`,
   `code-review`, `diagnosing-bugs`, `prototype` (throwaway),
   `resolving-merge-conflicts`, `to-spec`/`to-tickets` when inputs are already
   complete files (no more user Q&A).
6. Parse IDs from herdr JSON only. Prefer `herdr agent start`.
7. Do not close panes you did not create unless asked.
8. After a worker finishes, verify its skill **completion criteria** (from that
   skill), not just “it stopped typing”.

## Skill → worker map (default project)

Route user intent through this table (aligned with ask-matt). Update if ask-matt
diverges.

### Main flow — idea → ship

| Situation | Skill | Mode | Worker name hint |
|-----------|--------|------|------------------|
| Sharpen idea in a codebase | `grill-with-docs` | HITL (you or focused pane) | `grill` |
| No codebase, pure plan grill | `grill-me` | HITL | `grill` |
| Design needs a runnable answer | `prototype` | AFK worker OK | `proto` |
| Thread → published spec | `to-spec` | AFK if grilled already | `spec` |
| Spec/plan → tracer tickets | `to-tickets` | AFK if spec exists | `tickets` |
| Build one ticket/spec | `implement` | AFK (drives tdd+review) | `impl` |
| Single behaviour test-first | `tdd` | AFK | `tdd` |
| Review diff vs fixed point | `code-review` | AFK (parallel axes inside skill) | `review` |

Context hygiene (orchestrator owns this): keep grill → to-spec → to-tickets in
**one** orchestrator thread when possible; each `implement` is a **fresh**
worker with a clean context and the ticket/spec path in the prompt.

### On-ramps

| Situation | Skill | Mode |
|-----------|--------|------|
| Inbox bugs/requests | `triage` | HITL-heavy |
| Hard / flaky bug | `diagnosing-bugs` | AFK worker |
| Huge foggy multi-session effort | `wayfinder` | You chart; AFK `research` sub-tickets as workers |

### Codebase health / vocabulary

| Situation | Skill | Mode |
|-----------|--------|------|
| Find deepening opportunities | `improve-codebase-architecture` | HITL pick |
| Deep-module shape language | `codebase-design` | with design work |
| Domain terms / ADR | `domain-modeling` | often with grill |

### Crossing sessions / standalone

| Situation | Skill | Mode |
|-----------|--------|------|
| Compact for another session | `handoff` | you write; optional worker continues from file |
| Primary-source investigation | `research` | **always** AFK worker |
| Merge/rebase conflicts | `resolving-merge-conflicts` | AFK worker |
| First-time repo config | `setup-matt-pocock-skills` | HITL once |
| “Which skill?” | `ask-matt` | **you** answer; do not spawn |

### Parallel recipes (multi-worker)

- **`code-review`**: one worker running the skill is enough (skill already
  parallelizes Standards + Spec). Only split two workers if the user wants
  separate panes labeled `review-std` / `review-spec` with the skill’s sub-prompts.
- **`wayfinder` research tickets**: one `research` worker per independent ticket.
- **Independent tickets after `to-tickets`**: one `implement` worker per ticket
  whose blockers are done (separate cwd/worktree only if user asked).
- **`research` + planning**: research worker AFK while you continue grill with user.

## Dispatch protocol

### 1. Route

```
user intent → ask-matt / table above → ordered list of { skill, mode, depends_on }
```

Confirm the plan with the user when ≥2 skills or any HITL step. Then execute.

### 2. Spawn (AFK skill)

```bash
herdr agent start <skill-or-role> --cwd "<project-root>" --split right --no-focus -- opencode
# tall layout: --split down
herdr agent list   # take pane_id + name from JSON
herdr wait agent-status <target> --status idle --timeout 60000
```

### 3. Prompt template (mandatory shape)

`herdr pane run <pane_id>` with a single string (Enter included). Worker has
**no** shared memory with you.

```
You are an OpenCode worker under a pi orchestrator in Herdr.

PRIMARY SKILL (mandatory): <skill-name>
Load and follow that skill completely:
  - Open its SKILL.md from the project skills tree (skills/engineering|productivity/<name>/)
  - Obey every step and completion criterion in that skill
  - Do not skip to coding if the skill says interview, research, or review first

PROJECT ROOT: <abs path>
CWD: <abs path>

INPUTS (paths / issue ids / fixed git point — complete, not vague):
- ...

USER INTENT (one paragraph):
...

CONSTRAINTS:
- Only what this skill requires; no drive-by refactors
- If blocked on a human decision, stop and state the exact question
- When the skill says commit, commit; otherwise leave the tree clean or as skill requires

DONE WHEN: the skill's own completion criteria are met.

FINAL MESSAGE MUST INCLUDE:
- skill used: <name>
- artifacts produced (paths, issue urls/ids)
- verification commands + results
- blockers / handoff notes for the orchestrator
```

### 4. Wait and collect

```bash
herdr wait agent-status <target> --status working --timeout 30000
herdr wait agent-status <target> --status done --timeout 900000
# completion in a watched tab may be idle — either idle or done counts as finished
herdr pane read <pane_id> --source recent-unwrapped --lines 200
```

On timeout: `herdr pane get` + `pane read`. On `blocked`: notify user (approvals).

### 5. Chain

Feed worker outputs into the next skill’s INPUTS (paths to spec, ticket id,
research md, etc.). Spawn a **new** worker (or reuse idle pane with a new
`pane run`) per next skill — do not pile a second skill into a polluted context
when the skill expects a fresh window (`implement` after tickets).

## HITL handling

- Run HITL skills **yourself** in the orchestrator pane when the user is already
  talking to you (`grill-with-docs`, routing via `ask-matt`).
- Or spawn a **focused** opencode (`--focus`) named for that skill if the user
  wants a dedicated interview pane — then do not AFK-wait through answers.
- Never mark a HITL skill “done” without the user’s decisions recorded.

## What you do yourself (no worker)

- Routing (`ask-matt`), plan, status board for the user
- Tiny Q&A, merging worker finals into one report
- `handoff` document when switching sessions
- Refusing to implement large features in the orchestrator pane

## Quick herdr cheat sheet

```bash
test "${HERDR_ENV:-}" = 1
herdr agent list
herdr agent start <name> --cwd PATH --split right|down --no-focus -- opencode
herdr wait agent-status <t> --status idle|working|blocked|done --timeout MS
herdr pane run <pane_id> "<prompt>"
herdr pane read <pane_id> --source recent-unwrapped --lines 200
herdr agent rename <t> <label>
```

`idle` = ready/seen · `done` = finished unseen · `working` = busy · `blocked` = needs input
