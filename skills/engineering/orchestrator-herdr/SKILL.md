---
name: orchestrator-herdr
description: "Coding-agent orchestrator on Herdr — cycle: PLAN→approve→subagent→ingest→evaluate→NEXT PLAN→approve. OpenCode workers + STATUS under .scratch/orchestrator/."
disable-model-invocation: true
---

# Orchestrator — coding agent → OpenCode workers (Herdr)

**You** are the orchestrator in this Herdr pane. You do **not** hand control to pi.

## Canonical loop (mandatory)

Every unit of work is **one cycle**. Never auto-chain to the next skill without a new user approval.

```text
┌─────────────────────────────────────────────────────────────┐
│  A. PLAN (this cycle only)                                  │
│     → print PLAN block → WAIT user y/n                      │
│  B. DISPATCH subagent (herdr commands below)                │
│  C. SUPERVISE (wait / blocked-handler)                      │
│  D. INGEST (read transcript + STATUS + open every artifact) │
│  E. EVALUATE (think: quality, gaps, what next)              │
│  F. NEXT PLAN (or FINISH)                                   │
│     → print ORCH + NEXT PLAN → WAIT user y/n                │
│     → if y and more work: back to B with that plan          │
│     → if finish approved: FINISH report                     │
└─────────────────────────────────────────────────────────────┘
```

| Who | Does |
|-----|------|
| **You** | PLAN, herdr CLI, ingest, evaluate, NEXT PLAN, talk to user |
| **Subagent (worker)** | `opencode` in sibling pane — **one** PRIMARY SKILL + `STATUS.md` only |

Default worker: **`opencode`**. Other binaries only if user names them.

Requires `HERDR_ENV=1`. Else stop. Also load skill `herdr` when unsure about CLI.

Full prompt/STATUS shapes: [PROMPTS.md](PROMPTS.md). Routing map: [ROUTING.md](ROUTING.md). Worked example: [WORKFLOW.md](WORKFLOW.md).

---

## Hard rules

1. `--no-focus` on AFK spawns. Stay in the orchestrator pane.
2. One PRIMARY SKILL per worker. Workers must not chain skills.
3. Parallel only with no data edge; else one worker per cycle (preferred).
4. HITL skills run in **this** pane; AFK skills → background workers ([ROUTING.md](ROUTING.md)).
5. Parse herdr IDs from **JSON only**. Prefer `herdr agent start`.
6. Task text **only** via `herdr pane run` (text + Enter). Never `agent send` alone for prompts.
7. Artifacts **only** under `<project>/.scratch/orchestrator/` — never `/tmp`.
8. “Worker finished” ≠ success. Success = ingested STATUS + quality gate + your evaluation.
9. **Never spawn the next job** until the user approves the **NEXT PLAN** for that cycle (unless they said once: “auto-run all cycles” / “no confirm”).
10. Only close panes **you** spawned for this run (see **Reuse & close**). Never close the orchestrator pane or panes you did not create unless the user asks.
11. Do **not** start `pi` unless the user asks for pi.
12. You are the **brain**. After every worker stop: **D → E → F** before any new dispatch.
13. **Every PLAN / NEXT PLAN job must name a real project skill** that fits the work (see **Skill selection**). No freeform “just implement” without a skill.
14. **Prefer reusing** an idle worker when it fits; **not mandatory** — spawn fresh when context would pollute the next job. **Close** workers you no longer intend to reuse.

---

## Command cookbook (copy-paste)

Timeouts are **milliseconds**. `120000000` ms = 120000 s.

### 0. Preconditions

```bash
test "${HERDR_ENV:-}" = 1 || { echo "not in Herdr"; exit 1; }
printf 'orch pane=%s ws=%s tab=%s\n' "$HERDR_PANE_ID" "$HERDR_WORKSPACE_ID" "$HERDR_TAB_ID"
herdr agent list
herdr pane list --workspace "$HERDR_WORKSPACE_ID"
```

### 1. Run directory

