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
6. Dispatch = **`herdr agent send` + `herdr pane send-keys <pane_id> Enter`** (verified). Never `agent send` alone without Enter. (`pane run` only as fallback if send+Enter fails.)
7. Artifacts **only** under `<project>/.scratch/orchestrator/` — never `/tmp`.
8. “Worker finished” ≠ success. Success = ingested STATUS + quality gate + your evaluation.
9. **Never spawn the next job** until the user approves the **NEXT PLAN** for that cycle (unless they said once: “auto-run all cycles” / “no confirm”).
10. Only close panes **you** spawned for this run (see **Reuse & close**). Never close the orchestrator pane or panes you did not create unless the user asks.
11. Do **not** start `pi` unless the user asks for pi.
12. You are the **brain**. After every worker stop: **D → E → F** before any new dispatch.
13. **Every PLAN / NEXT PLAN job must name a real project skill** that fits the work (see **Skill selection**). No freeform “just implement” without a skill.
14. **Prefer reusing** an idle worker when it fits; **not mandatory** — spawn fresh when context would pollute the next job. **Close** workers you no longer intend to reuse.

---

## Verified Herdr flow (end-to-end)

Use this sequence for every AFK worker job. Timeouts are **milliseconds**.

```bash
# 1. Integrations + environment
test "${HERDR_ENV:-}" = 1 || { echo "not in Herdr"; exit 1; }
herdr integration status

# 2. See current agents
herdr agent list

# 3. Spawn worker (default binary: opencode; swap argv if user named another)
#    Example names: research, implement, helper-omp
WORKER="research"
herdr agent start "$WORKER" --cwd "$PWD" --split right --no-focus -- opencode
# other agents e.g.:  -- omp --no-title
#                     -- claude
#                     -- codex

# 4. Note pane_id from JSON
herdr agent list
# PANE_ID=...   # parse pane_id for $WORKER — never invent

# 5–6. Dispatch prompt (send text, then Enter) — verified pair
# Write prompt to $ART/PROMPT.txt first if long (PROMPTS.md)
herdr agent send "$WORKER" "$(cat "$PROMPT_FILE")"
herdr pane send-keys "$PANE_ID" Enter

# 7. Wait until idle again (job finished or ready)
#    Long jobs: raise timeout (e.g. 120000000). Default sample: 120000 ms.
herdr agent wait "$WORKER" --status idle --timeout 120000000

# 8. Read transcript
herdr agent read "$WORKER" --source recent
# then open STATUS.md + every ARTIFACT path (see Ingest)

# 9. Close if one-shot / not reusing
herdr pane close "$PANE_ID"
```

**Reuse** (skip 3; keep same `$WORKER` / `$PANE_ID`): steps 2 → 5–8 only. Close (9) only when no further use.

**Blocked mid-job:** `herdr agent read "$WORKER" --source visible` → handle → `herdr agent send` + `send-keys Enter` → `herdr agent wait … idle` again.

---

## Command cookbook (detail)

### 0. Preconditions

```bash
test "${HERDR_ENV:-}" = 1 || { echo "not in Herdr"; exit 1; }
herdr integration status
printf 'orch pane=%s ws=%s tab=%s\n' "$HERDR_PANE_ID" "$HERDR_WORKSPACE_ID" "$HERDR_TAB_ID"
herdr agent list
```

### 1. Run directory

```bash
PROJECT_ROOT="$(pwd)"
RUN_ID="$(date +%Y%m%d-%H%M)-$(printf '%04x' $RANDOM)"
RUN="$PROJECT_ROOT/.scratch/orchestrator/$RUN_ID"
WORKER="research"       # role name, e.g. research / implement / review
ART="$RUN/$WORKER"
mkdir -p "$ART"
STATUS_FILE="$ART/STATUS.md"
PROMPT_FILE="$ART/PROMPT.txt"
{
  echo "# ORCH-LOG $RUN_ID"
  echo "- started: $(date -Iseconds)"
} >> "$RUN/ORCH-LOG.md"
```

### 2. Obtain subagent — reuse first, else spawn

**Reuse is preferred when safe, never required.**

```bash
herdr agent list
# idle compatible worker you own? → reuse. else spawn.
```

