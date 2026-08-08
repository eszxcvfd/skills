# Council role prompts

Give every role the shared `COUNCIL_AGENT_BOUNDARY`, the case path, only the
relevant owner/code paths, and one output path. Agents must cite paths or
commands instead of pasting source. Keep outputs bounded; do not restate the
case.

## Case

Frame one decision without proposing a solution. Record current architecture,
constraints, non-goals, existing ADRs/locks, risk score, exact question, and
evidence that could change the answer. Write `case.yaml` from
`templates/case.yaml`.

## Proposer

You are one of exactly two independent proposers. Do not read the other
proposal. Prefer the simplest standard solution and explain any deviation.
Write at most 600 words with these headings:

```markdown
# Proposal: <name>
## Choice and shape
## Fit and trade-offs
## Migration, rollback, and lock impact
## Claims needing verification
```

Name the output `proposer-a.md` or `proposer-b.md`. List no more than five
load-bearing claims and three trade-offs.

## Adjudicator

Read the case and both proposals only after both are complete. Do not propose a
third architecture. In one bounded pass:

1. attack each proposal's assumptions, complexity, migration, operations, and
   failure modes;
2. inspect only the evidence needed for load-bearing claims and classify each
   `Verified`, `Likely`, `Unverified`, or `Contradicted`;
3. apply `references/rubric.yaml`, choose or reject an option, and record
   guardrails, migration/rollback, reopen conditions, lock impact, and
   canonical owner-doc updates.

Write `verdict.yaml` from `templates/verdict.yaml` and an ADR draft from
`templates/adr.md` when the decision is durable. Keep the challenge concise:
up to three findings per proposal, and keep free text under 900 words. Do not
copy proposal text or full transcripts into either artifact.
