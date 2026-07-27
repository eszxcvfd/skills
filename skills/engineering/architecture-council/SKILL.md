---
name: architecture-council
description: "Use before any architecture decision or architecture change, and whenever the agent cannot identify a safe next step because the current system or architecture is unclear, constrained, or becoming a dead end. This gate must run before production code or architecture changes. Convene independent Pi agents in Herdr to propose, challenge, verify, and judge, then record an ADR with guardrails, lock level, migration path, and reopen conditions."
---

# Architecture Council

Before making any architecture decision, writing production code that depends on
one, or changing the architecture, run a **Council**. Also run it when the agent
cannot identify a safe next step because the current system or architecture is
unclear, constrained, contradictory, or becoming a dead end. The job is not to
make the requested feature work on the current architecture at any cost; it is
to decide whether the architecture remains fit before implementation continues.

Prefer boring, standard, reversible solutions. A novel architecture only wins when the evidence and operational justification beat the boring path.

## Quick gate

Run this gate whenever planning or implementation touches structure, whenever a
choice would establish or change an architectural rule, and whenever the agent
does not know what to do next because of the current system or architecture.

The gate may conclude that no architecture decision exists. Only then may the
normal skill continue without a Council. If an architecture decision exists,
the score selects a reduced or full Council; it never permits bypassing the
Council.

### Trigger signs

Run the Council when the change has any of these signs:

- requires any architecture decision, even when it appears reversible or scores
  below the normal risk threshold;
- changes the architecture or writes production code that depends on an
  unresolved architecture choice;
- the agent cannot state a safe next step because the current system or
  architecture is unclear, constrained, contradictory, or no longer supports
  the requested direction;
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

A total of `6` or more triggers a full Council. A database choice, tenancy
model, auth architecture, service decomposition, public contract, event schema,
or deployment topology also triggers a full Council even if the score is lower.
Not knowing the safe next step because of the current system or architecture
also triggers a full Council.

An architecture decision below `6` that does not match a full-Council trigger
still requires a reduced Council with one proposer, one challenger, one
verifier, and one judge. Low risk changes the Council size, not whether the
decision receives independent review.

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

## Herdr Council contract

The quick gate can run in the current agent anywhere. Any reduced or full
Council must run inside Herdr and must use `pi` for every Council worker.

Before opening the Council:

```bash
test "${HERDR_ENV:-}" = "1"
command -v pi
herdr integration status
herdr agent list
```

If any prerequisite fails, stop after the quick gate and ask the user to run the
Council from a Herdr session with `pi` available. Do not write production code,
change architecture, or fall back to internal subagents, serial role-play,
another multiplexer, or `omp`.

The Lead remains in the current pane and owns framing, artifact ingestion, the
quality gate, and final user interaction. Create these independent workers:

| Worker | Role | Mode |
| --- | --- | --- |
| `council-proposer-a` | Independent proposal A | reduced and full |
| `council-proposer-b` | Independent proposal B | full only |
| `council-proposer-c` | Independent proposal C | full only |
| `council-challenger` | Cross-proposal challenge | reduced and full |
| `council-verifier` | Evidence and claim verification | reduced and full |
| `council-judge` | Final synthesis and verdict | reduced and full |

Use this artifact layout under
`.scratch/architecture-council/<decision-slug>/`:

```text
case.yaml
prompts/
proposals/a.md
proposals/b.md
proposals/c.md
challenge.md
replies/a.md
replies/b.md
replies/c.md
verification.md
scores.yaml
verdict.yaml
ADR-draft.md
workers.tsv
```

Each worker prompt must include the appropriate file from `prompts/`, the case
file, the evidence it may read, and the single artifact it must write. In a full
Council, start all three proposer workers before waiting for any proposer so
their reasoning remains independent. A reduced Council starts only
`council-proposer-a`. Reuse participating proposer panes only for their one
challenge reply.

Launch every worker with this Herdr API shape:

```bash
herdr agent start "$WORKER" \
  --cwd "$PROJECT_ROOT" \
  --split right \
  --no-focus \
  -- pi
herdr agent send "$WORKER" "$(cat "$PROMPT_FILE")"
herdr pane send-keys "$PANE_ID" Enter
herdr agent wait "$WORKER" --status idle --timeout 3600000
herdr agent read "$WORKER" --source recent
```

