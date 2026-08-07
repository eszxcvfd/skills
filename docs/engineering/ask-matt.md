```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy this skill with `npx skills@latest add eszxcvfd/skills --skill=ask-matt`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/ask-matt)

## What it does

`ask-matt` is the router over the promoted engineering skills and the Paseo
roles. It decides whether the next owner is a detached Root for project
planning, a Peer for one bounded packet, an external observer for lifecycle
work, or a standalone workflow skill.

It does no implementation itself. Its defining constraint is that project
routing stays small and local: task prompt → detached Root → bounded Peer.
Observer concerns remain outside the project documents.

## When to reach for it

You invoke this by typing `/ask-matt`; the agent will not reach for it on its own.

Reach for it whenever the next engineering move, owner, or workflow is unclear.
Use [root / Lead](https://aihero.dev/skills-root) for autonomous project
coordination, [peer](https://aihero.dev/skills-peer) for a bounded execution
packet, and [supervisor](https://aihero.dev/skills-supervisor) only for
external lifecycle observation or starting a fresh Root.

## The map

```text
task prompt → detached Root → bounded Peer
```

The runtime profile calls the autonomous Lead `codex-root`. The normal
small-work chain remains:

```text
/grill-with-docs → /to-spec → /to-tickets → /implement → /code-review
```

The router also covers architecture council, deep-module design, domain
modeling, debugging, research, TDD, prototypes, code review, merge conflicts,
architecture deepening, triage, and manual setup wizards. The role contract is
kept in the repo's `WORKSPACE_PROTOCOL.md` so there is one source of truth.

## Where it fits

`ask-matt` is the router above the skill set. Every skill page can point back to
it instead of redrawing the graph. For the Andrew Ng comparison, it treats
reflection, tool use, planning, and multi-agent collaboration as workflow
patterns, then adds detached Root ownership, bounded Peer packets, and
evidence handback as the project execution layer.
