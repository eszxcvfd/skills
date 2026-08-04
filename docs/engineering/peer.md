Quickstart:

```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy just this skill with `npx skills@latest add eszxcvfd/skills --skill=peer`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/peer)

## What it does

Peer is an independent bounded agent for a packet from root. It performs exactly the slice it was fed, and it must not read `WORKSPACE_PROTOCOL.md` or `config.model` or treat predefined task categories as limits.

Peer is called by root through Paseo and returns evidence as the terminal run result. When done or blocked, peer returns its final `PEER_STATUS` block in its final answer. It must not call supervisor, create root replacements, call other peers, spawn internal subagents, require `ROOT_AGENT_ID`, or call `paseo agent send` for completion.

## When to reach for it

You invoke this by typing `/peer` — the agent will not reach for it on its own.

Use it for peer sessions that should stay focused and small, with the work defined by root's packet rather than by a fixed role list.

## Where it fits

It is fed by [root](https://aihero.dev/skills-root), not owned as root’s child subagent. For review swarms, root can invoke [ultra-review](https://aihero.dev/skills-ultra-review).