```bash
PROJECT_ROOT="$(pwd)"   # or absolute project root
RUN_ID="$(date +%Y%m%d-%H%M)-$(printf '%04x' $RANDOM)"
RUN="$PROJECT_ROOT/.scratch/orchestrator/$RUN_ID"
WORKER="w1"             # short role name, e.g. research / implement / review
ART="$RUN/$WORKER"
mkdir -p "$ART"
STATUS_FILE="$ART/STATUS.md"
# append cycle header
{
  echo "# ORCH-LOG $RUN_ID"
  echo "- started: $(date -Iseconds)"
} >> "$RUN/ORCH-LOG.md"
```

### 2. Obtain subagent — reuse first, else spawn (OpenCode)

**Reuse is preferred when safe, never required.**

```bash
herdr agent list
# Look for an idle worker you own from this run (same or compatible role).
```

| Decide | When |
|--------|------|
| **Reuse** | Same role/skill family, status `idle` or `done`, same `cwd`/project, prior context helps or is harmless, user did not demand a clean agent |
| **Spawn new** | Different skill family, need clean context (e.g. after tickets→implement, failed quality gate, polluted chat), no idle peer, or reuse would confuse the model |
| **Close then spawn** | Old worker idle but wrong role / bloated — close it, start fresh name |

**Reuse path:**

```bash
herdr agent get "$WORKER"          # must be idle|done, opencode, your pane
# PANE_ID from JSON
herdr pane run "$PANE_ID" "$(cat "$PROMPT_FILE")"
# Track in ORCH-LOG: worker_action: reuse name=... pane=...
```

**Spawn path:**

```bash
herdr agent start "$WORKER" --cwd "$PROJECT_ROOT" --split right --no-focus -- opencode
herdr agent list
herdr agent get "$WORKER"
# PANE_ID=... from JSON
herdr wait agent-status "$PANE_ID" --status idle --timeout 60000
# Track: worker_action: spawn name=... pane=...
# Record pane_id in $RUN/workers.tsv for later close
printf '%s\t%s\t%s\n' "$(date -Iseconds)" "$WORKER" "$PANE_ID" >> "$RUN/workers.tsv"
```

Layout: wide → `--split right`; tall → `--split down`.

Fresh name examples: `implement-2`, `review-2` when you keep the old pane for possible reuse or after close.

### 3. Write prompt file then dispatch (avoids shell-quoting bugs)

```bash
PROMPT_FILE="$ART/PROMPT.txt"
# Write full worker prompt (see PROMPTS.md) into $PROMPT_FILE with Write tool.
# Then send file contents + Enter:
herdr pane run "$PANE_ID" "$(cat "$PROMPT_FILE")"
```

Must set inside prompt: `PRIMARY SKILL`, `ARTIFACT_DIR=$ART`, `STATUS_FILE=$STATUS_FILE`, concrete `INPUTS`, `USER INTENT`.

### 4. Supervise until stop

```bash
# optional: confirm it started working
herdr wait agent-status "$PANE_ID" --status working --timeout 120000

# long wait for completion (background tab → often "done")
herdr wait agent-status "$PANE_ID" --status done --timeout 120000000

# If user is watching that pane, completion may be "idle" instead — poll:
herdr agent get "$WORKER"
# terminal for ingest when status is done OR idle (after work had started)
```

| `agent_status` | Action |
|----------------|--------|
| `working` | poll 5–15s; if stuck >2 min → `pane read` peek |
| `blocked` | blocked-handler (below) |
| `done` or `idle` after work | **go to Ingest** |
| `unknown` | `pane read`; respawn once if no agent UI |

**Blocked-handler:**

```bash
herdr pane read "$PANE_ID" --source visible --lines 80
```

- Permission UI → tell user pane + request; **no** auto-approve destructive ops. User says approve → `herdr pane send-keys "$PANE_ID" enter` once.
- Needs decision → paste question; answer → `herdr pane run "$PANE_ID" "<answer>"`.
- Unclear → offer `herdr agent focus "$WORKER"` only if user wants.

