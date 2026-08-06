---
name: architecture-council
description: "Use before any architecture decision or architecture change, and whenever the agent cannot identify a safe next step because the current system or architecture is unclear, constrained, or becoming a dead end. This gate must run before production code or architecture changes."
---

# Architecture Council

Mandatory pre-code architecture gate. Use it before any architecture decision,
before production code that depends on one, before changing architecture, and
when the current system leaves no clear safe next step.

Prefer boring, standard, reversible solutions. Novel architecture only wins when
evidence and operational need beat the boring path.

## Quick gate

Run the quick gate inline. It may decide **no architecture decision exists**;
only then may the normal skill continue. If any architecture decision exists,
run a reduced or full Council. Risk selects Council size, not bypass.

Trigger on: data/schema/ownership/migration, tenancy, auth, service or module
boundaries, dependency direction, public/durable contracts, event schemas,
infrastructure, queues, caches, storage, deployment topology, retry semantics,
framework/state-management choices, hard rollback, multi-module blast radius,
low confidence, two viable options, repeated workarounds, circular dependencies,
or one routine change touching more than five modules. Pure visual UI work is
outside the Council unless it creates structure or contracts.

Score before choosing mode:

```text
Irreversibility:     0-3
Blast radius:        0-3
Operational impact:  0-3
Data migration risk: 0-3
Novelty:             0-2
```

Full Council: score >= 6, database, tenancy, auth architecture, service
decomposition, public contract, event schema, deployment topology, locked ADR,
or no safe next step because architecture is unclear/contradictory/dead-ended.
Everything else with an architecture decision uses a reduced Council.

## Inputs

Read only what frames the decision: current conversation and goal; `CONTEXT.md`
if present; `ARCHITECTURE.md`, `RUNTIME_CONSTITUTION.md`, and
`PROCESS_AND_PROOF_POLICY.md`; existing ADRs and decision locks; relevant code,
dependency paths, tests, and docs. Follow the repo's ADR location; default to
`docs/adr/` only when no convention exists.

## Delegation contract

The Lead stays in the current agent. The Lead owns framing, agent launch,
artifact ingestion, quality gates, final user interaction, and non-scratch writes
after approval.

Choose the cheapest approved delegation mode that preserves independent Council
roles:

- **Reduced Council:** use independent peer/delegated workers for `proposer-a`,
  `challenger`, `verifier`, and `judge`.
- **Full Council:** use separate Paseo `root` agents for `proposer-a`,
  `proposer-b`, `proposer-c`, `challenger`, `verifier`, and `judge`.

If the required peer/root provider is unavailable, stop after the quick gate and
ask the user to restore it or explicitly choose a different risk mode. Full
Full Council root launches read the exact `[root].provider`, model, and thinking
from `<repo>/config.model`, verify the provider/model/thinking tuple against the
root provider catalog, and pass both `--model "$MODEL"` and `--thinking "$THINKING"`.
The launch uses that configured provider alias, not a literal provider name.
Never replace the Council with Herdr, serial role-play, `omp`, or uncontrolled side-channel agents.

Every Council agent receives one prompt from `prompts/`, one output path under
`.scratch/architecture-council/<decision-slug>/`, and this boundary:

```text
COUNCIL_AGENT_BOUNDARY:
- You are one Architecture Council role agent.
- Do not create peers, internal subagents, replacement roots, or side-channel agents.
- Do not edit production files.
- Write only the requested scratch artifact and report evidence.
```

Full Council root launch contract keeps this shape:

ROOT_PROVIDER="<configured [root].provider>"
paseo agent run --background --provider "$ROOT_PROVIDER" \
  --model "$MODEL" --thinking "$THINKING" \
  --title "architecture-council:<decision-slug>:<role>" \
  --label council-role=<role> --label role=root --cwd "$PROJECT_ROOT" "$(cat "$PROMPT_FILE")"
paseo agent wait "$ROOT_AGENT_ID" --timeout 3600 --json
paseo agent logs "$ROOT_AGENT_ID" --json > ".scratch/architecture-council/<decision-slug>/transcripts/<role>.log"
```

A stopped, `idle`, or `completed` agent is not success. Validate transcript plus
required artifact before advancing.

## Rounds

1. **Case:** Lead writes `case.yaml` from `templates/case.yaml` using
   `prompts/lead.md`. No solution bias. Ask the user only for blocking ambiguity.
2. **Proposals:** reduced starts `proposer-a`; full starts `proposer-a/b/c` in
   background before waiting for any result. Proposers cannot read each other's
   answers.
3. **Challenge:** fresh `challenger` uses `prompts/challenger.md`; each proposer
   gets one reply only.
4. **Verification:** fresh `verifier` uses `prompts/verifier.md` and marks
   load-bearing claims `Verified`, `Likely`, `Unverified`, or `Contradicted`.
5. **Scoring:** use `rubrics/default.yaml` unless database, module-boundary, or
   infrastructure fits better. Vote is signal, not authority.
6. **Verdict:** fresh `judge` uses `prompts/judge.md` and
   `templates/verdict.yaml`. Lead ingests; Lead must not silently replace Judge.

## Records and locks

Accepted or deliberately rejected decisions need an ADR from `templates/adr.md`
and a decision-lock registry such as `docs/architecture/decision-locks.yaml`
from `templates/decision-locks.yaml` unless the repo has an equivalent.

Sync root control docs when the verdict changes them:
`ARCHITECTURE.md`, `RUNTIME_CONSTITUTION.md`, and
`PROCESS_AND_PROOF_POLICY.md`. If the verdict is pending user approval, write
proposed updates only under `.scratch/architecture-council/<decision-slug>/`.

Lock levels: `soft` = easy to change and note why; `guarded` = broad but
reversible and needs a reduced Council to change; `locked` = expensive migration
and needs a full Council plus migration plan. Agents must not silently violate a
`guarded` or `locked` decision.

## Done when

- the quick-gate score, trigger, and selected reduced or full Council mode are recorded;
- every Council role ran as an independent artifact-producing agent in the selected mode;
- full Council used Paseo root agents and started all three proposers before waiting;
- case, proposals, challenge, verification, scoring, and judge verdict exist under scratch;
- important claims are evidence-classified, not voted on by taste;
- ADR, decision lock, and required control-doc updates are written, or the final answer says approval is pending;
- no production code or architecture changed before the decision was accepted.
