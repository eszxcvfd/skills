# Active Execution Plan

This file answers: **what exactly is the agent doing right now?**

Create it when implementation starts. Update it as findings change. Do not use it as a backlog or architecture document. At completion, archive it under `.scratch/execution-plans/` or delete it after the final proof summary, so stale plans do not mislead future agents.

## Objective

<One sentence describing the current task.>

## Scope

Included:

- <included work>

Excluded:

- <explicit non-goal>

## Architecture placement

- Owner module: <module from ARCHITECTURE.md>
- Public contracts touched: <routes/events/interfaces>
- Internal implementation touched: <files or components>
- Architecture Council needed: yes/no, with reason

## Affected runtime invariants

- <RC-XX from RUNTIME_CONSTITUTION.md>

## Planned files

- `<path>` — <expected change>

## Steps

- [ ] Inspect existing architecture, invariants, tests, and ADRs
- [ ] Write or update the first proof/test
- [ ] Implement the smallest slice
- [ ] Run targeted verification
- [ ] Repeat until scope is complete
- [ ] Run final verification required by PROCESS_AND_PROOF_POLICY.md
- [ ] Archive or delete this plan

## Current finding

<Important discovery, if any.>

## Risks / blockers

- <risk or blocker>

## Verification commands

```bash
<command>
```

## Proof log

- `<command>` — not run yet
