---
name: architecture-council
description: Use before an architecture decision, architecture change, hard-to-reverse boundary, or when the current system leaves no safe next step. Run exactly two independent proposals and one evidence-based adjudication before production changes.
---

# Architecture Council

Use this pre-code gate before production work. Choose the simplest standard,
reversible option that the evidence supports.

## Gate

The quick gate may conclude that no architecture decision exists. Otherwise,
run the Council; risk selects the runtime mode, not whether to skip the gate.

Trigger on data/schema/ownership/migration, tenancy/auth, module or service
boundaries, dependency direction, public/durable/event contracts,
infrastructure/deployment, queues/caches/storage, retry/state/framework
choices, hard rollback, multi-module blast radius, low confidence, competing
options, repeated workarounds, or circular dependencies. Pure visual UI work is
outside the gate unless it creates a structural contract.

Score irreversibility, blast radius, operational impact, data migration risk,
and novelty from 0 to 3, except novelty from 0 to 2. Use **full** mode for
score >= 6, database/tenancy/auth architecture, service decomposition, public
or event contracts, deployment topology, locked ADR changes, or an
unclear/dead-ended architecture. Use **reduced** mode otherwise.

Read only the conversation, the smallest Work Routing document set, relevant
code/tests, existing ADRs/locks, and owner docs for the changed boundary.
Default ADRs to `docs/adr/`.

## Topology

The Lead frames the case, launches workers, validates artifacts, interacts with
the user, and integrates the result. Run exactly two independent proposers,
then one adjudicator:

```text
case → proposer-a + proposer-b → adjudicator → verdict
```

The adjudicator performs challenge, evidence classification, and rubric-based
verdict in one bounded pass. This preserves the checks without separate
challenger/verifier/judge launches or context handoffs. Reduced mode uses three
peer/delegated workers. Full mode uses three configured Paseo root agents.
Start both proposers in parallel; launch the adjudicator only after both
proposal artifacts pass validation. Use `references/council-roles.md` for
bounded role prompts.

Write only these scratch artifacts:

```text
.scratch/architecture-council/<decision-slug>/{case.yaml,proposer-a.md,proposer-b.md,verdict.yaml}
```

Add `adr.md` only when the decision is durable. Every worker receives:

```text
COUNCIL_AGENT_BOUNDARY:
- Act as one named Architecture Council role.
- Do not create peers, replacement roots, or side-channel agents.
- Do not edit production files.
- Write only the requested scratch artifact and concise evidence.
```

For full mode, read `[root].provider`, model, and thinking from `config.model`,
verify the tuple against the role catalog, and use this launch shape for the
two proposers and then the adjudicator:

```bash
ROOT_PROVIDER="$CONFIGURED_ROOT_PROVIDER"
paseo agent run --background --provider "$ROOT_PROVIDER" \
  --model "$MODEL" --thinking "$THINKING" \
  --label council-role=<role> --label role=root --cwd "$PROJECT_ROOT" "<prompt>"
paseo agent wait "$ROOT_AGENT_ID" --timeout 3600 --json
paseo agent logs "$ROOT_AGENT_ID" --json > "<transcript-path>"
```

Start proposer A and B before waiting for either. Store transcripts, but pass
only failure/evidence snippets forward. If the provider is unavailable, stop
after the gate and ask the user to restore it or choose reduced mode.

## Rounds

1. **Case** — record current architecture, constraints, non-goals, risk, the
   exact question, and evidence that could change the answer. Do not propose a
   solution. Write `case.yaml` from `templates/case.yaml`.
2. **Proposals** — collect `proposer-a` and `proposer-b` independently and in
   parallel; neither reads the other.
3. **Adjudication** — read the case and both proposals, attack each, verify
   load-bearing claims, apply `references/rubric.yaml`, and write `verdict.yaml`
   plus an ADR draft when appropriate. Do not copy proposal text.
4. **Integration** — validate paths, evidence statuses, lock impact, and
   canonical owner-doc updates before presenting or implementing the result.

## Durable record

An accepted or deliberately rejected decision produces an ADR from
`templates/adr.md` and updates `templates/decision-locks.yaml` or the repo
equivalent. Pending approval stays under scratch. Record guardrails,
migration/rollback, reopen conditions, and Work Routing owner-doc updates only
when the verdict changes them. Lock levels are `soft`, `guarded`, and `locked`;
never silently violate a guarded or locked decision.

## Done when

- trigger, risk, mode, and two-proposer run are recorded;
- `case.yaml`, two proposals, and `verdict.yaml` exist;
- the verdict contains a challenge for each proposal and evidence statuses;
- ADR/lock and required owner-doc updates are written, or approval is pending;
- no production code or architecture changed before acceptance.
