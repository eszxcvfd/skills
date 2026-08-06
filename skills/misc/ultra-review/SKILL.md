---
name: ultra-review
description: "Run a maximum-recall peer review bug hunt over an explicit scope, preserving every candidate in a durable report. Use for root-assigned peer reviewer swarms or human-invoked deep review."
disable-model-invocation: true
---

# Ultra Review

## Goal

Maximize bugs discovered. False positives and noise are acceptable. Never filter a candidate out of the artifact because it is speculative, unique, low-confidence, weakly evidenced, duplicated, or hard to classify.

The coordinator clusters all peer reviewer submissions directly into clean, actionable Findings (`F001`, `F002`, ...). Do not include Raw Candidate Ledgers, Execution Receipts, or metadata clutter that an agent does not need to read to verify and fix bugs. Verification and rejection belong to the later receive workflow.

## Inputs And Strategy

The review brief provides scope, an identity digest, and optionally numbered caller directives. Ultra review always uses 10 independent peer review workers.

If no directives were supplied:

- derive a bug-hunting strategy from the scope, repository contracts, architecture, change intent, adjacent owners, call paths, lifecycle, data flow, and likely blast radius
- name generated concerns `G01`, `G02`, and so on
- diversify search routes while deliberately overlapping risky areas

If directives `D01`, `D02`, ... were supplied:

- treat every directive as mandatory
- assign every directive to at least three independent peer reviewers
- expand each directive into useful search angles without weakening or replacing it

For both modes:

- allocate exactly 10 peer review workers, named consecutively `peer-review-01` through `peer-review-10`
- use Paseo peer workers for every review lane; do not use Pi/Codex internal subagents
- give every peer reviewer at least one assigned concern
- give every peer reviewer permission to report any incidental bug inside scope, even outside its assigned concerns
- use overlap to create genuinely different traces, lifecycle phases, owners, adversarial cases, or disconfirming approaches—not identical copies of one prompt
- preserve peer reviewer independence and do not share candidate findings before consolidation

## Peer Review Packet

Each peer review packet must contain:

- exact review scope and change intent
- relevant repository contracts and prior-round warnings
- assigned concern IDs and tailored search angles
- permission to report every incidental in-scope concern
- instruction to inspect the full relevant production surface, not only the visible diff
- request for file/line evidence, failure mode, confidence, durable solution, and a disconfirming check when available
- explicit permission to return incomplete or speculative candidates rather than suppressing them
- read-only restrictions

Peer reviewers must not edit, stage, format, generate, or mutate source files. Use static read-only inspection only; do not run tests, builds, package managers, proof commands, or xtask. The coordinator may create exactly one report under `docs/ultrareview/` and no other workspace artifact.

## Restart Recovery

A system notice that peer workers or background tasks stopped due to a server restart is a recovery trigger, not permission to restart the review from scratch.

1. Freeze the existing logical roster, concern allocation, report path, and review-brief digest.
2. Inventory persisted mailbox reports by logical peer reviewer ID.
3. Preserve every completed peer reviewer report exactly once.
4. Do not relaunch the full peer reviewer batch. Revive or restart only missing logical peer reviewers with their original assignments and runtime.
5. A replacement attempt continues the same logical peer reviewer ID; never create an eleventh logical peer reviewer or duplicate completed work.
6. After all ten logical peer reviewers complete, consolidate once into the existing report.

When resumed with a recovery prompt, inspect persisted state before taking any launch action. A bare continuation must never create another full batch.

## Search Surface

Choose and combine lenses appropriate to the scope, including but not limited to:

- semantic and state-machine correctness
- ownership × lifecycle/event × expected-outcome gaps
- caller/API/schema/protocol/data-format contracts
- concurrency, ordering, cancellation, cleanup, and resource lifetime
- error masking, fallback, retry, partial failure, and invariant handling
- authorization, trust boundaries, adversarial input, and abuse cases
- hot-path allocation, copies, rescans, N+1 work, blocking, and contention
- generated artifacts, fixtures, validators, snapshots, docs, and examples
- test/proof gaps, fake-pass evidence, and mocked production claims
- compatibility paths, duplicate state, wrappers, caches, and compensation for a broken foundation
- owner/module boundaries, file responsibility, and missing essential mechanisms
- alternate end-to-end call traces and hostile edge cases

This list is raw material, not a fixed topology. Allocate according to the actual slice.

## Prior Round Guard

Before round 2 or later, read every earlier report with the same review name. Give relevant peer reviewers concise warnings about confirmed fixes, rejected false positives, unresolved routes, and regression risks, but do not use prior rejection as a filter: a peer reviewer may revive it with or without new evidence, and the artifact must retain that candidate.

## Artifact Contract

Create exactly one report with:

```powershell
python skills/misc/ultra-review/scripts/create_ultra_review_report.py --workspace <repo-root> --review-name <review-name> --scope "<scope>" --review-brief-sha256 <sha256> --peer reviewer-count 10 --directive-count <count>
```

Use the script's `report_path`; never improvise or overwrite it. Replace every `TODO`. If peer reviewers submitted no candidates, state `No candidates reported.` After writing, print the report path and full content.

## Finding Consolidation

1. Group every bug candidate reported by peer reviewers into consolidated Findings (`F001`, `F002`, ...) by root cause. Do NOT add a `Raw Candidate Ledger`, `Execution Receipt`, `Scout preservation counters`, or `Merge Notes` checklist.
2. Preserve all unique or speculative bug candidates in `Findings`. Do not filter out candidates during review.
3. Keep finding descriptions concise and focused purely on actionable information needed by an agent to verify and fix the bug:
   - Severity (`P0`, `P1`, `P2`, `P3`) & Confidence (`high`, `medium`, `low`)
   - Source pointer (exact `file:line`)
   - Evidence observed
   - Contract violated / expected law
   - Plausible failure mode
   - Durable solution hypothesis
   - Disconfirming check
4. Build a Verification Queue containing every finding and its read-only disconfirming check.

## Report Shape

Preserve these headings:

- Metadata header (Date, Review name, Round, Scope, Report path)
- Prior Round Guard
- Findings
- Verification Queue
- Strongest Reason Not To Merge Yet
- Next Receive Prompt

End with:

```text
Give <report path> to root so root can assign verification/fix peer packets for confirmed owner-clean fixes.
```
