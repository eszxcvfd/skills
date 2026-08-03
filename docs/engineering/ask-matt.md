Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=ask-matt
```

```bash
npx skills@latest update ask-matt
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/ask-matt)

## What it does

`ask-matt` is the router over the skills in this repo. It routes the Paseo management hierarchy first — [supervisor](https://aihero.dev/skills-supervisor) → [root](https://aihero.dev/skills-root) → [peer](https://aihero.dev/skills-peer) — when work needs macro decisions, momentum recovery, an active project lead, or independent workers. It keeps the older grill/spec/ticket/implement flow available for smaller work.

It does no implementation itself. It answers which flow fits, which layer owns the next decision, and when to reach for design control, review, cleanup, or debugging skills.

## When to reach for it

You invoke this by typing `/ask-matt` — the agent won't reach for it on its own.

Reach for it whenever you're unsure whether work belongs to the Paseo hierarchy, the direct spec/build chain, a design-control review, a cleanup pass, or a standalone skill.

## The map

The current management chain is:

```txt
/supervisor → /root → /peer
```

Supervisor decides macro issues and recovers momentum for the human. Root is the active lead: it preserves the mainline, does central work, and feeds peer workers only when needed. Peer executes bounded packets without reading `WORKSPACE_PROTOCOL.md` or spawning internal subagents.

Supervisor calls inspected root agents through Paseo with the `root` provider. Root calls inspected peer agents through Paseo with the `peer` provider. Peer reports evidence back to root and does not call upward or sideways.

For ordinary small work, `ask-matt` still routes to `grill-with-docs → to-spec → to-tickets → implement → code-review`. For design-shape concerns it points at [structural-antipatterns](https://aihero.dev/skills-structural-antipatterns), [codebase-design](https://aihero.dev/skills-codebase-design), [architecture-premise-audit](https://aihero.dev/skills-architecture-premise-audit), or [architecture-council](https://aihero.dev/skills-architecture-council). For cleanup it points at [repo-refresh](https://aihero.dev/skills-repo-refresh). For maximum-recall peer review it points at [ultra-review](https://aihero.dev/skills-ultra-review).

## Where it fits

`ask-matt` is the router. It sits above the skills and points into the right chain. Every docs page can link back here instead of redrawing the map.