Record worker and pane identifiers in `workers.tsv`. `idle` only means the Pi
session stopped producing work; it is not success. Before advancing a round,
read the transcript and validate that the required artifact exists and
satisfies its output contract. Close only panes created by this run, and only
after the Council ends or the user approves cleanup.

## Council rounds

Use `.scratch/architecture-council/<decision-slug>/` for intermediate artifacts. Do not edit production code while the decision is unresolved.

### Round 0 — Case framing

Act as **Lead**. Rewrite the decision as a case file using [templates/case.yaml](templates/case.yaml). Include constraints, non-goals, existing locks, the risk score, and the exact question being decided.

Do not propose a solution in Round 0. If the framing has a blocking ambiguity, ask the user before launching proposers. Otherwise state assumptions explicitly and continue.

### Round 1 — Independent proposals

For a full Council, launch `council-proposer-a`, `council-proposer-b`, and
`council-proposer-c` as separate Herdr agents running `pi`. Start all three
before waiting for any of them. For a reduced Council, launch only
`council-proposer-a`. Each participating proposer receives the same case brief
but cannot read other proposal artifacts.

Each proposer uses [prompts/proposer.md](prompts/proposer.md) and must output:

- the proposed architecture;
- why it fits the case;
- trade-offs;
- failure modes;
- migration and rollback cost;
- lock level introduced or changed;
- conditions where the option stops being appropriate.

Independent means independent: Round 1 Pi agents do not read each other's
answers.

### Round 2 — Cross-examination

Launch `council-challenger` as a new Herdr agent running `pi` with all
validated proposals and
[prompts/challenger.md](prompts/challenger.md). The Challenger attacks the
proposals rather than adding new ones, unless all proposals miss an obvious
boring option.

Send the challenge back to each original proposer Pi agent. Every proposer gets
one reply and writes only its assigned reply artifact. Do not allow infinite
debate.

### Round 3 — Verification

Launch `council-verifier` as a new Herdr agent running `pi` with the
proposals, challenge, replies, and
[prompts/verifier.md](prompts/verifier.md). The Verifier checks load-bearing
claims against code, tests, dependency evidence, official docs, and small
spikes only when a spike answers a disputed claim.

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

Launch `council-judge` as a separate Herdr agent running `pi`. Give it the
case, all validated round artifacts, rubric scores, and
[prompts/judge.md](prompts/judge.md). The Lead must not silently replace the
Judge; it ingests and presents the Judge's result.

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

Run a health-check Council when the user asks for an architecture review, when
the agent cannot identify a safe next step because of the current system or
architecture, or when you detect these smells:

- one feature touches too many modules;
- circular dependencies appear;
- adapter count keeps increasing;
- many interfaces have one implementation;
- modules access each other's database tables or repositories;
- business logic sits in controllers, jobs, or workers;
- exceptions have become the rule;
- an abstraction has many booleans or configuration switches;
- a developer must understand the whole system to change one feature.

Start by asking: **is this an implementation problem, or an architecture
problem?** Then apply the quick gate. If the next safe step is unknown because
of the current architecture, stop implementation and run the full Council. For
other architecture decisions, use the risk score to choose full or reduced
Council. Resume production code or architecture changes only after the verdict
is accepted.

## Done when

The Council is complete only when:

- the required reduced or full Council ran inside Herdr;
- every Council worker was launched with `pi`, never `omp`;
- for a full Council, all three proposer panes were started before the Lead
  waited for results;
- the quick-gate score and trigger decision are recorded;
- Round 0 framed the case without bias;
- Round 1 produced three independent proposals for a full Council or one
  proposal for a reduced Council;
- Round 2 challenged every viable option;
- Round 3 classified load-bearing claims with evidence status;
- Round 4 scored options without treating vote as authority;
- Round 5 produced guardrails, lock level, migration/rollback, and reopen conditions;
- an ADR, decision-lock update, and any required root control-doc updates are written, or the final answer clearly says user approval is pending;
- no production code or architecture changed before the architecture decision
  was accepted.
