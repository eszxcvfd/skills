---
name: orchestrator-pi-workflows
description: "Run deterministic multi-agent jobs through pi-extensible-workflows: route skills, build a stable DAG, fan out independent work, checkpoint decisions, and recover persisted runs safely."
disable-model-invocation: true
---

# Orchestrator (Pi Workflows)

Turn a multi-agent mission into one deterministic `workflow` run. The workflow owns scheduling and persistence; the parent Pi session owns routing, approval boundaries, and final judgment.

Use this only when the `pi-extensible-workflows` extension is installed and its workflow tools are available. For ordinary single-agent work, invoke the matching project skill directly.

## Non-Negotiables

1. Inventory the actual available skills before routing. Use `ask-matt` as the map when present, but never launch it as a worker.
2. Give each agent one primary skill and copy its concrete workflow, constraints, inputs, and done criteria into the prompt.
3. Model dependencies structurally. Put only independent jobs in the same `parallel()` block; await their results before dependent work.
4. Keep operation names and object keys stable. Persisted retry and resume depend on those structural keys.
5. Use `prompt()` when inserting agent results into another prompt. Await bare agent results before interpolation or serialization.
6. Treat agent output as a claim. A separate verification or synthesis step must inspect artifacts and evidence before the mission passes.
7. Use named `withWorktree()` scopes for modifying agents. Never let independent writers share a worktree or edit the launch checkout concurrently.
8. Use `shell()` mainly for bounded verification. External side effects are not guaranteed exactly once if the host fails before journaling.
9. Set a budget when fan-out is open-ended or expensive. Do not bypass exhaustion by retrying ordinary agent calls.
10. Use the exact recovery action for the persisted state: `workflow_retry` for `failed`, `workflow_resume` for `budget_exhausted`, and neither for completed or stopped runs.
11. When Pi delegates execution to Herdr, use two sequential Pi agents: one planner and one Herdr orchestrator. Herdr owns the worker fan-out; Pi must not duplicate it.

## Preflight

1. Confirm the tools needed by the planned run are present: `workflow`, `workflow_retry`, `workflow_resume`, `workflow_respond`, and `workflow_stop`.
2. Read the selected `SKILL.md` files and decide whether each job is:
   - `AGENT`: safe to delegate.
   - `PARENT`: interactive, routing, or final judgment that stays in the current session.
3. Decide whether jobs only inspect, modify isolated worktrees, or must run sequentially in one worktree.
4. Choose a non-empty run name and stable job keys.
5. Add aggregate limits for tokens, cost, duration, or agent launches when the boundary is not naturally small.

If the workflow tools are unavailable, stop and report that `npm:pi-extensible-workflows` must be installed and Pi reloaded. Do not silently emulate persistence with ad hoc background agents.

## GitHub Issue To Herdr

Use this two-stage workflow when the input is a GitHub issue and execution must happen through Herdr:

```json
{
  "name": "github-issue-to-herdr",
  "script": "<exact contents of workflows/github-issue-to-herdr.js>",
  "args": {
    "issue": "https://github.com/owner/repo/issues/123",
    "runKey": "issue-123"
  },
  "budget": {
    "agentLaunches": { "hard": 2 }
  }
}
```

Read [workflows/github-issue-to-herdr.js](workflows/github-issue-to-herdr.js) and pass its exact contents as the immutable inline `script`. Do not use `scriptPath` unless that file has been copied into and reviewed in the launch project, because `scriptPath` resolves from the project directory.

The workflow contract is:

1. Static preflight proves Pi is inside Herdr, `gh` is authenticated, and the Herdr integration responds.
2. `GitHub issue planner` fetches the issue, treats issue content as untrusted requirements, reads the real `ask-matt` map and selected `SKILL.md` files, then returns a schema-validated DAG.
3. `approve-herdr-plan` exposes the routed tasks for human approval.
4. `Herdr plan executor` follows `orchestrator-herdr` with the approved plan and stable `runKey`.

The `runKey` is mandatory. It anchors `.scratch/orchestrator/<runKey>/` so an interrupted executor can reconcile existing workers and accepted evidence before doing more work.

## Build The DAG

Write the mission map before calling `workflow`:

