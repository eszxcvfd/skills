---
name: setup-matt-pocock-skills
description: Bootstrap the complete project documentation surface in one pass — canonical architecture, process, roadmap, plan, runtime, protocol, and content docs plus issue tracker, triage, domain routing, and optional detached Paseo defaults. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Bootstrap the complete project surface the engineering skills need:

- canonical project owner documents;
- issue tracker;
- triage label vocabulary, when `triage` is installed;
- domain glossary and ADR routing;
- optional detached Paseo Root/Peer contract and `config.model`.

This is a one-pass setup. Explore the whole repository, build one complete
setup manifest, get one confirmation, then write every selected target in one
run. Do not stop after configuring only the tracker, guess at missing policy,
or create a parallel documentation system.

## 1. Explore

Read what exists, starting with the project's Work Routing owner documents
when they are present:

- `git remote -v` and `.git/config`;
- the existing `AGENTS.md` or `CLAUDE.md` and any `## Agent skills` block;
- `ARCHITECTURE.md`, `docs/README.md`, `docs/process/DEVELOPMENT.md`,
  `PLANS.md`, and relevant `docs/architecture/` owner docs;
- `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/adr/`, `docs/agents/`, and `.scratch/`;
- `config.model` and `WORKSPACE_PROTOCOL.md` when this repo uses Paseo SLP;
- whether the `triage` skill is installed;
- monorepo signals such as `pnpm-workspace.yaml`, package workspaces, or
  populated packages with their own source trees.

Resolve the recommended defaults during this exploration:

- tracker: GitHub when the remote is GitHub; otherwise GitLab, local markdown
  under `.scratch/<feature>/`, or the user's configured tracker;
- triage labels: `needs-triage`, `needs-info`, `ready-for-agent`,
  `ready-for-human`, and `wontfix` when `triage` is installed;
- canonical owner docs: initialize the complete set below, preserving verified
  project content when a file already exists;
- domain layout: one root `CONTEXT.md` and `docs/adr/` when the repository has
  domain content to record, unless genuine monorepo boundaries require
  `CONTEXT-MAP.md`;
- detached runtime: enable when the repository already uses the detached
  `codex-root → codex-peer` path or the user selects it.

## 2. Build one setup manifest

The manifest must name every target and classify it as `create`, `update`, or
`keep`:

- exactly one repo instruction file (`CLAUDE.md` preferred, otherwise
  `AGENTS.md`), including one complete `## Agent skills` block;
- the canonical owner documents, always:
  - `ARCHITECTURE.md`;
  - `docs/README.md`;
  - `docs/process/DEVELOPMENT.md`;
  - `docs/issues/ROADMAP.md`;
  - `PLANS.md`;
  - `docs/architecture/RUNTIME.md`;
  - `docs/architecture/NETCODE.md`;
  - `docs/architecture/CONTENT.md`;
- `docs/agents/issue-tracker.md`;
- `docs/agents/domain.md`;
- `docs/agents/triage-labels.md` when `triage` is installed;
- `WORKSPACE_PROTOCOL.md` and `config.model` when the detached runtime is
  enabled.

Use the matching sections in `templates/canonical-docs.md` for the eight
canonical owner documents. `CONTEXT.md` and ADR files remain domain content,
not setup metadata; create them later and lazily when a term or consequential
decision actually exists.

Show the findings, the complete manifest, the selected template contents, and
any overwrite diffs together. Ask for one confirmation for the whole manifest.
If the user changes a choice, regenerate the manifest once; do not ask a
sequence of per-file questions.

## 3. Write the manifest in one pass

After the single confirmation, write every `create` and `update` target in the
manifest during the same setup run. Edit exactly one repo instruction file:

- prefer `CLAUDE.md` when it exists;
- otherwise use `AGENTS.md` when it exists;
- if neither exists, include a new `AGENTS.md` in the manifest and confirm it
  together with the other targets.

Never create both. Update an existing `## Agent skills` block in place and do
not overwrite surrounding user content. The block should point to
`docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and
`docs/agents/triage-labels.md` only when those files apply. If SLP is enabled,
add one short line pointing to `WORKSPACE_PROTOCOL.md` and `config.model`.

Read `templates/canonical-docs.md` as the source for the eight canonical
documents. For every target:

- copy the matching structure and replace generic bootstrap text with facts
  verified from the repository;
- preserve existing project decisions and edit only the owned sections;
- if the repository does not establish a fact yet, say so explicitly and
  record what would establish it; never invent architecture, process, runtime,
  protocol, or content details;
- create parent directories as part of the same write pass;
- leave every canonical document substantive and non-empty, even when its
  current state is explicitly `Not established yet`.

Use the seed templates in this folder for every selected target. Do not pause
between files or leave a half-configured setup. If an existing target differs,
the manifest's one confirmation authorizes that replacement; preserve unrelated
user content. Day-to-day edits belong in the generated files; rerun setup only
to switch a backend or deliberately rebuild the setup manifest.

The root-facing contract is intentionally blind to operator roles: keep
`WORKSPACE_PROTOCOL.md`, `config.model`, the root skill, and the root agent
metadata limited to project doctrine, Root ownership, and bounded Peer
execution. Never put an upstream observer/manager name, callback protocol, or
operator status channel in those files.

## 4. Done

Report the complete manifest result — every file created, updated, or kept —
and which skills now consume it. Before reporting success, verify that every
canonical owner path in the manifest exists, is non-empty, and is referenced
by `docs/agents/domain.md`. Keep the final message short; the generated files
are the durable handoff.
