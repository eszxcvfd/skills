# Routing map (ask-matt aligned)

**Always prefer** re-reading the project's `skills/engineering/ask-matt/SKILL.md`
when present — this file is the fallback and a quick index.

Buckets under project root:

- Promoted (routine dispatch): `skills/engineering/`, `skills/productivity/`
- Not routine: `misc/`, `personal/`, `in-progress/`, `deprecated/`

If ask-matt is missing: list `**/SKILL.md` under engineering + productivity;
route from name + frontmatter `description`.

## Main flow — idea → ship

| Situation | Skill | Mode | Worker hint |
|-----------|--------|------|-------------|
| Sharpen idea in a codebase | `grill-with-docs` | HITL | `grill` |
| No codebase, pure plan grill | `grill-me` | HITL | `grill` |
| Design needs runnable answer | `prototype` | AFK | `proto` |
| Thread → published spec | `to-spec` | AFK if grilled | `spec` |
| Spec/plan → tracer tickets | `to-tickets` | AFK if spec exists | `tickets` |
| Build one ticket/spec | `implement` | AFK (tdd+review inside) | `impl` |
| Single behaviour test-first | `tdd` | AFK | `tdd` |
| Review diff vs fixed point | `code-review` | AFK | `review` |

Context hygiene: keep grill → to-spec → to-tickets in **one** orchestrator
thread when possible. Each `implement` = fresh worker + ticket/spec in INPUTS.

## On-ramps

| Situation | Skill | Mode |
|-----------|--------|------|
| Inbox bugs/requests | `triage` | HITL-heavy |
| Hard / flaky bug | `diagnosing-bugs` | AFK |
| Huge foggy multi-session effort | `wayfinder` | You chart; AFK `research` per research ticket |

## Codebase health / vocabulary

| Situation | Skill | Mode |
|-----------|--------|------|
| Deepening opportunities | `improve-codebase-architecture` | HITL pick |
| Deep-module shape | `codebase-design` | with design work |
| Domain terms / ADR | `domain-modeling` | often with grill |

## Crossing sessions / standalone

| Situation | Skill | Mode |
|-----------|--------|------|
| Compact for another session | `handoff` | you write |
| Primary-source investigation | `research` | **always** AFK |
| Merge/rebase conflicts | `resolving-merge-conflicts` | AFK |
| First-time repo config | `setup-matt-pocock-skills` | HITL once |
| “Which skill?” | `ask-matt` | **you only** — never spawn |

## Parallel recipes

- **`code-review`**: one worker (skill parallelizes axes). Split panes only if user wants.
- **`wayfinder` research tickets**: one `research` worker per independent ticket.
- **Independent tickets**: one `implement` per ticket with blockers done.
- **`research` + planning**: research AFK while you HITL-grill with the user.

## Mode rules

**HITL** — user must answer in-band: grill*, triage questions, wayfinder HITL
tickets, teach, setup, ask-matt.

**AFK** — safe background: research, implement, tdd, code-review, diagnosing-bugs,
prototype, resolving-merge-conflicts, to-spec/to-tickets when inputs are complete
files (no open interview).
