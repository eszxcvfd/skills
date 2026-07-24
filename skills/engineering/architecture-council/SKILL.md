---
name: architecture-council
description: "Use before hard-to-reverse architecture decisions: database or schema changes, tenancy/auth models, service decomposition, module boundaries, public API contracts, core framework/state choices, infrastructure dependencies, queues/retries/storage/deployment topology, or repeated workarounds that suggest the current architecture is becoming a dead end. Convene independent proposals, challenge assumptions, verify evidence, and record an ADR with guardrails, lock level, migration path, and reopen conditions."
---

# Architecture Council

Before code crosses a lock-in seam, run a **Council**. The job is not to make the requested feature work on the current architecture at any cost; it is to decide whether the architecture remains fit before implementation continues.

Prefer boring, standard, reversible solutions. A novel architecture only wins when the evidence and operational justification beat the boring path.

## Quick gate

Run this gate whenever planning or implementation touches structure. If no trigger applies and the score is below `6`, do not run the full Council; continue with the normal skill and mention the low score only if it matters.

### Trigger signs

Run the Council when the change has any of these signs:

- hard to rollback;
- affects multiple modules or teams;
- changes data model, schema, ownership, or migration path;
- introduces infrastructure dependency, queue, cache, storage layer, deployment topology, or retry semantics;
- changes a public API or durable contract;
- creates a long-lived abstraction, framework choice, or state-management model;
- has at least two reasonable options;
- confidence is low;
- the agent is about to create the second or third workaround around the same friction;
- the change exceeds the project's architecture budget: one routine change touches more than five modules, crosses a locked ADR, creates circular dependencies, or forces integration tests for tiny changes.

### Risk score

Score the decision before you decide the process:

```text
Irreversibility:     0-3
Blast radius:        0-3
Operational impact:  0-3
Data migration risk: 0-3
Novelty:             0-2
```

A total of `6` or more triggers a full Council. A database choice, tenancy model, auth architecture, service decomposition, public contract, event schema, or deployment topology also triggers a full Council even if the score is lower.

### Autonomy zones

Keep UI cooking out of the Council unless it changes structure:

```yaml
autonomy_zones:
  frontend_visual:
    autonomy: high
    council_required: false
    examples:
      - layout
      - component styling
      - Tailwind classes
      - animation
      - dashboard polish

  frontend_architecture:
    autonomy: medium
    council_required_when:
      - introduce_global_state
      - introduce_new_rendering_model
      - change_api_contract
      - create_design_system_contract
      - move_business_logic_to_frontend

  backend_domain:
    autonomy: low

  data_architecture:
    autonomy: very_low
```

## Inputs

Before framing the case, read:

- the user goal and current conversation;
- `CONTEXT.md`, if it exists, for domain vocabulary;
- `ARCHITECTURE.md` for owner map, routing, public contracts, and allowed dependencies;
- `RUNTIME_CONSTITUTION.md` for runtime invariants the decision may create, strengthen, or violate;
- `PROCESS_AND_PROOF_POLICY.md` for evidence required to accept and later implement the decision;
- existing ADRs, preferring the repo's established location (`docs/adr/`, `docs/architecture/adr/`, or `src/<context>/docs/adr/`);
- the architecture decision registry, if present (`docs/architecture/decision-locks.yaml` or equivalent);
- the current code paths, dependency graph, tests, and docs relevant to the decision.

If there is no ADR convention yet, default to `docs/adr/` so the rest of these engineering skills can find the decision. If the target repo already uses `docs/architecture/adr/`, follow that local convention.

## Council rounds

Use `.scratch/architecture-council/<decision-slug>/` for intermediate artifacts. Do not edit production code while the decision is unresolved.

### Round 0 — Case framing

Act as **Lead**. Rewrite the decision as a case file using [templates/case.yaml](templates/case.yaml). Include constraints, non-goals, existing locks, the risk score, and the exact question being decided.

Do not propose a solution in Round 0. If the framing has a blocking ambiguity, ask the user before launching proposers. Otherwise state assumptions explicitly and continue.

### Round 1 — Independent proposals

Launch `3` detached proposer agents by default when the harness supports subagents; use `2-4` only when the case genuinely calls for fewer or more. If the harness does not support subagents, write separate proposal briefs serially and do not let later briefs read earlier ones until Round 2.

Each proposer uses [prompts/proposer.md](prompts/proposer.md) and must output:

- the proposed architecture;
- why it fits the case;
- trade-offs;
- failure modes;
- migration and rollback cost;
- lock level introduced or changed;
- conditions where the option stops being appropriate.

Detached means detached: Round 1 agents do not read each other's answers.

### Round 2 — Cross-examination

