---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills in one pass — issue tracker, triage labels, domain routing, and optional detached Paseo Root/Peer defaults. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the complete small repo surface the engineering skills actually need:

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
- domain layout: one root `CONTEXT.md` and `docs/adr/` unless genuine
  monorepo boundaries require `CONTEXT-MAP.md`;
- detached runtime: enable when the repository already uses the detached
  `codex-root → codex-peer` path or the user selects it.

## 2. Build one setup manifest

The manifest must name every target and classify it as `create`, `update`, or
`keep`:

- exactly one repo instruction file (`CLAUDE.md` preferred, otherwise
  `AGENTS.md`), including one complete `## Agent skills` block;
- `docs/agents/issue-tracker.md`;
- `docs/agents/domain.md`;
- `docs/agents/triage-labels.md` when `triage` is installed;
- `WORKSPACE_PROTOCOL.md` and `config.model` when the detached runtime is
  enabled.

`CONTEXT.md` and ADR files are domain content, not setup metadata. Create them
later and lazily when a term or consequential decision actually exists; do not
create empty placeholders just to make setup look complete.

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
and which skills now consume it. Keep the final message short; the generated
files are the durable handoff.
