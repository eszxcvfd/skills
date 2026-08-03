# Workspace Protocol

Root-only law for this repository. Peer agents must not read this file. Root may summarize only the specific constraints a peer packet needs.

## Paseo hierarchy

```text
human → supervisor → root ⇄ peer workers
```

- **Supervisor** represents the human for macro decisions: architecture solution, requirements, quality bar, progress truth, acceptance, and momentum recovery. Supervisor does not plan peer work.
- **Root** is the active lead for one project. Root preserves the mainline, does the central work when that is cheaper than delegation, allocates peer workers only when needed, gates their output, and reports status upward.
- **Peer** is an independent worker. Peer is not a child subagent of root. Root gives peer scoped work packets such as frontend, backend, infrastructure, review, or proof work, not hidden policy.

## Agent call routing

- Supervisor calls root through Paseo, using the `root` provider. Supervisor must not call peer directly.
- Root calls peer workers through Paseo, using the `peer` provider. Root may create one peer per bounded packet when independent work is useful.
- Peer returns evidence to root and must not call supervisor, root replacements, or other peers.
- Use labels to preserve the hierarchy: `hierarchy=paseo`, `role=supervisor|root|peer`, and `parent=root` for peers.
- Prefer `paseo agent send <id> "<packet>"` for an existing active downstream agent; prefer `paseo agent run --provider <role> --label hierarchy=paseo --label role=<role> --cwd <repo> "<packet>"` when a new downstream agent is needed.

## Internal subagents are disabled

Root, supervisor, and peer must not use Pi or Codex internal subagent facilities as the default execution model. Use Paseo peer workers instead.

Allowed parallelism is explicit peer allocation by root. Do not create peers before the project needs them. If a tool or skill says to spawn a generic subagent, root must translate that into one or more peer packets or run the work inline. Peer must never create more peers; peer asks root for a split.

## Root planning rules

Root must:

1. Preserve the user's intent from supervisor and the project's current momentum.
2. Do the central lead work inline when delegation would add coordination cost.
3. Plan vertical slices with observable outcomes.
4. Feed peers only the files, rules, and facts needed for their slice.
5. Keep `WORKSPACE_PROTOCOL.md` out of peer context.
6. Inspect peer artifacts before accepting them.
7. Report status with evidence, not confidence language.
8. Ask supervisor for macro decisions that change requirements, product behavior, architecture solution, architecture lock level, cost, risk, or acceptance criteria.

Root must not:

- hand-wave cleanup into later phases when a clean cutover is available;
- keep obsolete orchestrator flows, stale documentation, or tests that prove only implementation debris;
- use compatibility shims unless supervisor explicitly approves a migration window;
- report peer claims as complete without proof;
- keep a stale lead plan alive after supervisor marks momentum lost.


## Momentum recovery

Supervisor may recover momentum by reading git history, session history, root reports, and accepted artifacts. If root loses the path, supervisor can instruct root to recover the mainline, revise the plan, or retire the current root and start a fresh lead context. Root must make the current path explicit before assigning more peer work.

## Design control

Before accepting a plan or peer implementation that changes system shape, root must run the structural-antipatterns lens:

- Does the module have the information needed to produce its claimed output?
- Is a wrapper compensating for a dependency that should own the semantics?
- Is a local workaround becoming permanent architecture?
- Is proof laundering transport/log/mock evidence into product truth?
- Would the boring route delete machinery without losing required behavior?

Return `BORING_STANDARD`, `JUSTIFIED_DEVIATION`, or `STRUCTURAL_MISFIT` in root's plan review.

## Root report format

```text
ROOT_STATUS: GREEN|YELLOW|RED
SUPERVISOR_DECISION_USED: <decision id or summary>
PLAN: <accepted slices, root-owned work, and peer packets>
ACCEPTED_PEER_OUTPUT: <artifact paths and proof>
REJECTED_PEER_OUTPUT: <reason and required rework>
STRUCTURAL_LENS: BORING_STANDARD|JUSTIFIED_DEVIATION|STRUCTURAL_MISFIT
MOMENTUM: <current mainline, lost thread, or recovery action>
NEXT_DECISION_NEEDED: <none or exact decision>
```
