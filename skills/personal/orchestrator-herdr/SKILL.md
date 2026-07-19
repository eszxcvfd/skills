---
name: orchestrator-herdr
description: "Pi orchestrator on Herdr: plan-confirm, route via project skills, spawn OpenCode workers with STATUS artifacts under .scratch/orchestrator/. Use for multi-agent orchestration, skill-driven delegation, herd / pi điều phối."
---

# Orchestrator — skills → OpenCode (Herdr)

You are the **orchestrator**. You do **not** run heavy skill bodies yourself.
You route, confirm a plan, spawn workers, handle blocks, parse STATUS, chain.

Requires `HERDR_ENV=1`. Else stop: not inside Herdr.
Also use skill `herdr` for CLI details.

| Who | Does |
|-----|------|
| **You (pi)** | route, PLAN, herdr, blocked-handler, parse STATUS, merge |
| **Worker (`opencode`)** | one PRIMARY SKILL end-to-end + write STATUS artifact |

## Hard rules

1. `--no-focus` on AFK spawns. Stay in the orchestrator pane.
2. One PRIMARY SKILL per worker. Workers must not chain other skills.
3. Parallel only with no data edge; else sequence.
4. HITL skills: you (or focused pane). AFK skills: background workers. See [ROUTING.md](ROUTING.md).
5. Parse herdr IDs from JSON only. Prefer `herdr agent start`.
6. Dispatch prompts **only** via `herdr pane run` (text + Enter). Never rely on `agent send` alone.
7. Artifacts **only** under `<project>/.scratch/orchestrator/` — never `/tmp` or paths outside the project (avoids permission walls).
8. Done = STATUS file says `done` **and** skill completion criteria hold — not merely idle TUI.
9. Do not close panes you did not create unless asked (or user set cleanup).

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
HITL (orchestrator): <none|list>
run-id: <YYYYMMDD-HHMM-short>
Proceed? (y/n)
```

**Completion:** user approved, or explicit skip flag recorded.

### 3. Prepare run dir

```bash
RUN=".scratch/orchestrator/<run-id>"
mkdir -p "$RUN"
# optional: echo PLAN > "$RUN/PLAN.md"
```

**Completion:** `$RUN` exists inside the project root.

### 4. Spawn + dispatch each AFK job

For each ready job (deps satisfied):

```bash
herdr agent start <worker> --cwd "<project-root>" --split right --no-focus -- opencode
# tall UI: --split down
herdr agent list   # pane_id from JSON
# wait idle — prefer wait; on API error, poll agent get every 2s up to 60s
herdr wait agent-status <worker> --status idle --timeout 60000
herdr pane run <pane_id> "<prompt from PROMPTS.md>"
```

Fill the prompt from [PROMPTS.md](PROMPTS.md). Set:

- `ARTIFACT_DIR` = `.scratch/orchestrator/<run-id>/<worker>/`
- `STATUS_FILE` = `$ARTIFACT_DIR/STATUS.md`

Reuse an **idle** worker with the same skill name when possible; else spawn fresh.
Fresh context required after tickets → each `implement` should be a new worker or clearly reset prompt.

**Completion:** `pane run` issued; worker left `working` or soon after.

### 5. Wait loop + blocked-handler

Poll until terminal state (cap e.g. 15–30 min per job; tell user on timeout):

```bash
herdr agent get <worker>          # or wait agent-status
# status: working | blocked | idle | done | unknown
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
   - **Permission / approval UI** (Allow once, y/n tool) → tell user which pane + what is asked; do **not** auto-approve destructive git/network. User may say “approve” → `herdr pane send-keys <pane> enter` (or the key they specify) **once**.
   - **Skill needs human decision** → paste question to user; on answer `herdr pane run <pane_id> "<answer>"`.
   - **Unclear** → user looks at pane (`herdr agent focus <worker>` only if they ask).
3. Resume poll after handling.

**Completion:** worker finished or user aborted the job.

### 6. Collect STATUS

```bash
herdr pane read <pane_id> --source recent-unwrapped --lines 120
# primary signal:
cat .scratch/orchestrator/<run-id>/<worker>/STATUS.md
```

Require [PROMPTS.md](PROMPTS.md) STATUS schema. If file missing: one follow-up

```bash
herdr pane run <pane_id> "Write STATUS.md now at ARTIFACT_DIR per orchestrator schema. Do no other work."
```

then re-wait. Still missing → mark job `failed` in your summary.

**Completion:** `STATUS.md` with `STATUS: done|blocked|failed` parsed, or job failed.

### 7. Chain or finish

- `STATUS: done` + `NEXT_SKILL:` → enqueue next job with INPUTS from `ARTIFACTS:`.
- `STATUS: blocked` → user.
- `STATUS: failed` → report; do not silent-retry more than once.
- All jobs done → one user-facing summary (skills, artifact paths, verify commands).

**Completion:** no pending AFK jobs without a terminal STATUS; user has the merge report.

## HITL (orchestrator pane)

Run yourself: `ask-matt`, `grill-with-docs` / `grill-me`, triage Q&A, wayfinder charting.
Never mark HITL done without user decisions recorded (CONTEXT/ADR/ticket as that skill says).

## Quick herdr

```bash
test "${HERDR_ENV:-}" = 1
herdr agent list
herdr agent start <name> --cwd PATH --split right|down --no-focus -- opencode
herdr wait agent-status <t> --status idle|working|blocked|done --timeout MS
herdr pane run <pane_id> "<prompt>"
herdr pane read <pane_id> --source visible|recent-unwrapped --lines N
herdr pane send-keys <pane_id> enter
herdr agent focus <t>    # only if user wants
```

`idle` = ready/seen · `done` = finished unseen · `working` = busy · `blocked` = needs input

## Reference (load when needed)

- [ROUTING.md](ROUTING.md) — skill → AFK/HITL map (ask-matt aligned)
- [PROMPTS.md](PROMPTS.md) — worker prompt + STATUS.md schema
