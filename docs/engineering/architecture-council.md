Quickstart:

```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy just this skill with `npx skills@latest add eszxcvfd/skills --skill=architecture-council`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/architecture-council)

## What it does

`architecture-council` is the mandatory decision gate for any architecture
choice or architecture change. It also runs whenever the agent cannot identify
a safe next step because the current system or architecture is unclear,
constrained, contradictory, or becoming a dead end.

The defining constraint is risk-based delegation. Reduced gates use cheaper
independent peer/delegated Council roles; full or high-risk gates use separate
Paseo `root` agents for maximum isolation. The Council does not use Herdr,
serial role-play, `omp`, or uncontrolled side-channel agents as a fallback.

It is about lock-in, not debate theater. The Council prefers boring, standard,
reversible architecture, then records the decision as an ADR with guardrails,
migration or rollback notes, lock level, and reopen conditions so future agents
know what they may not silently break.

## When to reach for it

Type `/architecture-council`, or the agent reaches for it automatically when a
task fits.

Reach for it before every architecture decision, before production code that
depends on an unresolved architecture choice, and before changing the
architecture. It also runs when the agent does not know what to do next because
the present system or architecture no longer provides a clear, safe path.

Examples include database or schema changes, tenancy or auth models, service
decomposition, module boundaries, public API contracts, framework or
state-management choices, queues, retries, storage abstractions, deployment
topology, or repeated workarounds around the same architectural friction. Pure
visual UI work remains outside the Council unless it changes structure.

## Prerequisites

The selected delegation mode must be available. Reduced gates need the approved
peer/delegated worker mode. Full and high-risk gates need Paseo and the `root`
provider:

```bash
paseo daemon status
paseo provider ls --json
```

The quick gate can run anywhere, but the skill stops rather than simulating
Council roles or modifying production code if the required provider is
unavailable.

The skill writes durable records when a decision is accepted: an ADR in the
repo's ADR directory, and a decision-lock registry such as
`docs/architecture/decision-locks.yaml` if the repo does not already have one.

## The Council gate

The skill starts with a risk score: irreversibility, blast radius, operational
impact, data migration risk, and novelty. A score of six or more runs the full
Council. Some decisions always require the full Council: database, tenancy,
auth architecture, service decomposition, public contract, event schema,
deployment topology, locked ADR changes, and uncertainty about the safe next
step caused by the current architecture.

Every other architecture decision still runs a reduced Council. A low score
reduces the delegation cost; it does not allow the architecture gate to be
skipped.

The key split is expression versus structure. Frontend visuals get high
autonomy; frontend architecture, backend domain design, and data architecture
get progressively less. AI can cook the dashboard, but adding global state or
changing an API contract goes through the gate.

## Independent Council agents

The Lead stays in the current agent. A reduced Council runs `proposer-a`,
`challenger`, `verifier`, and `judge` as independent peer/delegated role agents.
A full Council starts `proposer-a`, `proposer-b`, and `proposer-c` as separate
background Paseo root agents before waiting for any result, then runs fresh root
agents for `challenger`, `verifier`, and `judge`.

Every role writes a durable artifact under
`.scratch/architecture-council/<decision-slug>/`, and the Lead validates both
the transcript and the artifact before advancing. No role may edit production
files, spawn side-channel agents, or replace the Council with serial self-review.

## The artifact is the architecture

The most important output is the ADR plus the control-doc sync. The ADR
preserves context, considered alternatives, evidence, trade-offs, guardrails,
rejected options, reopen conditions, and migration or rollback strategy.
`ARCHITECTURE.md` gets the owner map and routing rule,
`RUNTIME_CONSTITUTION.md` gets any new invariant, and
`PROCESS_AND_PROOF_POLICY.md` gets any new proof requirement. The
decision-lock registry then marks the choice as `soft`, `guarded`, or
`locked`, turning architecture from an assumption into an explicit rule future
agents must read.

## It's working if

- Reduced gates use independent peer/delegated Council roles; full/high-risk
  gates use separate Paseo root agents.
- Production code and architecture remain unchanged until the Council verdict is
  accepted.
- Being unable to identify a safe next step triggers a full Council instead of
  speculative implementation.
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
