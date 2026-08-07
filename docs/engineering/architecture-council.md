## What it does

`architecture-council` is a pre-code gate for decisions that change system
shape or leave no safe next step. It keeps the useful part of a design review:
two independent proposers, a hostile challenge, evidence classification, and
a durable verdict. The defining constraint is that reduced and full mode keep
the same two-proposer breadth; only the runtime isolation changes.

## When to reach for it

Type `/architecture-council`, or let the agent reach for it when a change
touches data ownership, auth, module/service boundaries, public contracts,
infrastructure, deployment, migrations, or another hard-to-reverse decision.
Use [codebase-design](https://aihero.dev/skills-codebase-design) for a seam or
deep-module design question that is not yet an architecture decision.

## The lean Council

The Lead frames the case, then starts `proposer-a` and `proposer-b` without
letting either see the other's work. A fresh challenger breaks both proposals;
a verifier marks load-bearing claims `Verified`, `Likely`, `Unverified`, or
`Contradicted`; a judge writes the verdict. Reduced mode uses independent
peer/delegated workers. Full or high-risk mode uses separate Paseo root agents.

The Council writes its case, proposals, challenge, verification, and verdict
under `.scratch/architecture-council/<decision-slug>/`. Accepted decisions
become an ADR with guardrails, migration or rollback, and reopen conditions.

## Where it fits

Use it before [to-spec](https://aihero.dev/skills-to-spec) or
[implement](https://aihero.dev/skills-implement) when the work contains a
structural decision. It can follow
[improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture)
when a deepening candidate exposes a new boundary. The
[ask-matt router](https://aihero.dev/skills-ask-matt) maps it with the rest of
the engineering set.
