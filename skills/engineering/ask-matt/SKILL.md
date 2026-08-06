---
name: ask-matt
description: Ask which active engineering skill or preserved specialized workflow fits the situation. A router over the skills in this repo.
disable-model-invocation: true
---

# Ask Matt

Use this router when the next engineering move is unclear. The promoted
engineering surface has thirteen skills. Paseo role instructions remain preserved
under `skills/misc/`, while the matching Codex profiles contain those
instructions inline.

## Paseo hierarchy

Use this for macro decisions, multiple agents, recovery, or quality gates:

```text
codex-supervisor → codex-root → codex-peer
```

- **`codex-supervisor`** represents the human on requirements, architecture,
  scope, acceptance, quality, and momentum recovery.
- **`codex-root`** is the active project lead. It reads `WORKSPACE_PROTOCOL.md`,
  preserves the mainline, keeps design/lead decisions, and allocates bounded
  peer work.
- **`codex-peer`** executes one sanitized packet from root and returns evidence.
  It must not read root-only protocol or create internal agents.

The role contract is embedded in each Codex profile. Fresh downstream launches
must read exact role provider, model, and thinking values from
`config.model`, verify them against the provider catalog, and pass
`--model "$MODEL" --thinking "$THINKING" --mode full-access`. MCP creation uses
`<configured-provider>/<model>` and `settings.thinkingOptionId`; do not put the
model in settings or pass a bare model id.

## Active routing

- First use in a repository → `/setup-matt-pocock-skills`.
- Macro decision, recovery, or multi-agent work → `codex-supervisor`.
- Large, foggy effort spanning multiple sessions → `/wayfinder`.
- Fuzzy plan that needs a recorded interview and decision docs → `/grill-with-docs`.
- Architecture decision or unclear safe next step → `/architecture-council`.
- Aligned conversation that needs a durable spec → `/to-spec`.
- Finished spec that needs implementation slices → `/to-tickets`.
- Settled spec or ticket ready to build → `/implement`.
- Design or state-model question that needs a throwaway artifact → `/prototype`.
- Test-first feature or fix → `/tdd`.
- Broken, failing, slow, or regressed behavior → `/diagnosing-bugs`.
- Primary-source investigation → `/research`.
- Diff, branch, or PR review → `/code-review`.

The normal small-work chain is:

```text
/grill-with-docs → /to-spec → /to-tickets → /implement → /code-review
```

## Preserved specialized workflows

From a repository clone, use the matching skill under `skills/misc/` when the
specialized workflow is more appropriate:

- terminology and domain vocabulary → `domain-modeling`;
- architecture depth and premise checks → `architecture-premise-audit`,
  `codebase-design`, `structural-antipatterns`,
  `improve-codebase-architecture`;
- incoming issue workflow → `triage`;
- cleanup, conflict repair, or maximum-recall review → `repo-refresh`,
  `resolving-merge-conflicts`, `ultra-review`.

These utilities and role sources are intentionally not listed in the promoted
plugin manifest, but their source remains available in the clone.