### 5. Ingest (mandatory commands)

```bash
# A. Transcript
herdr pane read "$PANE_ID" --source recent-unwrapped --lines 200
# or: herdr agent read "$WORKER" --source recent-unwrapped --lines 200

# B. STATUS contract
test -f "$STATUS_FILE" && cat "$STATUS_FILE"

# C. List + read every artifact path from STATUS ## ARTIFACTS
#    Use Read tool on each path — listing alone is not enough.
```

Missing STATUS — one recovery:

```bash
herdr pane run "$PANE_ID" "Write STATUS.md now at $STATUS_FILE using orchestrator STATUS schema. Do no other work."
herdr wait agent-status "$PANE_ID" --status done --timeout 600000
# re-run ingest A–C
```

Still missing → cycle outcome `failed`.

### 6. Evaluate + log (this pane — think before asking user)

Append to `$RUN/ORCH-LOG.md` and print to user:

```text
ORCH (cycle N):
- worker: <name> | skill: <skill> | status: done|blocked|failed|rework
- evidence:
  - <from STATUS + files you opened>
  - <verify credible? y/n>
- quality_gate: pass|fail — <why>
- gaps: <what is still missing for the user goal>
- recommendation: next_skill=... | finish | rework | ask_user
```

Quality gate fails if: empty artifacts on claimed done, STATUS contradicts transcript/files, skill completion criteria unmet.

### 7. NEXT PLAN → wait for approval (mandatory)

Before printing: re-run **Skill selection** for the next atom of work (same inventory rules). `NEXT_SKILL` from the worker is only a hint — you must still map it to an **installed** project skill or reject it.

Also decide **worker lifecycle** for the just-finished and next jobs (reuse / keep idle / close).

Print **exactly** one of these, then **stop and wait** (do not spawn yet):

**More work:**

```text
NEXT PLAN (cycle N+1):
- skill: <exact-folder-name> | path: <skills/.../SKILL.md> | mode: AFK|HITL | worker: <name>
- match: <why this project skill fits the remaining gap>
- worker_lifecycle: reuse <name> | spawn <name> | close <old> then spawn <new>
- depends: <prior worker/artifacts>
- inputs:
  - <concrete path or id from artifacts>
- out: .scratch/orchestrator/<run-id>/<worker>/
- why: <1–2 sentences from evaluation>
- close_now: <none|pane ids/names no longer needed>
Proceed? (y/n/edit)
```

**Done with run:**

```text
FINISH:
- cycles: ...
- artifacts: ...
- verify: ...
- residual risks: ...
- close_workers: <all run-owned idle workers | list | none — user keeps them>
Accept finish? (y/n)
```

Only after **y** (or user edit then y): apply `close_now` / `close_workers` if listed, then **Dispatch** or end.

### 8. Close workers (when not reusing)

After user approves a plan that says close, or FINISH with close, or you know a worker will not be reused:

```bash
# Only panes you started this run (see $RUN/workers.tsv)
herdr agent get "$WORKER"          # confirm still your worker
herdr pane close "$PANE_ID"
# Log: closed name=... pane=... reason=not-reusing|finish|wrong-role
```

| Do close | Do not close |
|----------|----------------|
| Worker you spawned; idle/done; no further job for it | Orchestrator pane (`$HERDR_PANE_ID`) |
| FINISH approved with `close_workers` | Panes you did not create |
| NEXT PLAN says `close_now` / replace role | Still `working` or `blocked` (wait or ask user) |
| User says “đóng worker / cleanup” | User said keep workers open |

Default on **FINISH**: close run-owned workers unless user said keep them or `close_workers: none`.

Default **mid-run**: keep idle workers if a later cycle might reuse the same role; close when switching skill family with no plan to return, or when panes clutter the tab.

Skip confirm **only** if user already said “auto-run all cycles” / “just run it” for this whole run.

---

## Cycle steps (checklist)

### A. Initial PLAN (cycle 1) — skill selection first

