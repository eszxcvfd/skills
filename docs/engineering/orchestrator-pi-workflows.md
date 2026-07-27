Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=orchestrator-pi-workflows
```

```bash
npx skills@latest update orchestrator-pi-workflows
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/orchestrator-pi-workflows)

## What it does

`orchestrator-pi-workflows` turns a multi-agent mission into a deterministic, persisted Pi workflow: independent jobs fan out, dependencies wait for accepted inputs, human decisions become checkpoints, and failed or exhausted runs recover from their journal. Its GitHub-to-Herdr route uses one agent to turn an issue into a skill-routed plan and a second agent to execute the approved plan through Herdr.

Its defining constraint is structural determinism. Parallelism, dependencies, worktree isolation, and recovery are expressed in the workflow itself rather than coordinated through improvised background prompts.

## When to reach for it

You invoke this by typing `/orchestrator-pi-workflows` — the agent won't reach for it on its own. Use it when a task benefits from parallel specialists, durable checkpoints, aggregate budgets, isolated worktrees, or retry without rerunning completed work.

For visible pane-by-pane control inside Herdr, use [orchestrator-herdr](https://aihero.dev/skills-orchestrator-herdr) instead. For one well-scoped task, invoke the matching engineering skill directly.

## Prerequisites

Install `pi-extensible-workflows` in Pi:

```bash
pi install npm:pi-extensible-workflows
```

Reload Pi after installation. The workflow agents must also be able to discover any skill named in their prompts.

The GitHub-to-Herdr route additionally requires Pi to run inside Herdr with `HERDR_ENV=1`, an authenticated `gh` CLI, and a stable run key such as `issue-123`.

## The durable DAG

The leading idea is a **durable DAG**: every job has a stable key, concrete inputs, one primary skill, explicit proof, and declared dependencies. Independent readers can share a `parallel` group. Independent writers get separate named worktrees. Dependent work awaits accepted upstream results.

That structure is also the recovery address. A failed run can replay completed journal entries and execute only incomplete paths; a budget-exhausted run can resume with retained usage and an approved budget change.

## Evidence before completion

The workflow scheduler proves that operations settled, not that their claims are correct. The parent session still opens artifacts, checks verification output, rejects unsupported claims, and records the exact recovery action when the run does not finish cleanly.

## Issue to Herdr

The planning agent fetches the GitHub issue, reads the real `ask-matt` map, opens each selected skill, and returns a bounded DAG where every task names the problem it solves, one skill, dependencies, inputs, and proof. A checkpoint makes that exact plan the approval boundary.

Only then does the executor agent follow `orchestrator-herdr`. Pi runs the planner and executor sequentially; Herdr performs the task fan-out. A stable run key lets the executor reconcile its ledger and live workers after interruption, but Herdr side effects are external to Pi's journal, so executor retries must always be inspected rather than automatic.

## It's working if

- Independent work runs concurrently without overlapping write scopes.
- Dependent prompts receive awaited, accepted results rather than prose references to unfinished jobs.
- Human decisions pause at named checkpoints.
- A failed or exhausted run reports an exact run ID and state-specific recovery action.
- Final status names the evidence that was actually opened.

## Where it fits

This is a reach-for-it-anytime orchestration layer around the existing engineering skills. It complements [orchestrator-herdr](https://aihero.dev/skills-orchestrator-herdr): Pi Workflows prioritizes persistence and deterministic replay, while Herdr prioritizes visible pane control. See [ask-matt](https://aihero.dev/skills-ask-matt) for the map of the full skill set.
