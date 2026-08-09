```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can install the skill set with `npx skills@latest add eszxcvfd/skills`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/setup-matt-pocock-skills)

## What it does

`setup-matt-pocock-skills` bootstraps the complete project surface that the
engineering skills need in one pass: canonical architecture, process, roadmap,
plan, runtime, protocol, and content documents; issue-tracker settings; triage
labels; domain-doc routing; and the Paseo SLP project contract. When detached
Paseo is enabled, it also prepares the three machine-local role profiles,
provider registration, launcher target, and external Supervisor notebook.

It explores the repository, asks about the issue tracker, triage labels, and
domain layout in sequence, then shows a complete draft before writing. It
follows the repository's Work Routing and does not create a second document
system or hard-code a model into a prompt.

Its Paseo profiles keep the roles separate while leaving the workflow flexible:
Supervisor works like a normal agent by default and only launches a detached
Root when the human explicitly asks for that handoff. Root/Lead owns
coordination method and acceptance once chosen, and Peer executes one bounded
owner-facing request. Root reads the Root-only `WORKSPACE_PROTOCOL.md`; Peer
never reads or requests it. The profiles use role-scoped capability guidance
rather than fixed prompt templates. When delegation is explicitly requested,
Supervisor carries the owner's request to Root as if the owner were speaking
directly, preserving intent and uncertainty without inventing decisions. Root
does the same when it asks Peer to work: the message contains only the context,
outcome, scope, constraints, non-goals, relevant files/rules, proof, and done
condition needed for that request, without mentioning an upstream role. Neither
handoff imposes a response style. Delegated runs use native completion
notification with a 30-minute wait bound. Prompt transport remains lossless:
prose `\\n` escapes become real newlines before launch or handoff, while
escapes inside code, regexes, paths, and JSON examples are preserved.

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

It also always creates or updates:

- `WORKSPACE_PROTOCOL.md`;
- `config.model`.

There is no minimal-document mode: a setup run is incomplete if any required
canonical owner document is omitted. Existing substantive and current files
may be kept; missing or stale files must be created or updated.

Existing files are shown as `keep` or `update` with their diffs after the three
setup questions. Missing files are created from the bundled canonical seeds,
then populated from verified repository evidence. Unknown facts are recorded as
not established yet rather than guessed.

- **Issue tracker** — where `triage`, `to-spec`, and `to-tickets` publish work,
  recorded in `docs/agents/issue-tracker.md`.
- **Triage labels** — the vocabulary those workflows apply, recorded in
  `docs/agents/triage-labels.md` when `triage` is installed.
- **Domain routing** — `docs/agents/domain.md`, with a root `CONTEXT.md` and
  `docs/adr/` created lazily when there is content to record.
- **Paseo workspace** — `WORKSPACE_PROTOCOL.md` is the Root/Peer coordination
  contract and `config.model` is the per-project provider/model/thinking choice
  for those two roles. Root owns its coordination method and may adapt it to
  the task; Supervisor normally works directly and only becomes the Root
  handoff point when the human explicitly asks for that delegation. The three
  role profile TOMLs, provider registration,
  launcher, and Supervisor notebook are machine-local and remain outside the
  repository.

`CONTEXT.md` and ADR files remain lazy domain content. They are created when a
term or consequential decision actually exists, not as empty setup metadata.

## It's working if

- the tracker, labels, and domain choices were answered in sequence;
- the complete draft was shown before any write;
- all eight canonical owner documents exist and are non-empty;
- `WORKSPACE_PROTOCOL.md` and `config.model` exist and are non-empty;
- all selected `docs/agents/` files match the real repository;
- `docs/agents/domain.md` points to the canonical owner set;
- the existing `CLAUDE.md` or `AGENTS.md` has one accurate `## Agent skills`
  block;
- enabled Paseo workspaces have all three machine-local profile files, the
  three provider registrations, a launcher target, and an external notebook;
- downstream skills use the configured tracker, labels, and Paseo role
  defaults without guessing.

## Where it fits

`setup-matt-pocock-skills` is a **run-once setup**. Its neighbours are
[triage](https://aihero.dev/skills-triage),
[to-spec](https://aihero.dev/skills-to-spec), and
[to-tickets](https://aihero.dev/skills-to-tickets), which consume the issue
tracker and label config. When detached Paseo is enabled, this setup writes
the machine-local `supervisor.config.toml`, `root.config.toml`, and
`peer.config.toml` instructions consumed by the runtime profiles. When the
next step is unclear, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
