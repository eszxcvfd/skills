# Canonical project document seeds

These seeds define the eight canonical owner documents created by
`setup-matt-pocock-skills`. Read the repository first, then use only the
matching section for each target. Replace the bootstrap fallback with verified
project facts whenever evidence exists. Do not copy this file into the target
repository and do not leave template instructions in the generated documents.

If the repository does not establish a fact, use a short statement such as
`Not established yet` and name the evidence or decision that would establish
it. Never fabricate architecture, process, runtime, protocol, or content
details.

## `ARCHITECTURE.md`

```markdown
# Architecture

## Purpose

System orientation, boundaries, invariants, and change routing for this
repository.

## Current system shape

Not established yet. Record the verified runtime components, important data
flows, and ownership boundaries here.

## Boundaries

Not established yet. Record the repository's meaningful module, service,
package, or deployment boundaries here.

## Invariants

Not established yet. Record the constraints that must remain true across
changes here.

## Change routing

Open only the smallest current document set needed:

- orientation and change routing: `ARCHITECTURE.md`;
- doc ownership and routing: `docs/README.md`;
- lane selection and proof: `docs/process/DEVELOPMENT.md`;
- current work queue: `docs/issues/ROADMAP.md`;
- non-trivial plans or durable coordination: `PLANS.md`;
- runtime or protocol ownership: `docs/architecture/RUNTIME.md` and
  `docs/architecture/NETCODE.md`;
- server-relevant resource and cook/package boundaries:
  `docs/architecture/CONTENT.md`.

Doctrine is editable repository truth. If a governing document is silent or
stale, record a bounded inference or update the canonical owner before relying
on a new rule.

## Evidence and maintenance

Record the commands, tests, diagrams, or decisions that support material
architecture claims. Update this file when the system shape or boundaries
change.
```

## `docs/README.md`

```markdown
# Documentation map

This map assigns one canonical owner to each kind of project truth. Read the
smallest relevant set for the current task; do not load every document by
default.

| Document | Owns | Read when |
| --- | --- | --- |
| `ARCHITECTURE.md` | Orientation, system shape, boundaries, invariants, and change routing | A change affects structure or ownership |
| `docs/README.md` | Documentation ownership and routing | A document needs a home |
| `docs/process/DEVELOPMENT.md` | Lane selection, development proof, and closeout rules | Choosing how to work or prove a change |
| `docs/issues/ROADMAP.md` | Current work queue and priorities | Selecting or sequencing work |
| `PLANS.md` | Non-trivial plans and durable coordination | A change needs design notes or a checked-in plan |
| `docs/architecture/RUNTIME.md` | Runtime and lifecycle ownership | Changing processes, launches, or deployment |
| `docs/architecture/NETCODE.md` | Protocol, transport, and compatibility ownership | Changing communication or wire behavior |
| `docs/architecture/CONTENT.md` | Server-relevant resources and cook/package boundaries | Changing assets, packaging, or content loading |

Do not create another routing or control-document system without updating this
map first.
```

## `docs/process/DEVELOPMENT.md`

```markdown
# Development process

## Lane selection

Choose the smallest lane that matches the change:

- doc-only: edit the canonical owner document and check links or formatting;
- small owner-neutral fix: make the bounded change and run focused proof;
- implementation: establish or follow a plan, then use tests and review;
- architecture or cross-boundary change: record the decision and plan before
  implementation;
- incident or risky change: record the risk, mitigation, and recovery proof.

If the repository has a more specific lane vocabulary, this document owns that
vocabulary.

## Proof

Every non-trivial change names its proof before implementation. Prefer the
smallest relevant test, check, build, or reproducible scenario. Documentation
changes should prove links, structure, and consistency rather than inventing a
runtime test.

## Handoffs and closeout

Record the changed files, evidence, remaining risks, and next action. Do not
trigger closeout for doc-only edits, small owner-neutral fixes, or partial
progress unless the governing plan requires it.

## Updating this process

Change this document when lane selection or proof policy changes. Do not place
another lane-selection rule in a skill or unrelated project document.
```

## `docs/issues/ROADMAP.md`

```markdown
# Roadmap

## Current queue

No repository-specific queue has been established yet. Keep the live queue in
the configured issue tracker or record bounded local work here when this
repository uses markdown tracking.

## Ordering rules

Not established yet. Record the verified priority, dependency, and readiness
rules here rather than duplicating them in individual skills.

## Queue maintenance

Each queued item should have an owner, a bounded outcome, and a proof or
acceptance condition. Remove or update stale entries when the canonical tracker
changes.
```

## `PLANS.md`

```markdown
# Plans

## When a plan is required

Use a checked-in plan for non-trivial, cross-boundary, risky, or multi-step
work when the repository needs durable coordination beyond the current task
conversation.

## Required contents

Each plan records the outcome, scope, non-goals, decisions, affected owners,
sequence, proof, rollback or recovery considerations, and open risks. Link to
the relevant roadmap item and architecture owner documents.

## Active plans

No checked-in plan has been established yet. Add plans here when the work meets
the conditions above; do not create a second plan index in a skill.

## Plan lifecycle

Update the plan as decisions change. Close it only when its acceptance and
follow-up conditions are satisfied.
```

## `docs/architecture/RUNTIME.md`

```markdown
# Runtime architecture

## Ownership

Not established yet. Record the executable entry points, process boundaries,
configuration sources, and lifecycle owners here.

## Lifecycle

Not established yet. Record startup, steady state, shutdown, recovery, and
observability expectations here.

## Operational invariants

Not established yet. Record the runtime properties that must remain true and
the proof used to check them.

## Change routing

Runtime changes require an architecture note or plan when they affect process
boundaries, deployment, persistence, recovery, or operational ownership.
```

## `docs/architecture/NETCODE.md`

```markdown
# Network and protocol architecture

## Protocol ownership

Not established yet. Record the protocol surfaces, transport boundaries,
message owners, and compatibility policy here.

## Compatibility

Not established yet. Record versioning, rollout, migration, and failure
handling rules here when the repository establishes them.

## Proof

Not established yet. Record the focused tests, fixtures, traces, or scenarios
that prove protocol behavior and backward or forward compatibility.

## Change routing

Protocol changes require an architecture note or plan when they affect wire
contracts, clients, servers, persistence, or integration boundaries.
```

## `docs/architecture/CONTENT.md`

```markdown
# Content and resource architecture

## Resource ownership

Not established yet. Record the server-relevant resources, their owners, and
their source-of-truth locations here.

## Cook and package boundaries

Not established yet. Record what is cooked, packaged, loaded, generated, or
excluded for each relevant runtime or deployment target.

## Change safety

Not established yet. Record validation, cache invalidation, migration, and
rollback expectations for resource changes.

## Change routing

Content changes require an architecture note or plan when they affect package
boundaries, generated output, runtime loading, or deployment behavior.
```
