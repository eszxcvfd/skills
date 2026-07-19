# Standard workflow — plan → subagent → analyze → next plan → approve

This is the **only** supported orchestration pattern. One **cycle** at a time.

## One cycle

```text
1. PLAN          You propose exactly what the next subagent will do
2. APPROVE       User says y / n / edit  ← hard gate
3. DISPATCH      herdr agent start + pane run (see SKILL cookbook)
4. WORK          Subagent runs ONE primary skill; writes STATUS + artifacts
5. INGEST        You re-read transcript, STATUS, and every artifact file
6. EVALUATE      You judge quality, gaps, user-goal progress
7. NEXT PLAN     You propose the following cycle (or FINISH)
8. APPROVE       User says y / n / edit  ← hard gate again
9. loop or stop
```

## Subagent contract

| Rule | Detail |
|------|--------|
| Identity | Sibling pane, default binary `opencode` |
| Scope | Exactly one PRIMARY SKILL |
| Output | `STATUS.md` + files under `ARTIFACT_DIR` |
| No chain | Must not invoke other skills or spawn peers |
| No memory | Does not see prior cycles unless you put paths in INPUTS |

You own: routing, approvals, herdr control, analysis, next plan.

## What you must write each cycle

| Artifact | Who | When |
|----------|-----|------|
| `PLAN` / `NEXT PLAN` block in chat | You | Before any spawn |
| `$ART/PROMPT.txt` | You | Before `pane run` |
| `$ART/STATUS.md` | Worker | Before it stops |
| `$RUN/ORCH-LOG.md` entry | You | After ingest/evaluate |

## Evaluation rubric (step 6)

Answer explicitly before NEXT PLAN:

1. **Claim vs disk** — Does STATUS match files and transcript?
2. **Skill done?** — Primary skill completion criteria met?
3. **Goal progress** — What % of the user goal is now satisfied?
4. **Gaps** — What still blocks shipping / the stated goal?
5. **Next atom** — Smallest next skill (or HITL question) that closes the largest gap?
6. **Inputs** — Exact paths/ids the next worker needs (copy from ARTIFACTS / NEXT_INPUTS)?

If (1) or (2) fail → recommendation is `rework` or `failed`, not “chain next skill”.

## Skill selection (every PLAN / NEXT PLAN)

Before writing the plan block:

1. Inventory skills in **this project** (`.agents/skills`, `.claude/skills`, and/or `skills/engineering|productivity`).
2. Read project `ask-matt` (or fallback ROUTING.md).
3. Choose the skill whose purpose matches the **current atom** of work.
4. `test -f …/SKILL.md` for that name — must exist.
5. PLAN fields must include: `skill:` (exact folder name), `path:`, `match:` (why it fits).

Forbidden: generic jobs without a project skill (`"refactor the module"` with no skill), invented skill names, or skills only known from memory and not found on disk.

## NEXT PLAN quality bar

A good NEXT PLAN has:

- One **installed** project skill (verified path)
- Non-empty `match:` tying skill → remaining gap
- Concrete inputs (paths that exist after ingest)
- One-sentence **why** tied to evaluation gaps
- Single worker name and output dir

Bad NEXT PLAN: “continue”, “fix stuff”, skill not in inventory, inputs = “see above”, no approval wait.

## Anti-patterns (fail the skill)

- Spawn worker without PLAN approval
- PLAN without a verified project skill (`skill` + `path` + `match`)
- Treat `agent_status=done/idle` as success without ingest
- Auto-spawn next skill because `NEXT_SKILL:` was set
- Summarize to user without opening artifact files
- Put artifacts in `/tmp` or outside the project
- Multi-skill prompt in one worker
- Skip NEXT PLAN approval “to save time” (unless user set auto-run)

## Example run (narrative)

**User goal:** “Research X then implement the smallest fix.”

### Cycle 1

```text
PLAN (cycle 1):
- skill: research | path: .agents/skills/research/SKILL.md | mode: AFK | worker: research | depends: none
- match: primary-source investigation — maps to project research skill
- out: .scratch/orchestrator/20260719-1200-ab12/research/
goal: enough evidence to pick the smallest fix for X
skill_source: project-inventory + ask-matt
Proceed? (y/n)
```

User: `y` → spawn `research` → wait → ingest `STATUS.md` + reports.

```text
ORCH (cycle 1):
- worker: research | skill: research | status: done
- evidence: report at .../findings.md; 3 sources
- quality_gate: pass
- gaps: no code change yet; fix shape clear = patch foo.ts guard
- recommendation: next_skill=implement (verified on disk)
NEXT PLAN (cycle 2):
- skill: implement | path: .agents/skills/implement/SKILL.md | mode: AFK | worker: implement
- match: build from ticket/findings — project implement skill
- inputs:
  - .scratch/orchestrator/.../research/findings.md
  - path: src/foo.ts
- why: research closed the design; implement the one guard
Proceed? (y/n)
```

User: `y` → new worker `implement` → …

### Cycle 2 end

```text
ORCH (cycle 2): … quality_gate: pass
FINISH:
- artifacts: ...
Accept finish? (y/n)
```

## Parallelism

Default: **one AFK worker per cycle** (matches approve loop).

Parallel only when:

- No data edge between jobs, and
- PLAN lists both jobs in **one** approval, and
- After **all** parallel workers stop, you ingest **each**, then one combined ORCH + NEXT PLAN.

## Auto-run exception

If user says up front: `auto-run all cycles` / `just run it` / `no confirm`:

- Still do full ingest + evaluate + ORCH log every cycle
- Still write NEXT PLAN into `ORCH-LOG.md`
- May dispatch without waiting **until** blocked/failed/FINISH
- On blocked/failed/quality fail → stop and ask user
