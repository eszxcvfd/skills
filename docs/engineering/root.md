Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=root
```

```bash
npx skills@latest update root
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/root)

## What it does

Root is the active project lead in the Paseo hierarchy. It reads `WORKSPACE_PROTOCOL.md`, preserves the mainline, does central work when delegation would slow things down, allocates peer packets only when needed, and gates output before reporting upward.

Root calls peer workers through Paseo with the `peer` provider via `${PASEO_CLI:-paseo}`. It inspects any candidate before sending; only a verified `peer` provider (or `role=peer` label) counts as peer. It starts one peer per bounded packet using `<repo>/config.model`'s `[peer]` provider/model/thinking values when present; otherwise it uses `agent run --provider peer --label hierarchy=paseo --label role=peer --label parent=root --cwd <repo> "<WORK_PACKET>"`. It sends corrections only to an inspected peer with `agent send <peer-id> "<packet>"`.

## When to reach for it

You invoke this by typing `/root` — the agent will not reach for it on its own.

Use it when a project needs a lead agent to keep momentum, own the mainline, do project work directly, and feed independent peers without exposing root-only protocol.

## Where it fits

It sits below [supervisor](https://aihero.dev/skills-supervisor) and coordinates [peer](https://aihero.dev/skills-peer) workers. It uses [structural-antipatterns](https://aihero.dev/skills-structural-antipatterns) as the design-control lens.
