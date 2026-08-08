## What it does

`architecture-council` is a pre-code gate for decisions that change system
shape or leave no safe next step. It keeps the useful part of a design review:
two independent proposers followed by one bounded adjudication pass containing
the hostile challenge, evidence classification, and durable verdict. The
defining constraint is that reduced and full mode keep the same two-proposer
breadth; only the runtime isolation changes.

It starts with Work Routing and reads only the owner documents relevant to the
boundary under discussion. An accepted verdict updates the canonical owner
document when needed; it does not create a parallel control document for one
decision.

## When to reach for it

Type `/architecture-council`, or let the agent reach for it when a change
touches data ownership, auth, module/service boundaries, public contracts,
infrastructure, deployment, migrations, or another hard-to-reverse decision.
Use [codebase-design](https://aihero.dev/skills-codebase-design) for a seam or
deep-module design question that is not yet an architecture decision.

## The lean Council

The Lead frames the case, then starts `proposer-a` and `proposer-b` without
letting either see the other's work. One adjudicator then breaks both
proposals, marks load-bearing claims `Verified`, `Likely`, `Unverified`, or
`Contradicted`, and writes the verdict. Reduced mode uses three
peer/delegated workers. Full or high-risk mode uses three configured Paseo root agents. This keeps the adversarial checks while removing two agent launches and
their duplicated context handoffs.

The Council writes its case, two proposals, and a verdict containing the
challenge and evidence statuses under
`.scratch/architecture-council/<decision-slug>/`. Accepted decisions become an
ADR with guardrails, migration or rollback, and reopen conditions.

## Where it fits

Use it before [to-spec](https://aihero.dev/skills-to-spec) or
[implement](https://aihero.dev/skills-implement) when the work contains a
structural decision. It can follow
[preserved `improve-codebase-architecture` workflow](../../skills/misc/improve-codebase-architecture/SKILL.md)
when a deepening candidate exposes a new boundary. The
[ask-matt router](https://aihero.dev/skills-ask-matt) maps it with the rest of
the engineering set.
