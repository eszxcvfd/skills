---
name: orchestrator-herdr
description: "Herdr orchestrator: multi-worker plan, skill-driven prompts, mandatory ingest/analyze before next cycle."
disable-model-invocation: true
---

# Orchestrator (Herdr)

You **coordinate only**. Workers run project skills. `HERDR_ENV=1` required.

```text
route many jobs → PLAN (approve) → dispatch N workers
  → each stop: INGEST + quality-gate + ORCH (mandatory)
  → NEXT PLAN / FINISH (approve) → …
```

Worker finish ≠ success. Never chain or finish without ingest.

| You | Worker |
|-----|--------|
| Route, plan, herdr, ingest, analyze, next plan | 1 PRIMARY SKILL + STATUS under `.scratch/orchestrator/` |

Default binary: `opencode`.

## Rules

1. `--no-focus` spawns. Stay in orchestrator pane.
2. **One skill per worker.** Many workers OK (parallel if no data edge; else sequence).
3. Skills from **project inventory** only. Open `ask-matt` or [ROUTING.md](ROUTING.md). Verify `SKILL.md` on disk. Match skill → work.
4. Build each prompt from that skill’s **real requirements** (see Dispatch) — not a vague “do the task”.
5. Artifacts only under `.scratch/orchestrator/<run-id>/`.
6. After **every** worker stop: **Ingest → quality-gate → ORCH** before any next spawn or “done”.
7. No next AFK job without user **y** on PLAN/NEXT PLAN (unless user said auto-run).
8. Reuse idle worker when same role/cwd fits; else spawn. **Close** run-owned when not reusing / FINISH — don’t ask.
9. Never close your pane or foreign panes.

## Herdr (verified)

```bash
herdr integration status && herdr agent list

herdr agent start "$WORKER" --cwd "$PWD" --split right --no-focus -- opencode
herdr agent list   # pane_id

herdr agent send "$WORKER" "$(cat "$PROMPT_FILE")"
herdr pane send-keys "$PANE_ID" Enter

herdr agent wait "$WORKER" --status idle --timeout 120000000
herdr agent read "$WORKER" --source recent

herdr pane close "$PANE_ID"   # if not reusing
```

Blocked: `agent read` visible → handle → send + Enter → wait idle.  
Fallback: `herdr pane run` if send+Enter fails.

## 1. Route → multi-job PLAN

Map **whole user goal** to jobs: `{ skill, path, mode, worker, depends_on, out }`.

- Multiple AFK skills → multiple workers (e.g. research ∥ diagnose if independent; implement after research).
- HITL (`grill-*`, `ask-matt`, triage Q&A) → **this** pane.
- Each job: skill exists + `match` why it fits.

```text
PLAN (run <id>):
- [1] skill: <name> | path: .agents/skills/<name>/SKILL.md | AFK|HITL | worker: <w1> | depends: none | out: .scratch/orchestrator/<id>/<w1>/
      match: …
- [2] skill: <name> | path: … | worker: <w2> | depends: <w1|none> | out: …
      match: …
parallel: <none | 1+2 if no data edge>
goal: <one line>
Proceed? (y/n)
```

**Wait for y.**

## 2. Dispatch (skill requirements → prompt)

For each ready job (deps satisfied):

```bash
RUN=".scratch/orchestrator/<id>"; ART="$RUN/$WORKER"; mkdir -p "$ART"
PROMPT_FILE="$ART/PROMPT.txt"
# 1) Read SKILL_PATH fully (or enough to extract steps + DONE/completion criteria)
# 2) Write PROMPT_FILE = PROMPTS.md template filled with:
#    PRIMARY SKILL, SKILL_PATH,
#    SKILL_REQUIREMENTS: bullet the skill’s steps/completion criteria (quoted from SKILL.md),
#    INPUTS, USER INTENT, ARTIFACT_DIR, STATUS_FILE
# 3) herdr flow: send + Enter (reuse idle same role if OK)
printf '%s\t%s\n' "$WORKER" "$PANE_ID" >> "$RUN/workers.tsv"
```

Parallel: start all independent ready jobs, then wait/ingest **each**.

## 3. Ingest (mandatory — every worker stop)

Do **all**, in order. Skipping = failure.

```bash
herdr agent read "$WORKER" --source recent          # A transcript
cat "$ART/STATUS.md"                                # B STATUS
# C Read tool: every path under ## ARTIFACTS (+ NOTES paths)
```

No STATUS → one send “Write STATUS.md now at … schema. Do no other work.” + Enter + wait; still missing → `failed`.

**Quality gate** (your judgment, not worker’s claim):

- STATUS matches transcript + files on disk?
- Skill completion criteria from SKILL.md actually met?
- Artifacts usable as next INPUTS?
- STATUS `done` but empty/wrong artifacts → `failed` / rework — **do not** advance.

## 4. ORCH decision (mandatory before next action)

```text
ORCH:
- job: <worker>/<skill> → done|blocked|failed|rework
- evidence: <from STATUS + opened files>
- quality_gate: pass|fail — <why>
- decision: next-plan|retry|rework|finish|ask-user
- next_hint: <skill + inputs | none>
```

| Outcome | Action |
|---------|--------|
| pass + more jobs in PLAN ready | dispatch those (still within approved PLAN) |
| pass + need new skill not in PLAN | **NEXT PLAN** → wait y |
| pass + nothing left | **FINISH** → wait y |
| blocked | user; then resume or re-plan |
| fail / gate fail | one tighter retry or ask user |
| rework | same/new worker + fix instructions from analysis |

**Loop:** every stop → §3 → §4. Never wait-idle → “all done”.

## 5. NEXT PLAN / FINISH (wait for y)

```text
NEXT PLAN:
- [n] skill: … | path: … | worker: reuse|spawn … | depends: … | out: …
  match: … | inputs: <from artifacts>
Proceed? (y/n)
```

```text
FINISH:
- jobs + statuses + artifact paths you opened
- closing: <workers>
```

On FINISH y or worker not reused: `herdr pane close` immediately.

## Refs

[PROMPTS.md](PROMPTS.md) · [ROUTING.md](ROUTING.md) · [WORKFLOW.md](WORKFLOW.md)
