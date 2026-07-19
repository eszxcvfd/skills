Quickstart:

```bash
npx skills add eszxcvfd/skills --skill=orchestrator-herdr
```

```bash
npx skills update orchestrator-herdr
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/orchestrator-herdr)

## What it does

`orchestrator-herdr` turns the coding agent already running in a Herdr pane into a **router and dispatcher**: it maps intent onto project skills, confirms a PLAN with you, then spawns **OpenCode workers** in sibling panes and collects their STATUS files. The defining constraint is that **you stay the orchestrator** — workers run one PRIMARY skill each and write artifacts only under `.scratch/orchestrator/`; the skill never hands control to a separate pi role.

## When to reach for it

You invoke this by typing `/orchestrator-herdr` — the agent won't reach for it on its own.

Reach for it when you are **inside Herdr** and want multi-agent skill-driven work: several AFK jobs, blocked-handler for permission UIs, STATUS chaining. For a single-session idea→ship path without panes, stay on the main flow via [ask-matt](https://aihero.dev/skills-ask-matt). For a plain context bridge without Herdr, use [handoff](https://aihero.dev/skills-handoff).

## Prerequisites

- [Herdr](https://herdr.dev) with `HERDR_ENV=1` in the orchestrator pane.
- Worker binary available as `opencode` (default).
- Project skills installed (this set via `npx skills add eszxcvfd/skills` or a linked clone).

## Plan, spawn, STATUS

The leading loop is **plan-confirm → spawn → STATUS**. Nothing AFK starts until you approve the PLAN (unless you already said to skip). Each worker gets one skill, writes `STATUS.md` under `.scratch/orchestrator/<run-id>/<worker>/`, and does not chain further skills — the orchestrator enqueues the next job from `NEXT_SKILL` and `ARTIFACTS`.

## It's working if

- A PLAN block appears and waits for yes before AFK spawns.
- Workers start with `--no-focus`; prompts go through `herdr pane run`.
- Each finished job has a parseable `STATUS.md` with `STATUS: done|blocked|failed`.
- Artifacts never land in `/tmp` or outside the project.

## Where it fits

A reach-for-it-anytime **standalone** for multi-pane Herdr runs — it sits beside the main flow rather than replacing it, and **dispatches** skills like `/research`, `/implement`, and `/tdd` as workers while you keep HITL steps (`/grill-with-docs`, `/ask-matt`) in the orchestrator pane. Neighbour: [handoff](https://aihero.dev/skills-handoff) for session bridges without Herdr. For the whole map, see [ask-matt](https://aihero.dev/skills-ask-matt).
