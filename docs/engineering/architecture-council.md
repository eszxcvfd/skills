Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=architecture-council
```

```bash
npx skills@latest update architecture-council
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/architecture-council)

## What it does

`architecture-council` is the mandatory decision gate for any architecture
choice or architecture change. It also runs whenever the agent cannot identify
a safe next step because the current system or architecture is unclear,
constrained, contradictory, or becoming a dead end.

The Council convenes independent Pi agents in Herdr for proposals, challenge,
verification, and judging before production implementation continues.

It is about lock-in, not debate theater. The Council prefers boring, standard, reversible architecture, then records the decision as an ADR with guardrails, migration or rollback notes, lock level, and reopen conditions so future agents know what they may not silently break. When the verdict changes the system map, runtime invariants, or required evidence, it syncs `ARCHITECTURE.md`, `RUNTIME_CONSTITUTION.md`, and `PROCESS_AND_PROOF_POLICY.md` too.

## When to reach for it

Type `/architecture-council`, or the agent reaches for it automatically when a
task fits.

It must run before every architecture decision, before production code that
depends on an unresolved architecture choice, and before changing the
architecture. It must also run when the agent does not know what to do next
because the present system or architecture no longer provides a clear, safe
path.

Examples include database or schema changes, tenancy or auth models, service
decomposition, module boundaries, public API contracts, framework or
state-management choices, queues, retries, storage abstractions, deployment
topology, or repeated workarounds around the same architectural friction. Pure
visual UI work remains outside the Council unless it changes structure.

## Prerequisites

Run reduced and full Councils from inside Herdr (`HERDR_ENV=1`) and make sure
`pi` is on `PATH`. The quick gate can run anywhere, but the skill stops rather
than simulating Council roles or modifying production code if Herdr or Pi is
unavailable.

The skill writes durable records when a decision is accepted: an ADR in the
repo's ADR directory, and a decision-lock registry such as
`docs/architecture/decision-locks.yaml` if the repo does not already have one.

## The Council gate

The skill starts with a risk score: irreversibility, blast radius, operational
impact, data migration risk, and novelty. A score of six or more runs the full
Council. Some decisions always require the full Council: database, tenancy,
auth architecture, service decomposition, public contract, event schema,
deployment topology, and uncertainty about the safe next step caused by the
current architecture.

Every other architecture decision still runs a reduced Council. A low score
reduces the number of Pi agents; it does not allow the architecture gate to be
skipped.

The key split is expression versus structure. Frontend visuals get high autonomy; frontend architecture, backend domain design, and data architecture get progressively less. AI can cook the dashboard, but adding global state or changing an API contract goes through the gate.

## Pi agents in Herdr

The Lead stays in the current pane. A full Council starts
`council-proposer-a`, `council-proposer-b`, and
`council-proposer-c` as separate Herdr workers running `pi`. A reduced Council
starts only `council-proposer-a`. Both modes then use dedicated
`council-challenger`, `council-verifier`, and `council-judge` Pi workers.

In a full Council, all proposer workers start before the Lead waits for any
result. Every round writes a durable artifact under
`.scratch/architecture-council/<decision-slug>/`, and the Lead validates
both the worker transcript and artifact before advancing.

There is intentionally no fallback to internal subagents, serial role-play, or
`omp`. Reopen the task inside a Herdr session when a full Council is required.

## The artifact is the architecture

The most important output is the ADR plus the control-doc sync. The ADR preserves context, considered alternatives, evidence, trade-offs, guardrails, rejected options, reopen conditions, and migration or rollback strategy. `ARCHITECTURE.md` gets the owner map and routing rule, `RUNTIME_CONSTITUTION.md` gets any new invariant, and `PROCESS_AND_PROOF_POLICY.md` gets any new proof requirement. The decision-lock registry then marks the choice as `soft`, `guarded`, or `locked`, turning architecture from an assumption into an explicit rule future agents must read.

## It's working if

- The full Council opens separate Herdr panes running `pi`, never `omp`.
- Production code and architecture remain unchanged until the Council verdict is
  accepted.
- Being unable to identify a safe next step triggers a full Council instead of
  speculative implementation.
- Implementation pauses before a lock-in seam rather than after code has already committed to it.
- At least two independent options were considered before everyone saw the same answer.
- Claims are marked `Verified`, `Likely`, `Unverified`, or `Contradicted` instead of voted on by taste.
- The final ADR says not only what won, but what is forbidden and when to reopen it.
- Root control docs are updated, or proposed updates stay in scratch while user approval is pending.

## Where it fits

`architecture-council` is a **mandatory pre-code architecture gate**. It sits
before [to-spec](https://aihero.dev/skills-to-spec) or
[implement](https://aihero.dev/skills-implement) whenever a feature contains an
architecture decision, and it interrupts either flow when the current
architecture leaves no clear next step. It also follows
[improve-codebase-architecture](https://aihero.dev/skills-improve-codebase-architecture)
when a health check may contradict or reopen an ADR. It uses the vocabulary of
[codebase-design](https://aihero.dev/skills-codebase-design), and the map
remains [ask-matt](https://aihero.dev/skills-ask-matt).
