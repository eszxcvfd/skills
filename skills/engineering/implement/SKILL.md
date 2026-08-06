---
name: implement
description: "Implement a spec or ticket with an active execution plan, TDD, proof policy, review, and commit."
disable-model-invocation: true
---

# Implement

Implement the work described by the user in the spec or tickets. This is execution, not architecture drift: read the control docs first, write the active plan, prove each claim, then commit.

Apply the red-green-refactor loop at pre-agreed seams. Use the promoted `/tdd`
skill when the task is explicitly test-first; implementation keeps the same
discipline inline for every proof-sized slice.

## Process

### 1. Control-doc preflight

Before editing production code, read what exists:

- `ARCHITECTURE.md` — owner map, routing, allowed dependencies, and code placement rules.
- `RUNTIME_CONSTITUTION.md` — runtime invariants that the change may touch.
- `PROCESS_AND_PROOF_POLICY.md` — proof required for the change type.
- `ACTIVE_EXECUTION_PLAN.md` — if present, resume from it instead of inventing a new plan.
- `CONTEXT.md`, `CONTEXT-MAP.md`, relevant ADRs, and architecture decision locks.
- The spec or ticket being implemented.

If a control doc is missing, proceed with the best available evidence and note the gap in the plan. Do not silently make a structural decision that the missing doc should have governed.

If the work would change module ownership, dependency direction, request/event flow, data ownership, public contracts, infrastructure, or another hard-to-reverse choice, stop and run `/architecture-council` before coding.

### 2. Create or update `ACTIVE_EXECUTION_PLAN.md`

Write a root `ACTIVE_EXECUTION_PLAN.md` before production edits. Keep it short and live. It must include:

- objective;
- included and excluded scope;
- architecture placement from `ARCHITECTURE.md`;
- affected runtime invariants from `RUNTIME_CONSTITUTION.md`;
- planned files or areas;
- steps with checkboxes;
- assumptions, risks, or blockers;
- verification commands required by `PROCESS_AND_PROOF_POLICY.md`.

Update the plan whenever scope, findings, risks, files, or verification commands change. This is the handoff record if context is compacted or another agent continues.

### 3. Build in proof-sized slices

Apply the red-green-refactor loop at the pre-agreed seams. For each slice:

1. Mark the current step in `ACTIVE_EXECUTION_PLAN.md`.
2. Write or identify the proof first when the policy requires it.
3. Make the smallest production change that can satisfy that proof.
4. Run the targeted verification.
5. Record command and outcome in the plan's proof log.

Run typechecking regularly, single test files regularly, and the full test suite once at the end unless the policy says a narrower proof is enough or the repo cannot run the full suite. If you skip a required check, record why and call the result unverified.

### 4. Final proof gate

Before saying the work is done, compare the actual evidence against `PROCESS_AND_PROOF_POLICY.md` and the affected invariants.

The final summary must include:

- changed files;
- affected architecture rules and runtime invariants;
- verification commands actually run with outcomes;
- required checks not run and why;
- remaining unverified claims, if any.

Do not claim done while required proof is missing. Say `blocked`, `partial`, or `unverified` instead.

### 5. Review, plan cleanup, commit

Once proof is complete, use `/code-review` to review the work.

After review passes, archive or delete `ACTIVE_EXECUTION_PLAN.md` so future agents do not treat stale work as active. Default archive path:

```text
.scratch/execution-plans/<YYYYMMDD-HHMMSS>-<slug>.md
```

Then commit your work to the current branch.