| Decide | When |
|--------|------|
| **Reuse** | Same role/skill family, `idle`, same cwd/project, context OK |
| **Spawn new** | Clean context needed, no idle peer, different skill family |
| **Close then spawn** | Wrong role / bloated idle worker |

**Spawn:**

```bash
herdr agent start "$WORKER" --cwd "$PROJECT_ROOT" --split right --no-focus -- opencode
herdr agent list
# PANE_ID from JSON for $WORKER
herdr agent wait "$WORKER" --status idle --timeout 60000   # TUI ready
printf '%s\t%s\t%s\n' "$(date -Iseconds)" "$WORKER" "$PANE_ID" >> "$RUN/workers.tsv"
```

Layout: wide → `--split right`; tall → `--split down`. Optional: omit `--split` if defaults are fine.

### 3. Dispatch (verified: send + Enter)

```bash
# Write full worker prompt into $PROMPT_FILE (PROMPTS.md)
herdr agent send "$WORKER" "$(cat "$PROMPT_FILE")"
herdr pane send-keys "$PANE_ID" Enter
```

Must set in prompt: `PRIMARY SKILL`, `SKILL_PATH`, `ARTIFACT_DIR=$ART`, `STATUS_FILE`, `INPUTS`, `USER INTENT`.

Fallback only if send+Enter fails: `herdr pane run "$PANE_ID" "$(cat "$PROMPT_FILE")"`.

### 4. Supervise until idle

```bash
herdr agent wait "$WORKER" --status idle --timeout 120000000
# On timeout/API error, poll:
herdr agent get "$WORKER"
```

| `agent_status` | Action |
|----------------|--------|
| `working` | keep waiting / poll 5–15s; peek with `herdr agent read` if stuck >2 min |
| `blocked` | blocked-handler |
| `idle` after work started | **Ingest** |
| `done` | treat like finished-unseen → **Ingest** (then may show idle) |
| `unknown` | `herdr agent read`; respawn once if no agent UI |

**Blocked-handler:**

```bash
herdr agent read "$WORKER" --source visible
# or: herdr pane read "$PANE_ID" --source visible --lines 80
```

- Permission UI → tell user; no auto-approve destructive. User approves → `herdr pane send-keys "$PANE_ID" Enter` once.
- Needs decision → `herdr agent send "$WORKER" "<answer>"` then `herdr pane send-keys "$PANE_ID" Enter`.
- Unclear → `herdr agent focus "$WORKER"` only if user wants.

### 5. Ingest (mandatory)

```bash
# A. Transcript (verified)
herdr agent read "$WORKER" --source recent
# optional more lines: herdr agent read "$WORKER" --source recent-unwrapped --lines 200

# B. STATUS contract
test -f "$STATUS_FILE" && cat "$STATUS_FILE"

# C. Open every path under ## ARTIFACTS (Read tool — not list-only)
```

Missing STATUS — one recovery:

```bash
herdr agent send "$WORKER" "Write STATUS.md now at $STATUS_FILE using orchestrator STATUS schema. Do no other work."
herdr pane send-keys "$PANE_ID" Enter
herdr agent wait "$WORKER" --status idle --timeout 600000
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

After user approves close, FINISH, or one-shot task done:

```bash
# Only panes you started this run (see $RUN/workers.tsv)
herdr agent get "$WORKER"
herdr pane close "$PANE_ID"
# Log: closed name=... pane=... reason=one-shot|not-reusing|finish
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

## Quick reference (verified order)

```bash
herdr integration status
herdr agent list
herdr agent start <name> --cwd "$PWD" --split right --no-focus -- opencode
herdr agent list                          # note pane_id
herdr agent send <name> "<prompt>"
herdr pane send-keys <pane_id> Enter
herdr agent wait <name> --status idle --timeout 120000000
herdr agent read <name> --source recent
herdr pane close <pane_id>                # if one-shot / not reusing
```

Also: `herdr agent get` · `herdr agent focus` (user asked) · `herdr pane run` (fallback only)

`idle` = ready/seen · `done` = finished unseen · `working` = busy · `blocked` = needs input

---

## Reference

- [WORKFLOW.md](WORKFLOW.md) — full cycle narrative + anti-patterns
- [ROUTING.md](ROUTING.md) — skill → AFK/HITL
- [PROMPTS.md](PROMPTS.md) — worker prompt + STATUS schema
