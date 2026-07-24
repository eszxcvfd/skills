# Process and Proof Policy

This file answers: **what evidence is required before an agent may claim work is done?**

Use the lightest proof that matches the risk. Never claim "done", "fixed", "working", or "faster" without the matching proof below. If proof is missing, say **unverified** and name what remains.

## Before implementation

The agent must:

1. Read `ARCHITECTURE.md`, relevant ADRs, and decision locks.
2. Read `RUNTIME_CONSTITUTION.md` and list affected invariants.
3. Inspect existing tests at the intended seam.
4. Create or update `ACTIVE_EXECUTION_PLAN.md` with objective, scope, affected invariants, planned files, steps, and verification commands.
5. State assumptions before editing production code.

## Required proof by change type

| Change type | Minimum proof |
| --- | --- |
| UI text or styling | Build, screenshot, or visual check appropriate to the repo |
| UI component behavior | Component test, browser check, or screenshot evidence |
| Business rule | Unit test at a public seam |
| API contract | Integration or contract test |
| Database schema or migration | Forward migration test plus rollback/recovery procedure and data compatibility assessment |
| Background job / worker | Integration test for success, retry/failure, and idempotency where applicable |
| Runtime invariant change | Test or monitoring evidence named by `RUNTIME_CONSTITUTION.md` |
| Bug fix | Failing regression test or reproduction before the fix, passing after the fix |
| Race/concurrency fix | Concurrency test, stress reproduction, or documented deterministic harness |
| Performance claim | Reproducible benchmark with baseline, comparison, dataset size, and environment |
| Refactor with no behavior change | Existing relevant tests plus explanation of preserved public seams |

## Completion gate

Before declaring done, the agent must record:

- changed files;
- verification commands actually run;
- command outcomes;
- unrun required checks and why;
- any failing checks, with whether they are pre-existing or caused by this change;
- remaining unverified claims.

A task is not complete while required proof is missing. It may be handed off as blocked or partially verified, but not called done.
