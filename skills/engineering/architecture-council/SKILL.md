---
name: architecture-council
description: Use before an architecture decision, architecture change, hard-to-reverse boundary, or when the current system leaves no safe next step. Run a lean Council with two independent proposers, challenge, verification, and a durable verdict before production changes.
---

# Architecture Council

Run this gate before production work when the change affects architecture or
when the current architecture does not provide a safe next step. Prefer the
boring, standard, reversible option; deviate only when evidence and operating
need justify it.

## Gate

The quick gate may conclude that no architecture decision exists. Otherwise,
run a Council; risk chooses the delegation mode, not whether to skip the gate.

Trigger on data/schema/ownership/migration, tenancy, auth, module or service
boundaries, dependency direction, public or durable contracts, event schemas,
infrastructure, queues, caches, storage, deployment topology, retry semantics,
framework/state-management choices, hard rollback, multi-module blast radius,
low confidence, competing options, repeated workarounds, or circular
dependencies. Pure visual UI work is outside the gate unless it creates a
structural contract.

Score these from 0 to 3, except novelty (0 to 2): irreversibility, blast
radius, operational impact, data migration risk, and novelty. Use **full** mode
for score >= 6, database/tenancy/auth architecture, service decomposition,
public or event contracts, deployment topology, locked ADR changes, or an
unclear/dead-ended architecture. Use **reduced** mode otherwise.

Read only the decision context: the conversation, `CONTEXT.md` when present,
relevant code/tests/docs, existing ADRs and locks, and any repo control docs
that already exist. Follow the repo's ADR convention; default to `docs/adr/`.

## Five-role Council

The Lead stays in the current agent and owns framing, launch, artifact
validation, user interaction, and final integration. Both modes use exactly
**two independent proposers**; reduced mode uses peer/delegated workers and
full mode uses separate Paseo root agents. The epistemic breadth stays fixed;
only runtime isolation changes.

```text
case → proposer-a + proposer-b → challenger → verifier → judge/verdict
```

Start both proposers before waiting for either result. Proposers cannot read
each other's work. Use the role prompts in `references/council-roles.md` and
write each artifact under:

```text
.scratch/architecture-council/<decision-slug>/
```

Every Council agent receives this boundary:

```text
COUNCIL_AGENT_BOUNDARY:
- Act as one named Architecture Council role.
- Do not create peers, replacement roots, or side-channel agents.
- Do not edit production files.
- Write only the requested scratch artifact and report evidence.
```

For full mode, read `[root].provider`, model, and thinking from
`config.model`, verify the tuple against the role catalog, then launch each
root with the configured provider, `--model "$MODEL"`, `--thinking
"$THINKING"`, `--background`, and `--label role=root`:

```bash
ROOT_PROVIDER="$CONFIGURED_ROOT_PROVIDER"
paseo agent run --background --provider "$ROOT_PROVIDER" \
  --model "$MODEL" --thinking "$THINKING" \
  --label council-role=<role> --label role=root --cwd "$PROJECT_ROOT" "<prompt>"
paseo agent wait "$ROOT_AGENT_ID" --timeout 3600 --json
paseo agent logs "$ROOT_AGENT_ID" --json > "<transcript-path>"
```

Validate the transcript and artifact before advancing. If the required
provider is unavailable, stop after the quick gate and ask the user to restore
it or choose reduced mode.

## Rounds

1. **Case** — frame one decision, current state, constraints, non-goals, risk,
   and evidence needed. Do not bias the wording.
2. **Proposals** — collect independent proposals from `proposer-a` and
   `proposer-b` in parallel.
3. **Challenge** — break both proposals; do not add a third proposal.
4. **Verification** — classify load-bearing claims as `Verified`, `Likely`,
   `Unverified`, or `Contradicted`.
5. **Judge** — apply `references/rubric.yaml`, choose or reject an option, and
   write the verdict. Votes are evidence, not authority.

## Durable record

An accepted or deliberately rejected decision produces an ADR from
`templates/adr.md` and updates a decision-lock registry from
`templates/decision-locks.yaml` or the repo equivalent. Pending user approval
stays under scratch. Record guardrails, migration/rollback, and reopen
conditions; update existing architecture/runtime/proof control docs only when
the verdict changes them.

Lock levels are `soft`, `guarded`, and `locked`. Never silently violate a
guarded or locked decision.

## Done when

- the trigger, risk score, mode, and two-proposer run are recorded;
- case, two proposals, challenge, verification, and verdict artifacts exist;
- important claims carry evidence status;
- the ADR/lock and required control-doc updates are written, or approval is
  explicitly pending;
- no production code or architecture changed before acceptance.
