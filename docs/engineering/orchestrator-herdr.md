Quickstart:

```bash
npx skills add eszxcvfd/skills --skill=orchestrator-herdr
```

```bash
npx skills update orchestrator-herdr
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/orchestrator-herdr)

## What it does

`orchestrator-herdr` turns the current coding agent into mission control for Herdr. It decomposes a user goal into a dependency graph, asks you to approve the PLAN, then spawns or reuses OMP workers in sibling panes.

Its defining constraint is evidence-before-motion: every worker gets exactly one project skill with copied `SKILL.md` requirements, and the orchestrator must ingest transcript, `STATUS.md`, artifacts, and quality-gate evidence before it can dispatch the next step.

## When to reach for it

- **Invocation mode.** You invoke this by typing `/orchestrator-herdr` inside Herdr; the agent will not reach for it on its own.
- **Trigger boundary.** Reach for it when one goal should be split across multiple skill-bounded agents, especially when independent research, implementation, review, or diagnosis can run in parallel. For single-pane work, use [ask-matt](https://aihero.dev/skills-ask-matt) and the normal flow skills directly.

## Prerequisites

You need Herdr running with `HERDR_ENV=1`, the Herdr integration working, and an `omp` worker command available. The skill writes orchestration artifacts under `.scratch/orchestrator/<run-id>/`.

## Flow

```text
mission → DAG PLAN (y/n) → Herdr workers → ingest each stop → ORCH decision → NEXT PLAN or FINISH (y/n)
```

Workers are not autonomous free agents. Each one receives a prompt containing one primary skill, concrete inputs, a dedicated artifact directory, a required `STATUS.md` schema, and a 60-minute timebox. The orchestrator fires one Herdr alert when a worker stops or times out, then decides whether outputs are accepted, retried, reworked, blocked, or turned into a new approved plan.

## It's working if

- You see a PLAN that names jobs, skills, dependencies, workers, and an approval boundary.
- Worker prompts quote real requirements from the chosen skill's `SKILL.md`.
- Every idle worker is followed by transcript + `STATUS.md` + artifact inspection before the next dispatch.
- The final answer lists accepted jobs, opened artifacts, verification, risks, and closed run-owned panes.

## Where it fits

This is a crossing-session orchestration skill for the engineering flow: it sits above [research](https://aihero.dev/skills-research), [implement](https://aihero.dev/skills-implement), [tdd](https://aihero.dev/skills-tdd), [code-review](https://aihero.dev/skills-code-review), and [diagnosing-bugs](https://aihero.dev/skills-diagnosing-bugs) when the work benefits from multiple Herdr panes. The map remains [ask-matt](https://aihero.dev/skills-ask-matt).
