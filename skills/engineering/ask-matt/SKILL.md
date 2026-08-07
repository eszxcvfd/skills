---
name: ask-matt
description: Ask which active engineering skill or preserved specialized workflow fits the situation. A router over the skills in this repo.
disable-model-invocation: true
---

# Ask Matt

Use this router when the next engineering move is unclear. The promoted
engineering surface includes the workflow skills, the architecture disciplines,
and the three SLP role contracts.

## Project routing

The project execution path is:

```text
task prompt → detached Root → bounded Peer
```

The runtime profiles call the autonomous Lead `codex-root` and the bounded
executor `codex-peer`. An external observer may start or watch Root, but it is
outside the project contract and adds no project command path, callback, or
doctrine.

Root owns project scope, planning, integration, and acceptance. Peer owns
task-local engineering judgment inside its packet. Root does not receive an
upstream status schema.

## Andrew Ng comparison

Andrew Ng's agentic playbook contributes workflow patterns: reflection, tool
use, planning, and multi-agent collaboration. SLP contributes the governance
layer those patterns do not define: concern-specific authority, room ownership,
many-to-many workspace relationships, provenance, and reconciliation.

The earlier AI Transformation Playbook is an enterprise adoption guide, not a
runtime role topology. Use SLP to operate the work safely after the enterprise
has chosen its AI transformation path. The runtime contract lives in
`WORKSPACE_PROTOCOL.md`; it is the single source of truth for the role graph.

## Active routing

- First use in a repository → `/setup-matt-pocock-skills`.
- New autonomous project task, sequencing, delegation, integration, or
  acceptance → `codex-root` / `/root` (the detached Lead role).
- One bounded implementation, research, review, proof, or cleanup packet →
  `codex-peer` / `/peer`.
- Lifecycle observation or starting a fresh detached Root outside the project
  → `codex-supervisor` or `/supervisor`.
- Large, foggy effort spanning multiple sessions → `/wayfinder`.
- Fuzzy plan that needs a recorded interview and decision docs →
  `/grill-with-docs`.
- Architecture decision or unclear safe next step → `/architecture-council`
  (two independent proposers, then challenge, verification, and verdict;
  reduced mode uses peer/delegated workers, full mode uses Paseo root agents).
- Deep-module interface, seam, or locality question → `/codebase-design`.
- Domain terms, scenarios, glossary, or ADR decision → `/domain-modeling`.
- Aligned conversation that needs a durable spec → `/to-spec`.
- Finished spec that needs implementation slices → `/to-tickets`.
- Settled spec or ticket ready to build → `/implement`.
- Test-first feature or fix → `/tdd`.
- Broken, failing, slow, or regressed behavior → `/diagnosing-bugs`.
- Primary-source investigation → `/research`.
- Diff, branch, or PR review → `/code-review`.
- Active merge or rebase conflict → `/resolving-merge-conflicts`.
- Periodic deepening scan with a visual report → `/improve-codebase-architecture`.
- Incoming issue or external PR workflow → `/triage`.
- Manual setup or one-off state transition → `/wizard`.
- Design or state-model question needing a throwaway artifact → `/prototype`.

The normal small-work chain is:

```text
/grill-with-docs → /to-spec → /to-tickets → /implement → /code-review
```

Use `/architecture-council` before that chain when the change affects a
hard-to-reverse boundary or the safe next step is unclear. Use the roles when
the work needs a detached Lead or bounded independent execution; keep observer
concerns outside the project documents.