**Skill selection (mandatory before any PLAN block):**

1. **Inventory project skills** (in the **user’s project** cwd, not only this skills repo):
   ```bash
   # Prefer project-local installs
   ls -1 .agents/skills 2>/dev/null
   ls -1 .claude/skills 2>/dev/null
   # Or linked / vendored skill trees
   find skills/engineering skills/productivity -name SKILL.md 2>/dev/null | head -200
   ```
2. **Read the router**: open project `ask-matt` (`**/ask-matt/SKILL.md` or `.agents/skills/ask-matt`) when present; else [ROUTING.md](ROUTING.md).
3. **Map user intent → one skill per job** using situation tables (grill / research / implement / tdd / code-review / …). Prefer promoted engineering + productivity skills.
4. **Verify the skill exists on disk** before naming it:
   ```bash
   # examples — pick the path that actually exists
   test -f .agents/skills/<name>/SKILL.md || test -f skills/engineering/<name>/SKILL.md || test -f skills/productivity/<name>/SKILL.md
   ```
5. **Open that skill’s `SKILL.md` description** (and enough of the body) to confirm it matches the job. If no skill fits → either HITL `ask-matt` with the user, or an explicit **HITL (this agent)** line with `skill: none (orchestrator)` and why — never invent a fake skill name.
6. Put the **exact skill folder name** in PLAN (same string the worker will load as PRIMARY SKILL).

Prefer **one AFK job per cycle**. Parallel only if independent and user wants speed.

```text
PLAN (cycle 1):
- skill: <exact-folder-name> | path: <skills/.../SKILL.md or .agents/skills/.../SKILL.md> | mode: AFK|HITL | worker: <name> | depends: none | out: .scratch/orchestrator/<run-id>/<worker>/
- match: <one line: why this project skill fits the user task>
- worker_lifecycle: spawn <name> | reuse <name>
HITL (this agent): <none|list with skill names>
goal: <user goal one line>
skill_source: project-inventory + ask-matt|ROUTING
workers: opencode
run-id: <id>
Proceed? (y/n)
```

Invalid PLAN (do not show / do not proceed): missing `skill`, skill not on disk, `match` empty, or skill name guessed without inventory.

**Wait for y.** Then mkdir run dir → B. Pass `PRIMARY SKILL: <exact-folder-name>` and the verified `path` in the worker prompt ([PROMPTS.md](PROMPTS.md)).

### B–C. Dispatch + supervise

Cookbook §2–4. Fill prompt from [PROMPTS.md](PROMPTS.md).

### D–E. Ingest + evaluate

Cookbook §5–6. Never skip.

### F. NEXT PLAN or FINISH

Cookbook §7. **Wait for y.** Loop or stop.

---

## HITL (this pane)

`ask-matt`, `grill-with-docs` / `grill-me`, triage Q&A, wayfinder charting — you run them here, still end the cycle with evaluation + NEXT PLAN/FINISH for user approval when more AFK work follows.

---

## Quick reference

```bash
test "${HERDR_ENV:-}" = 1
herdr agent list
herdr agent start <name> --cwd PATH --split right|down --no-focus -- opencode
herdr agent get <name|pane>
herdr wait agent-status <pane> --status idle|working|blocked|done|unknown --timeout MS
herdr pane run <pane> "<prompt>"
herdr pane read <pane> --source visible|recent-unwrapped --lines N
herdr agent read <name> --source recent-unwrapped --lines N
herdr pane send-keys <pane> enter
herdr pane close <pane>     # only run-owned workers when not reusing
herdr agent focus <name>    # only if user wants
```

`idle` = ready/seen · `done` = finished unseen · `working` = busy · `blocked` = needs input

---

## Reference

- [WORKFLOW.md](WORKFLOW.md) — full cycle narrative + anti-patterns
- [ROUTING.md](ROUTING.md) — skill → AFK/HITL
- [PROMPTS.md](PROMPTS.md) — worker prompt + STATUS schema
