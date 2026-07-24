# Runtime Constitution

This file answers: **when the system is running for real, what must never be violated?**

Each invariant must be concrete, testable, and paired with tests or monitoring when work touches it. Avoid vague words like "fast", "stable", or "optimized" unless they include a measurable threshold.

## RC-01: Idempotent side effects

Processing the same command, event, job, webhook, or source item more than once must not create duplicate user-visible side effects.

Proof when touched:

- a test or reproduction showing duplicate delivery/retry/replay is safe.

## RC-02: No silent job loss

Every accepted background job must end in exactly one observable state:

- completed;
- retryable failure;
- dead letter / terminal failure.

A job must never disappear without a terminal record.

Proof when touched:

- integration test or operational evidence for success, retry, and terminal failure paths.

## RC-03: Bounded external calls

Every network call must define:

- timeout;
- retry limit;
- backoff strategy;
- failure classification.

Proof when touched:

- unit/integration test or configuration evidence showing the bounds.

## RC-04: Single ownership

Only the owning module named in `ARCHITECTURE.md` may modify canonical state for that module's data.

Proof when touched:

- code path or test evidence showing writes go through the owning module's public contract.

## Add project-specific invariants below

### RC-05: <Invariant name>

<Concrete invariant.>

Proof when touched:

- <minimum proof>
