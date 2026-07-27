Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=architecture-council
```

```bash
npx skills@latest update architecture-council
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/architecture-council)

## What it does

`architecture-council` is a decision gate for hard-to-reverse architecture choices. It convenes independent proposals, a challenger, a verifier, and a judge before implementation continues.

It is about lock-in, not debate theater. The Council prefers boring, standard, reversible architecture, then records the decision as an ADR with guardrails, migration or rollback notes, lock level, and reopen conditions so future agents know what they may not silently break. When the verdict changes the system map, runtime invariants, or required evidence, it syncs `ARCHITECTURE.md`, `RUNTIME_CONSTITUTION.md`, and `PROCESS_AND_PROOF_POLICY.md` too.

## When to reach for it

Type `/architecture-council`, or the agent reaches for it automatically when a task fits.

Reach for it before decisions such as database or schema changes, tenancy or auth models, service decomposition, module boundaries, public API contracts, framework or state-management choices, queues, retries, storage abstractions, deployment topology, or a second workaround around the same architectural friction. Do not use it for visual UI cooking; layout, styling, animation, and copy can move fast unless they change the app's structure.

## Prerequisites

The skill writes durable records when a decision is accepted: an ADR in the repo's ADR directory, and a decision-lock registry such as `docs/architecture/decision-locks.yaml` if the repo does not already have one.

## The Council gate

The skill starts with a risk score: irreversibility, blast radius, operational impact, data migration risk, and novelty. A score of six or more runs the full Council. Some decisions always count as Council-worthy: database, tenancy, auth architecture, service decomposition, public contract, event schema, and deployment topology.

The key split is expression versus structure. Frontend visuals get high autonomy; frontend architecture, backend domain design, and data architecture get progressively less. AI can cook the dashboard, but adding global state or changing an API contract goes through the gate.

## The artifact is the architecture

The most important output is the ADR plus the control-doc sync. The ADR preserves context, considered alternatives, evidence, trade-offs, guardrails, rejected options, reopen conditions, and migration or rollback strategy. `ARCHITECTURE.md` gets the owner map and routing rule, `RUNTIME_CONSTITUTION.md` gets any new invariant, and `PROCESS_AND_PROOF_POLICY.md` gets any new proof requirement. The decision-lock registry then marks the choice as `soft`, `guarded`, or `locked`, turning architecture from an assumption into an explicit rule future agents must read.

## It's working if

- Implementation pauses before a lock-in seam rather than after code has already committed to it.
- At least two independent options were considered before everyone saw the same answer.
- Claims are marked `Verified`, `Likely`, `Unverified`, or `Contradicted` instead of voted on by taste.
- The final ADR says not only what won, but what is forbidden and when to reopen it.
- Root control docs are updated, or proposed updates stay in scratch while user approval is pending.

## Where it fits

`architecture-council` is a **reach-for-it-anytime decision gate**. It sits before [to-spec](https://aihero.dev/skills-to-spec) or [implement](https://aihero.dev/skills-implement) when a feature would otherwise smuggle in architecture, and after [improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture) when a health check finds a candidate that may contradict or reopen an ADR. It uses the vocabulary of [codebase-design](https://aihero.dev/skills-codebase-design), and the map remains [ask-matt](https://aihero.dev/skills-ask-matt).