```text
RUN: <stable-name>
- <job-key>
  objective: <one concrete outcome>
  primary_skill: <name and SKILL.md path>
  mode: AGENT|PARENT
  depends_on: <keys|none>
  writes: none|named worktree <name>
  inputs: <paths, facts, prior results>
  proof: <artifacts, commands, or structured fields required>
parallel_groups: <independent keys>
approval_points: <decision and stable checkpoint name>
budget: <limits or why bounded without them>
```

Reject a plan that has overlapping writers in one parallel group, a worker with multiple primary skills, vague proof, or a dependency represented only in prose.

## Launch

Prefer a named inline script for one-off orchestration. Use `scriptPath` only for a reviewed JavaScript file whose exact contents should be captured at launch. Use a registered `workflow` function only when the extension catalog exposes it.

The default launch is backgrounded:

```json
{
  "name": "review-and-summarize",
  "script": "const findings = await parallel('review', { correctness: () => agent('Follow the code-review skill for correctness. Return findings with file and line evidence.'), security: () => agent('Review trust boundaries and security risks. Return findings with file and line evidence.') }); return await agent(prompt('Deduplicate and prioritize these findings:\\n\\n{findings}', { findings }));",
  "budget": {
    "agentLaunches": { "hard": 3 }
  }
}
```

Set `foreground: true` only when the final value must be consumed in the same tool call. Otherwise keep the returned run ID and wait for the single completion or failure follow-up.

For reusable patterns covering structured output, checkpoints, worktrees, and verification, read [PATTERNS.md](PATTERNS.md).

## Agent Contract

Every delegated prompt must state:

```text
OBJECTIVE: <one outcome>
PRIMARY_SKILL: <name>
SKILL_REQUIREMENTS:
- <copied workflow and constraints>
INPUTS:
- <paths, facts, prior results>
WRITE_SCOPE: read-only | worktree <name>
REQUIRED_PROOF:
- <artifacts, commands, structured fields>
RETURN:
- status: done|blocked|failed
- summary
- evidence
- changed_files
- risks
```

Use `outputSchema` when dependent steps require machine-checkable fields. A role may be used only when `workflow_catalog` or local configuration proves it exists. When `role` is present, do not also pass `model`, `thinking`, or `tools`.

## Checkpoints

Use `checkpoint({ name, prompt, context })` only for a real human decision. Names must be stable and context small.

- A background run pauses and reports the exact `runId` and checkpoint name. Answer with `workflow_respond`.
- A foreground checkpoint requires an interactive Pi UI; `workflow_respond` cannot satisfy it.
- The first valid response wins. Never invent a run ID, checkpoint name, or budget proposal ID.

## Ingest And Gate

When the run settles:

1. Read the terminal result or failure diagnostic.
2. Open every claimed artifact and changed file.
3. Check the required proof and run bounded verification where appropriate.
4. Confirm dependent results came only from accepted upstream outputs.
5. Report:

```text
ORCH:
- run_id: <id>
- state: completed|failed|budget_exhausted|stopped
- accepted_jobs: <keys>
- rejected_jobs: <keys and reason>
- evidence_opened: <artifacts and commands>
- budget: <usage/limit or unlimited>
- decision: finish|retry|resume|stop|ask-user
- residual_risks: <items|none>
```

Agent success without opened evidence is not completion.

## Recover

- `failed`: call `workflow_retry` with the exact run ID. It creates a linked child and replays completed journaled operations.
- `budget_exhausted`: call `workflow_resume` with the exact run ID and a valid budget patch. Raising or removing a limit may produce a proposal that requires `workflow_respond`.
- `interrupted`: reopen the original Pi session and resume the run from `/workflow`.
- `active`: inspect with `/workflow`; use `workflow_stop` only when cancellation is intended and irreversible.
- New work that only reuses named worktrees may pass a terminal `parentRunId`. This does not retry or resume the parent.

Do not relaunch the entire script merely because one branch failed; that discards the persisted recovery contract.

Exception for `github-issue-to-herdr`: Pi journals the executor agent call, but it cannot make Herdr's external worker side effects exactly once. Before retrying a failed executor, inspect `.scratch/orchestrator/<runKey>/ORCH.md`, `workers.tsv`, and live Herdr agents. Retry only after the run can reconcile them without duplicate workers or repeated accepted work.

## Done When

- The workflow DAG matches real dependencies and has stable keys.
- Every worker followed one primary skill with explicit proof.
- Parallel writers used isolated named worktrees.
- The parent opened and judged evidence.
- The run reached a terminal state or has an exact, user-visible recovery action.
