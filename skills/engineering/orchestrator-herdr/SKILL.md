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
11. **Never** treat “worker idle/done” as success by itself. You **must** re-read results (step 6–7) before any next spawn, user summary, or plan change.
12. You are the **brain**: workers only execute one skill. Coordination, quality check, and chaining happen **only** after you ingest their output in **this** pane.

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

Prefer a long status wait (Herdr timeout is **ms**). Treat **either** `done` or `idle` (after work started) as “agent stopped — now ingest”:

```bash
herdr wait agent-status <worker> --status done --timeout 120000000
# 120000000 ms = 120000 s. On timeout/API error, poll instead.
```

Else poll until terminal state (same overall cap; tell user on timeout):

```bash
herdr agent get <worker>
```

| Status | Action |
|--------|--------|
| `working` | keep polling (5–15s); optional mid-flight `pane read` if stalled >2 min |
| `blocked` | **blocked-handler** (below) — then resume wait |
| `done` or `idle` after work started | **immediately** step 6 (ingest) — do not skip |
| `unknown` | `pane read`; if no agent UI, respawn once |
| wait CLI errors | fall back to poll `agent get` + `pane read` |

**Blocked-handler (every blocked):**

1. `herdr pane read <pane_id> --source visible --lines 60`
2. Classify:
   - **Permission / approval UI** → tell user which pane + what is asked; do **not** auto-approve destructive git/network. If user says “approve” → `herdr pane send-keys <pane> enter` **once**.
   - **Skill needs human decision** → paste question to user; on answer `herdr pane run <pane_id> "<answer>"`.
   - **Unclear** → user looks at pane (`herdr agent focus <worker>` only if they ask).
3. Resume poll after handling.

**Completion:** worker stopped (`done`/`idle`) or user aborted — **then always step 6**.

### 6. Ingest results (mandatory — do not skip)

When the worker stops, you **re-read and understand** the outcome in this pane before any coordination decision. Spawning the next job or telling the user “done” **without this step is a failure**.

Run **all** of the following in order:

```bash
# A. Transcript — what the worker actually said/did
herdr pane read <pane_id> --source recent-unwrapped --lines 200

# B. STATUS contract
cat .scratch/orchestrator/<run-id>/<worker>/STATUS.md

# C. Every path listed under ## ARTIFACTS (and any paths in NOTES)
#    Read each file (or enough of it) to judge quality — do not only list paths.
```

If `STATUS.md` is missing: one follow-up, then re-wait and repeat A–C:

```bash
herdr pane run <pane_id> "Write STATUS.md now at ARTIFACT_DIR per orchestrator schema. Do no other work."
```

Still missing → mark job `failed` and go to step 7 with that outcome.

Parse into a structured mental model (you may write it to `$RUN/ORCH-LOG.md`):

| Field | From |
|-------|------|
| `status` | `STATUS:` line |
| `artifacts[]` | `## ARTIFACTS` — **you have opened each** |
| `verify[]` | `## VERIFY` — note whether credible |
| `next_skill` | `## NEXT_SKILL` |
| `next_inputs[]` | `## NEXT_INPUTS` + paths from artifacts |
| `blockers` | `## BLOCKERS` |
| `notes` | `## NOTES` + gaps you saw in transcript vs STATUS |

**Quality gate (orchestrator judgment — not the worker’s word alone):**

- Does STATUS match the transcript and files on disk?
- Are skill completion criteria actually met (not just claimed)?
- Are artifacts usable as INPUTS for the next skill?
- If STATUS says `done` but artifacts are empty/wrong/contradict transcript → treat as `failed` or re-dispatch a fix job; **do not** blindly chain.

**Completion:** STATUS parsed **and** artifacts read **and** quality gate applied. Only then step 7.

### 7. Analyze → coordinate (the actual orchestration)

**After** step 6 only. Decide the next move from evidence, not from “agent finished”.

Print a short **ORCH decision** (to the user or `$RUN/ORCH-LOG.md`) before acting:

```text
ORCH:
- job: <worker>/<skill> → <done|blocked|failed|rework>
- evidence: <1–3 bullets from STATUS + artifacts>
- decision: <chain|ask-user|retry|rework|finish>
- next: <skill + inputs | none>
```

Then act:

| Outcome | Action |
|---------|--------|
| `done` + usable artifacts + `NEXT_SKILL` set or plan has a dependent | Enqueue/spawn next AFK job; pass **concrete** INPUTS from artifacts/`NEXT_INPUTS` (full paths, issue ids). Back to step 4 for that job. |
| `done` + plan has more ready jobs (deps satisfied) | Spawn next ready job (parallel only if no data edge). |
| `done` + nothing left | **Finish report** (below). |
| `blocked` | Stop chain; present `BLOCKERS` + relevant artifact/transcript excerpt to user; after answer, `pane run` resume or re-plan. |
| `failed` or quality gate fail | Report why; **at most one** silent retry with a tighter prompt, else ask user. |
| `rework` | Same or new worker with INPUTS = prior artifacts + explicit fix instructions derived from your analysis. |

**Finish report** (only when every planned AFK job has a terminal ingested STATUS):

- skills run + final status each
- artifact paths (what you actually read)
- verify commands / residual risks
- recommended next human step if any

**Loop rule:** after every worker stop → **step 6 → step 7** → (maybe step 4). Never jump from step 5 to “all done”.

**Completion:** no pending AFK job without an **ingested** terminal STATUS; user has the merge/finish report grounded in artifacts.

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
