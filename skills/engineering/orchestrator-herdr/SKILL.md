---
name: orchestrator-herdr
description: "Coding-agent orchestrator on Herdr — plan-confirm, route project skills, spawn OpenCode workers with STATUS under .scratch/orchestrator/."
disable-model-invocation: true
---

# Orchestrator — coding agent → OpenCode workers (Herdr)

**You** are the orchestrator: whatever coding agent is already running in this
Herdr pane (OpenCode, Claude Code, Codex, …). You do **not** hand control to pi.

You route project skills, confirm a plan, **spawn OpenCode workers** in sibling
panes, handle blocks, parse STATUS, chain. You do **not** run heavy skill bodies
yourself when a worker should.

Requires `HERDR_ENV=1`. Else stop: not inside Herdr.
Also use skill `herdr` for CLI details.

| Who | Does |
|-----|------|
| **You (this coding agent)** | route, PLAN, herdr CLI, blocked-handler, parse STATUS, merge, talk to user |
| **Worker** | `opencode` in another pane — one PRIMARY SKILL + STATUS artifact |

Default worker binary: **`opencode`**. Other worker agents only if the user names them.

## Hard rules

1. `--no-focus` on AFK spawns. Stay in the orchestrator pane.
2. One PRIMARY SKILL per worker. Workers must not chain other skills.
3. Parallel only with no data edge; else sequence.
4. HITL skills: you (or focused pane). AFK skills: background OpenCode workers. See [ROUTING.md](ROUTING.md).
5. Parse herdr IDs from JSON only. Prefer `herdr agent start`.
6. Dispatch prompts **only** via `herdr pane run` (text + Enter). Never rely on `agent send` alone.
7. Artifacts **only** under `<project>/.scratch/orchestrator/` — never `/tmp` or paths outside the project.
8. Done = STATUS file says `done` **and** skill completion criteria hold — not merely idle TUI.
9. Do not close panes you did not create unless asked (or user set cleanup).
10. Do **not** start `pi` as orchestrator or worker unless the user explicitly asks for pi.

## Steps

### 1. Route

Re-read project `ask-matt` (or [ROUTING.md](ROUTING.md) if ask-matt missing).
Build an ordered job list: `{ skill, mode, depends_on, worker_name, artifact_dir }`.

**Completion:** every user intent maps to ≥1 job or an explicit “do it myself” HITL step.

### 2. Plan confirm (mandatory before any AFK spawn)

Print exactly this shape, then **wait for user yes** (skip only if user already said “just run it” / “no confirm”):

```text
PLAN:
- skill: <name> | mode: AFK|HITL | worker: <name> | depends: <none|worker> | out: .scratch/orchestrator/<run-id>/<worker>/
HITL (this agent): <none|list>
workers: opencode
run-id: <YYYYMMDD-HHMM-short>
Proceed? (y/n)
```

**Completion:** user approved, or explicit skip flag recorded.

### 3. Prepare run dir

```bash
RUN=".scratch/orchestrator/<run-id>"
mkdir -p "$RUN"
```

**Completion:** `$RUN` exists inside the project root.

### 4. Spawn + dispatch each AFK job

For each ready job (deps satisfied):

```bash
herdr agent start <worker> --cwd "<project-root>" --split right --no-focus -- opencode
# tall UI: --split down
herdr agent list   # pane_id from JSON
herdr wait agent-status <worker> --status idle --timeout 60000
# on wait API error: poll `herdr agent get <worker>` every 2s up to 60s
herdr pane run <pane_id> "<prompt from PROMPTS.md>"
```

Fill the prompt from [PROMPTS.md](PROMPTS.md). Set:

- `ARTIFACT_DIR` = `.scratch/orchestrator/<run-id>/<worker>/`
- `STATUS_FILE` = `$ARTIFACT_DIR/STATUS.md`

Reuse an **idle** OpenCode worker with the same role name when possible; else spawn fresh.
Each `implement` after tickets → prefer a **new** worker (clean context).

**Completion:** `pane run` issued; worker left `working` or soon after.

### 5. Wait loop + blocked-handler

Prefer a long status wait (Herdr timeout is **ms**):

```bash
herdr wait agent-status <worker> --status done --timeout 120000000
# 120000000 ms = 120000 s (~33h). On timeout or API error, fall back to poll.
```

Else poll until terminal state (same overall cap ~120000 s; tell user on timeout):

```bash
herdr agent get <worker>
```

| Status | Action |
|--------|--------|
| `working` | keep polling (5–15s) |
| `blocked` | **blocked-handler** (below) |
| `done` or `idle` after work started | collect STATUS |
| `unknown` | `pane read`; if no agent UI, respawn once |
| wait CLI errors | fall back to poll `agent get` + `pane read` |

**Blocked-handler (every blocked):**

1. `herdr pane read <pane_id> --source visible --lines 60`
2. Classify:
   - **Permission / approval UI** → tell user which pane + what is asked; do **not** auto-approve destructive git/network. If user says “approve” → `herdr pane send-keys <pane> enter` **once**.
   - **Skill needs human decision** → paste question to user; on answer `herdr pane run <pane_id> "<answer>"`.
   - **Unclear** → user looks at pane (`herdr agent focus <worker>` only if they ask).
3. Resume poll after handling.

**Completion:** worker finished or user aborted the job.

### 6. Collect STATUS

```bash
herdr pane read <pane_id> --source recent-unwrapped --lines 120
cat .scratch/orchestrator/<run-id>/<worker>/STATUS.md
```

Require [PROMPTS.md](PROMPTS.md) STATUS schema. If file missing: one follow-up

```bash
herdr pane run <pane_id> "Write STATUS.md now at ARTIFACT_DIR per orchestrator schema. Do no other work."
```

then re-wait. Still missing → mark job `failed`.

**Completion:** `STATUS.md` with `STATUS: done|blocked|failed` parsed, or job failed.

### 7. Chain or finish

- `STATUS: done` + `NEXT_SKILL:` → enqueue next job with INPUTS from `ARTIFACTS:`.
- `STATUS: blocked` → user.
- `STATUS: failed` → report; at most one silent retry.
- All jobs done → one user-facing summary (skills, artifact paths, verify commands).

**Completion:** no pending AFK jobs without a terminal STATUS; user has the merge report.

## HITL (this pane)

Run yourself: `ask-matt`, `grill-with-docs` / `grill-me`, triage Q&A, wayfinder charting.
Never mark HITL done without user decisions recorded.

## Quick herdr

```bash
test "${HERDR_ENV:-}" = 1
herdr agent list
herdr agent start <name> --cwd PATH --split right|down --no-focus -- opencode
herdr wait agent-status <t> --status idle|working|blocked|done --timeout MS
# worker job complete: --status done --timeout 120000000  (120000 s)
herdr pane run <pane_id> "<prompt>"
herdr pane read <pane_id> --source visible|recent-unwrapped --lines N
herdr pane send-keys <pane_id> enter
herdr agent focus <t>    # only if user wants
```

`idle` = ready/seen · `done` = finished unseen · `working` = busy · `blocked` = needs input

## Reference (load when needed)

- [ROUTING.md](ROUTING.md) — skill → AFK/HITL map (ask-matt aligned)
- [PROMPTS.md](PROMPTS.md) — worker prompt + STATUS.md schema
