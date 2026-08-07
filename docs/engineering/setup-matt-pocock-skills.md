```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy this skill with `npx skills@latest add eszxcvfd/skills --skill=setup-matt-pocock-skills`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/setup-matt-pocock-skills)

## What it does

`setup-matt-pocock-skills` bootstraps the complete project surface that the
engineering skills need in one pass: canonical architecture, process, roadmap,
plan, runtime, protocol, and content documents; issue-tracker settings; triage
labels; domain-doc routing; and, optionally, the Paseo SLP contract plus
`config.model`.

It explores the repository, builds one manifest of every target, asks for one
confirmation, then writes all selected files in the same run. It follows the
repository's Work Routing and does not create a second document system or
hard-code a model into a prompt.

## When to reach for it

You invoke this by typing `/setup-matt-pocock-skills` — the agent won't reach
for it on its own.

Reach for it once per repo, before the first use of another engineering skill.
If [triage](https://aihero.dev/skills-triage),
[to-spec](https://aihero.dev/skills-to-spec), or
[to-tickets](https://aihero.dev/skills-to-tickets) are guessing where work
lives, setup has not happened yet. Re-run it only to switch a backend or
restart setup; day-to-day changes belong in the generated config.

## The complete setup

The setup manifest always includes these canonical owner documents:

- `ARCHITECTURE.md`;
- `docs/README.md`;
- `docs/process/DEVELOPMENT.md`;
- `docs/issues/ROADMAP.md`;
- `PLANS.md`;
- `docs/architecture/RUNTIME.md`;
- `docs/architecture/NETCODE.md`;
- `docs/architecture/CONTENT.md`.

Existing files are shown as `keep` or `update` with their diffs. Missing files
are created from the bundled canonical seeds, then populated from verified
repository evidence. Unknown facts are recorded as not established yet rather
than guessed.

- **Issue tracker** — where `triage`, `to-spec`, and `to-tickets` publish work,
  recorded in `docs/agents/issue-tracker.md`.
- **Triage labels** — the vocabulary those workflows apply, recorded in
  `docs/agents/triage-labels.md` when `triage` is installed.
- **Domain routing** — `docs/agents/domain.md`, with a root `CONTEXT.md` and
  `docs/adr/` created lazily when there is content to record.
- **Paseo detached runtime, when selected** — `WORKSPACE_PROTOCOL.md` is the
  single Root/Peer coordination contract and `config.model` is the per-project
  provider/model/thinking choice for those two roles. The external observer is
  configured outside the repository.

`CONTEXT.md` and ADR files remain lazy domain content. They are created when a
term or consequential decision actually exists, not as empty setup metadata.

## It's working if

- the complete manifest has no unreviewed targets;
- all eight canonical owner documents exist and are non-empty;
- all selected `docs/agents/` files match the real repository;
- `docs/agents/domain.md` points to the canonical owner set;
- the existing `CLAUDE.md` or `AGENTS.md` has one accurate `## Agent skills`
  block;
- detached-runtime repositories have one `WORKSPACE_PROTOCOL.md` and one
  `config.model`, with no duplicate project contract;
- downstream skills use the configured tracker, labels, and Paseo role
  defaults without guessing.

## Where it fits

`setup-matt-pocock-skills` is a **run-once setup**. Its neighbours are
[triage](https://aihero.dev/skills-triage),
[to-spec](https://aihero.dev/skills-to-spec), and
[to-tickets](https://aihero.dev/skills-to-tickets), which consume the issue
tracker and label config, plus
[root](https://aihero.dev/skills-root), and
[peer](https://aihero.dev/skills-peer), which consume the optional detached
Root/Peer contract. When the next step is unclear,
[ask-matt](https://aihero.dev/skills-ask-matt) routes you.