Run the **Challenger** with [prompts/challenger.md](prompts/challenger.md). The Challenger attacks the proposals rather than adding new ones, unless all proposals miss an obvious boring option.

Every proposer gets one reply to the challenge. Do not allow infinite debate.

### Round 3 — Verification

Run the **Verifier** with [prompts/verifier.md](prompts/verifier.md). The Verifier checks load-bearing claims against code, tests, dependency evidence, official docs, and small spikes only when a spike answers a disputed claim.

Classify every important claim as:

```text
Verified
Likely
Unverified
Contradicted
```

The Verifier does not vote by taste. It reports evidence and uncertainty.

### Round 4 — Scoring and vote

Score each option with the relevant rubric from [rubrics/](rubrics/). Use [rubrics/default.yaml](rubrics/default.yaml) unless the decision is mainly database, module-boundary, or infrastructure.

Vote is signal, not authority. A majority can be wrong if the evidence contradicts it or if the boring option has lower lock-in.

### Round 5 — Verdict

Act as **Lead Judge** with [prompts/judge.md](prompts/judge.md). Read the proposals, challenge, replies, verification, and scores before deciding.

The verdict uses [templates/verdict.yaml](templates/verdict.yaml) and must include:

- decision and status;
- confidence;
- why this wins now;
- rejected options and why;
- verified evidence and remaining uncertainty;
- guardrails;
- migration or rollback strategy;
- lock level: `soft`, `guarded`, or `locked`;
- reopen conditions;
- updates needed to `ARCHITECTURE.md`, `RUNTIME_CONSTITUTION.md`, and `PROCESS_AND_PROOF_POLICY.md`.

If the Council was auto-triggered inside another task, or if the verdict touches a `locked` item, contradicts an ADR, changes data, or adds infrastructure, present the verdict and ask the user for approval before writing non-scratch files or proceeding to implementation.

## ADR and decision locks

An accepted or deliberately rejected architecture decision needs a durable record. Use [templates/adr.md](templates/adr.md). Number the ADR after the existing local convention.

The ADR must preserve reasoning, not just the conclusion:

1. context;
2. considered alternatives;
3. evidence;
4. trade-offs;
5. guardrails;
6. rejected options;
7. reopen conditions;
8. migration or rollback strategy.

Update or create `docs/architecture/decision-locks.yaml` using [templates/decision-locks.yaml](templates/decision-locks.yaml) unless the repo already has an equivalent registry.

Then sync the root control docs when the verdict changes them:

- `ARCHITECTURE.md` — module ownership, routing, allowed dependencies, public contracts, implementation-internal areas, code placement rules.
- `RUNTIME_CONSTITUTION.md` — new or changed runtime invariants and the proof each invariant expects when touched.
- `PROCESS_AND_PROOF_POLICY.md` — new proof requirements introduced by the architecture decision.

If the verdict is pending user approval, write proposed updates only under `.scratch/architecture-council/<decision-slug>/` and do not edit the root control docs yet.

Lock levels:

- `soft` — easy to change: naming, folder structure, visual UI conventions. Agent may change and note why.
- `guarded` — broad but reversible: module boundaries, API pattern, caching, queue usage, state management. Changing it requires a reduced Council.
- `locked` — expensive migration: database, tenancy, service decomposition, public contract, auth architecture, event schema, deployment topology. Changing it requires a full Council and migration plan.

Agents must read decision locks before planning structural work. They must not silently violate a `guarded` or `locked` decision.

## Architecture health check

Run a health-check Council when the user asks for an architecture review or when you detect these smells:

- one feature touches too many modules;
- circular dependencies appear;
- adapter count keeps increasing;
- many interfaces have one implementation;
- modules access each other's database tables or repositories;
- business logic sits in controllers, jobs, or workers;
- exceptions have become the rule;
- an abstraction has many booleans or configuration switches;
- a developer must understand the whole system to change one feature.

Start by asking: **is this an implementation problem, or an architecture problem?** Then apply the quick gate. If risk is high, run the full Council; if risk is medium and the affected lock is `guarded`, run a reduced Council with one proposer, one challenger, one verifier, and a verdict.

## Done when

The Council is complete only when:

- the quick-gate score and trigger decision are recorded;
- Round 0 framed the case without bias;
- Round 1 produced three independent proposals, or explains why fewer were possible;
- Round 2 challenged every viable option;
- Round 3 classified load-bearing claims with evidence status;
- Round 4 scored options without treating vote as authority;
- Round 5 produced guardrails, lock level, migration/rollback, and reopen conditions;
- an ADR, decision-lock update, and any required root control-doc updates are written, or the final answer clearly says user approval is pending;
- no production code changed before the architecture decision was accepted.
