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

`setup-matt-pocock-skills` configures the small repo surface that the
engineering skills need: issue-tracker settings, triage labels, domain-doc
locations, and, optionally, the Paseo SLP contract plus `config.model`.

It is prompt-driven: the agent explores the repository, presents what it
found, asks for confirmation, then writes only the selected files. It does not
create a second control-document system or hard-code a model into a prompt.

## When to reach for it

You invoke this by typing `/setup-matt-pocock-skills` — the agent won't reach
for it on its own.

Reach for it once per repo, before the first use of another engineering skill.
If [triage](https://aihero.dev/skills-triage),
[to-spec](https://aihero.dev/skills-to-spec), or
[to-tickets](https://aihero.dev/skills-to-tickets) are guessing where work
lives, setup has not happened yet. Re-run it only to switch a backend or
restart setup; day-to-day changes belong in the generated config.

## The small setup

- **Issue tracker** — where `triage`, `to-spec`, and `to-tickets` publish work.
- **Triage labels** — the vocabulary those workflows apply.
- **Domain docs** — normally one `CONTEXT.md` and `docs/adr/`; offer a map only
  when the repository shows genuine monorepo boundaries.
- **Paseo detached runtime, when selected** — `WORKSPACE_PROTOCOL.md` is the
  single Root/Peer coordination contract and `config.model` is the per-project
  provider/model/thinking choice for those two roles. The external observer is
  configured outside the repository.

The setup does not scaffold `ARCHITECTURE.md`,
`RUNTIME_CONSTITUTION.md`, `PROCESS_AND_PROOF_POLICY.md`, an execution plan,
or an observer notebook. Create project doctrine only when it actually needs
it; operator memory is not a project prerequisite.

## It's working if

- the selected `docs/agents/` files match the real repository;
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
