---
name: ask-matt
description: Ask which skill or flow fits your situation. A router over the skills in this repo.
disable-model-invocation: true
---

# Ask Matt

You don't remember every skill, so ask.

A **flow** is a path through the skills. The current top-level operating model is the Paseo hierarchy, with the older spec/ticket/build skills still available for small or single-agent work.

## Paseo hierarchy

Use this when work needs management, decisions, multiple workers, or quality gates:

```text
/supervisor → /root → /peer
```

- **`/supervisor`** represents the human on macro decisions: requirements, architecture solution, scope, acceptance, quality, and momentum recovery. It can decide `APPROVED`, `REVISE`, `RECOVER`, or `ESCALATE`; it does not plan peer work.
- **`/root`** is the active project lead: reads `WORKSPACE_PROTOCOL.md`, preserves the mainline, does central work when delegation would slow things down, allocates peer workers only when needed, gates their output, and reports status upward.
- **`/peer`** is the worker: executes one bounded packet from root. Peer must not read `WORKSPACE_PROTOCOL.md` and must not spawn Pi/Codex internal subagents.
- Supervisor calls inspected root agents through Paseo with the `root` provider. Root calls inspected peer agents through Paseo with the `peer` provider. Peer does not call upward or sideways.

Peers are workers root feeds when needed; they are not child subagents of root, and root should not create them before there is independent work.

## Main flow: idea → ship

For small or single-session work, the direct route remains:

1. **`/grill-with-docs`** — sharpen the idea and update `CONTEXT.md`/ADRs.
2. **`/to-spec`** — turn the conversation into a spec.
3. **`/to-tickets`** — split the spec into tracer-bullet tickets.
4. **`/implement`** — build each ticket with `/tdd`, proof policy, and `/code-review`.

If this grows into multi-worker work, move to `/supervisor → /root → /peer` before implementation; otherwise root or the direct flow should keep the work inline.

## Design and proof gates

- **`/structural-antipatterns`** — use when a plan or implementation may contain structural misfit, weak-owner workarounds, proof laundering, overengineering, or avoidable tax.
- **`/architecture-council`** — mandatory before architecture decisions or when no safe architectural next step is clear. It still requires Herdr/Pi for Council workers; do not fall back to internal subagents.
- **`/architecture-premise-audit`** — use only for an explicitly requested broad premise audit when the whole system archetype may be wrong before repo vocabulary can be trusted.
- **`/codebase-design`** — deep-module vocabulary: module, interface, seam, adapter, depth, leverage, locality.
- **`/domain-modeling`** — domain vocabulary and ADR discipline.

## Review and cleanup

- **`/code-review`** — ordinary diff review against Standards and Spec.
- **`/ultra-review`** — maximum-recall peer review when false positives are acceptable and missing a rare bug is worse.
- **`/repo-refresh`** — explicit repo cleanup: stale docs, dead proof, obsolete tests, scripts, fixtures, generated debris.

## On-ramps and standalone skills

- **Bugs** → `/diagnosing-bugs`.
- **Incoming raw issues** → `/triage`.
- **Huge foggy effort** → `/wayfinder`, then collapse into `/to-spec` when decisions are clear.
- **Runnable design question** → `/prototype`.
- **External reading** → `/research`.
- **Session bridge** → `/handoff`.
- **Learning** → `/teach`.
- **Writing skills** → `/writing-great-skills`.

## Precondition

Run **`/setup-matt-pocock-skills`** once per repo to install issue tracker wiring and root control docs. For Paseo-managed repos, add `WORKSPACE_PROTOCOL.md`; root reads it, peer does not.
