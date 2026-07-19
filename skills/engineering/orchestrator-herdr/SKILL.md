---
name: orchestrator-herdr
description: "Herdr orchestrator: plan → approve → worker → read results → next plan → approve. Project skills only."
disable-model-invocation: true
---

# Orchestrator (Herdr)

You coordinate. Workers execute one project skill each. Requires `HERDR_ENV=1`.

```text
PLAN → user y/n → dispatch worker → wait idle → ingest → evaluate → NEXT PLAN / FINISH → user y/n → …
```

| You | Worker |
|-----|--------|
| Route skill, plan, herdr CLI, read results, next plan | One PRIMARY SKILL + `STATUS.md` under `.scratch/orchestrator/` |

Default worker binary: `opencode` (or what the user names).

## Rules

1. Stay in orchestrator pane (`--no-focus` on spawns).
2. One skill per worker. No auto-chain without a new user **y** on PLAN/NEXT PLAN.
3. PLAN skill must exist in the **project** (`.agents/skills`, `.claude/skills`, or `skills/engineering|productivity`). Inventory + open `ask-matt` if present, else [ROUTING.md](ROUTING.md).
4. Artifacts only under `.scratch/orchestrator/<run-id>/`.
5. Idle/done ≠ success — read STATUS + artifacts first.
6. Prefer **reuse** idle worker when same role/cwd fits; else spawn. **Close** run-owned workers when not reusing or on FINISH — do it, don't ask.
7. Never close your own pane or panes you didn't create.

## Herdr flow (verified)

```bash
herdr integration status
herdr agent list

# spawn (or skip if reusing idle $WORKER)
herdr agent start "$WORKER" --cwd "$PWD" --split right --no-focus -- opencode
herdr agent list   # note pane_id

herdr agent send "$WORKER" "$(cat "$PROMPT_FILE")"
herdr pane send-keys "$PANE_ID" Enter

herdr agent wait "$WORKER" --status idle --timeout 120000000
herdr agent read "$WORKER" --source recent
# + cat STATUS.md + Read each ARTIFACTS path

# when not reusing / FINISH:
herdr pane close "$PANE_ID"
```

Blocked: `herdr agent read … visible` → user if needed → `agent send` + `send-keys Enter` → wait idle again.  
Fallback dispatch only if send+Enter fails: `herdr pane run "$PANE_ID" "…"`.

## Cycle

### 1. PLAN (wait for y)

Pick **one** installed skill for this atom of work.

```text
PLAN (cycle N):
- skill: <name> | path: <.agents/skills/.../SKILL.md> | mode: AFK|HITL | worker: <name>
- match: <why this skill>
- worker: reuse <name> | spawn <name>
- out: .scratch/orchestrator/<run-id>/<worker>/
- goal: <one line>
Proceed? (y/n)
```

HITL skills (`grill-*`, `ask-matt`, triage Q&A): run in **this** pane. AFK: worker.

### 2. Dispatch

```bash
RUN=".scratch/orchestrator/<run-id>"; ART="$RUN/$WORKER"; mkdir -p "$ART"
# write PROMPT.txt from PROMPTS.md → send + Enter (flow above)
printf '%s\t%s\n' "$WORKER" "$PANE_ID" >> "$RUN/workers.tsv"
```

### 3. Ingest + evaluate

```bash
herdr agent read "$WORKER" --source recent
cat "$ART/STATUS.md"
# open every ## ARTIFACTS path
```

Missing STATUS → one `agent send` “write STATUS.md now…” + Enter + wait; still missing → failed.

```text
ORCH:
- job: <worker>/<skill> → done|blocked|failed
- evidence: <1–3 bullets>
- quality: pass|fail
- next: <skill|finish|rework>
```

### 4. NEXT PLAN or FINISH (wait for y)

```text
NEXT PLAN (cycle N+1):
- skill: <name> | path: … | worker: reuse|spawn <name>
- match: …
- inputs: <paths from artifacts>
- out: .scratch/orchestrator/<run-id>/<worker>/
Proceed? (y/n)
```

```text
FINISH:
- summary + artifact paths
- closing workers: <names>
```

On **y** for FINISH (or when a worker won't be reused): `herdr pane close` those panes immediately — no extra confirm.

## Prompt / STATUS

See [PROMPTS.md](PROMPTS.md). Map: [ROUTING.md](ROUTING.md).
