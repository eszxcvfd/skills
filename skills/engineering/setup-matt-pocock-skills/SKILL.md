---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills — issue tracker, triage labels, domain docs, and optional detached Paseo Lead/Peer defaults. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold only the repo configuration the engineering skills actually need:

- issue tracker;
- triage label vocabulary, when `triage` is installed;
- domain glossary and ADR layout;
- optional detached Paseo Root/Peer contract and `config.model`.

This is a prompt-driven setup. Explore, present findings, confirm, then write;
do not guess or create a parallel documentation system.

## 1. Explore

Read what exists:

- `git remote -v` and `.git/config`;
- the existing `AGENTS.md` or `CLAUDE.md` and any `## Agent skills` block;
- `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/adr/`, `docs/agents/`, and `.scratch/`;
- `config.model` and `WORKSPACE_PROTOCOL.md` when this repo uses Paseo SLP;
- whether the `triage` skill is installed;
- monorepo signals such as `pnpm-workspace.yaml`, package workspaces, or
  populated packages with their own source trees.

## 2. Present findings and ask

Take the sections in order, one answer at a time. Lead each with the
recommended choice; skip a section when exploration already settled it.

### Issue tracker

Explain that `to-spec`, `to-tickets`, and `triage` need to know where work is
published. Recommend GitHub when the remote is GitHub; otherwise offer GitLab,
local markdown under `.scratch/<feature>/`, or a user-described tracker.
Record the choice in `docs/agents/issue-tracker.md`.

### Triage labels

Skip when `triage` is not installed. Otherwise ask exactly:

> Do you want to keep the default triage labels? (recommended: yes)

The defaults are `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, and `wontfix`. Record overrides only when the user asks.

### Domain docs

Default to single-context: one `CONTEXT.md` and `docs/adr/` at the repo root.
Offer multi-context only when exploration finds genuine monorepo signals.

### Paseo detached runtime (optional)

Ask only when this repo uses the detached `codex-root → codex-peer` runtime.
The small setup is two files:

- `WORKSPACE_PROTOCOL.md` — one canonical Work Routing and Root/Peer handoff
  contract;
- `config.model` — per-project Root/Peer provider/model/thinking defaults.

The external observer/launcher is not a project document and is not scaffolded
here. Do not create `ARCHITECTURE.md`, `RUNTIME_CONSTITUTION.md`,
`PROCESS_AND_PROOF_POLICY.md`, an execution plan, or an observer notebook here;
create project doctrine only when it genuinely needs it.

## 3. Confirm and write

Show a draft of the `## Agent skills` block and the selected
`docs/agents/*.md` files before writing. If the detached runtime was selected,
show the two Root/Peer files as well.

Edit exactly one repo instruction file:

- prefer `CLAUDE.md` when it exists;
- otherwise use `AGENTS.md` when it exists;
- if neither exists, ask the user which one to create.

Never create both. Update an existing `## Agent skills` block in place and do
not overwrite surrounding user content. The block should point to
`docs/agents/issue-tracker.md`, `docs/agents/domain.md`, and
`docs/agents/triage-labels.md` only when those files apply. If SLP is enabled,
add one short line pointing to `WORKSPACE_PROTOCOL.md` and `config.model`.

Use the seed templates in this folder for the chosen issue tracker, domain,
triage labels, and optional SLP files. Write each target only when missing or
after the user confirms a replacement. Day-to-day edits belong in the generated
files; rerun setup only to switch backend or restart setup.

## 4. Done

Report which files were created or updated and which skills now consume them.
Keep the final message short; the generated files are the durable handoff.
