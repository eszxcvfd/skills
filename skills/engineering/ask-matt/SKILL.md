---
name: ask-matt
description: Ask which skill or flow fits your situation. A router over the skills in this repo.
disable-model-invocation: true
---

# Ask Matt

You don't remember every skill, so ask.

A **flow** is a path through the skills. The current top-level operating model is the Paseo hierarchy, with the older spec/ticket/build skills still available for small or single-agent work.

## Paseo hierarchy

Use this when work needs management, decisions, multiple peers, or quality gates:

```text
/supervisor → /root → /peer
```

- **`/supervisor`** represents the human on macro decisions: requirements, architecture solution, scope, acceptance, quality, and momentum recovery. It can decide `APPROVED`, `REVISE`, `RECOVER`, or `ESCALATE`; it does not plan peer work. It appends reusable coordination failures and anti-pattern lessons to `SUPERVISOR_NOTEBOOK.md`.
- **`/root`** is the active project lead: reads `WORKSPACE_PROTOCOL.md`, preserves the mainline, keeps design/lead decisions, starts fresh peer sessions for implementation-heavy bounded work, gates their terminal output, and reports status upward.
- **`/peer`** executes one bounded packet from root. Peer must not read `WORKSPACE_PROTOCOL.md`, must not spawn Pi/Codex internal subagents, and returns its final `PEER_STATUS` block as the terminal run result.
- Supervisor creates fresh root agents through Paseo for fresh requests, optionally overridden by `<repo>/config.model`'s `[root]` model settings after exact catalog preflight. Root creates fresh peer agents through Paseo for bounded work, optionally overridden by `<repo>/config.model`'s `[peer]` model settings after exact catalog preflight. Root keeps design/lead; peer is default for coding, TDD, bugfix implementation, test/proof, and code review. Root retrieves peer completion through native wait/log/inspect rather than a callback message.
- CLI launches use role providers plus model/thinking flags; MCP `paseo_create_agent` provider must be `<role>/<model>` after catalog verification. Existing agents keep their original model/thinking; fresh work uses `config.model`, so stale sessions are reused only when explicitly named.
- Peer packets must not ask peer to read `WORKSPACE_PROTOCOL.md` or `config.model`; root reads those files and sends only sanitized packet-specific constraints.

Peers are independent bounded agents root feeds when needed; they are not child subagents of root, and root should not create them before there is independent work.

## Main flow: idea → ship

For small or single-session work, the direct route remains:

1. **`/grill-with-docs`** — sharpen the idea and update `CONTEXT.md`/ADRs.
2. **`/to-spec`** — turn the conversation into a spec.
3. **`/to-tickets`** — split the spec into tracer-bullet tickets.
4. **`/implement`** — build each ticket with `/tdd`, proof policy, and `/code-review`.

If this grows into multi-peer work, move to `/supervisor → /root → /peer` before implementation; otherwise root or the direct flow should keep the work inline.

## Design and proof gates

- **`/structural-antipatterns`** — use when a plan or implementation may contain structural misfit, weak-owner workarounds, proof laundering, overengineering, or avoidable tax.
- **`/architecture-council`** — mandatory before architecture decisions or when no safe architectural next step is clear. It runs independent Council roles through the approved delegation mode: cheaper peer/delegated workers for reduced gates, Paseo root agents for full/high-risk gates. Do not replace the Council with serial role-play, Herdr, `omp`, or uncontrolled side-channel agents.
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

Run **`/setup-matt-pocock-skills`** once per repo to install issue tracker wiring, root control docs, `WORKSPACE_PROTOCOL.md`, `SUPERVISOR_NOTEBOOK.md`, and `config.model`. Root reads `WORKSPACE_PROTOCOL.md`; peer does not. Supervisor uses `SUPERVISOR_NOTEBOOK.md` for durable coordination lessons, and supervisor/root use `config.model` for per-project downstream model defaults when creating new agents.
