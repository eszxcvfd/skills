Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=peer
```

```bash
npx skills@latest update peer
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/peer)

## What it does

Peer is an independent worker for a bounded packet from root. It performs exactly the slice it was fed, and it must not read `WORKSPACE_PROTOCOL.md` or treat predefined task categories as limits.

Peer is called by root through Paseo and returns evidence to root. It must not call supervisor, create root replacements, call other peers, or spawn internal subagents.

## When to reach for it

You invoke this by typing `/peer` — the agent will not reach for it on its own.

Use it for worker sessions that should stay focused and small, with the work defined by root's packet rather than by a fixed role list.

## Where it fits

It is fed by [root](https://aihero.dev/skills-root), not owned as root’s child subagent. For review swarms, root can invoke [ultra-review](https://aihero.dev/skills-ultra-review).
