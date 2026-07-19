Quickstart:

```bash
npx skills add eszxcvfd/skills --skill=orchestrator-herdr
```

```bash
npx skills update orchestrator-herdr
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/orchestrator-herdr)

## What it does

`orchestrator-herdr` turns the coding agent already running in a Herdr pane into a **router and cycle controller**: plan → your approval → OpenCode subagent → ingest results → evaluate → next plan → your approval again. Workers run one PRIMARY skill each and write artifacts only under `.scratch/orchestrator/`. The skill never auto-chains the next job without a new approval (unless you explicitly set auto-run).

## When to reach for it

You invoke this by typing `/orchestrator-herdr` — the agent won't reach for it on its own.

Reach for it when you are **inside Herdr** and want multi-agent skill-driven work with a clear human gate every cycle. For a single-session idea→ship path without panes, stay on the main flow via [ask-matt](https://aihero.dev/skills-ask-matt). For a plain context bridge without Herdr, use [handoff](https://aihero.dev/skills-handoff).

## Prerequisites

- [Herdr](https://herdr.dev) with `HERDR_ENV=1` in the orchestrator pane.
- Worker binary available as `opencode` (default).
- Project skills installed (this set via `npx skills add eszxcvfd/skills` or a linked clone).

## The cycle

```text
PLAN → approve → dispatch subagent → supervise → ingest STATUS/artifacts
  → evaluate → NEXT PLAN or FINISH → approve → loop
```

Nothing AFK starts until you approve the PLAN. Each PLAN / NEXT PLAN must **pick a real skill installed in the project** (inventory + `ask-matt` / routing, verified `SKILL.md` path, plus a one-line `match:`). After the worker stops, the orchestrator must re-read the transcript, open every artifact, quality-gate, then show ORCH + NEXT PLAN and wait again. Command cookbook and anti-patterns live in the skill’s `SKILL.md` and `WORKFLOW.md`.

## It's working if

- A PLAN block appears and waits for yes before AFK spawns.
- Workers start with `--no-focus`; prompts go through `herdr pane run`.
- After each worker stop, you see an ORCH evaluation grounded in opened files — not only “agent done”.
- A NEXT PLAN (or FINISH) waits for yes before the next spawn.
- Each job has parseable `STATUS.md`; artifacts stay under `.scratch/orchestrator/`.

## Where it fits

A reach-for-it-anytime **standalone** for multi-pane Herdr runs — it **dispatches** skills like `/research`, `/implement`, and `/tdd` as workers while you keep HITL steps in the orchestrator pane. Neighbour: [handoff](https://aihero.dev/skills-handoff). Map: [ask-matt](https://aihero.dev/skills-ask-matt).
