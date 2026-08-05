```bash
npx skills@latest add eszxcvfd/skills
```

Select `root` when prompted, along with the agent you want to install it for.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/root)

## What it does

Root is the active project lead in the Paseo hierarchy. It reads `WORKSPACE_PROTOCOL.md`, preserves the mainline, does central work when delegation would slow things down, starts fresh peer sessions only when independent bounded execution is useful, and gates terminal output before reporting upward.

Root calls peer through Paseo with the `peer` provider via `${PASEO_CLI:-paseo}`. It reads `<repo>/config.model` when present, verifies the exact `[peer]` provider/model/thinking values against the role provider catalog, and refuses guessed or unavailable model IDs. CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"` from `[peer]`; MCP `paseo_create_agent` provider must be `<role>/<model>` and `settings.thinkingOptionId` must equal `[peer].thinking`. Existing agents keep their original model/thinking; fresh work uses `config.model`, so stale-model peers are reused only when explicitly named. Normal work starts one fresh peer per bounded packet. Peer packets must not ask peer to read `WORKSPACE_PROTOCOL.md` or `config.model`.

## Peer-default work

Root keeps design/lead ownership: requirements shaping, scope, architecture solution, domain model, plans, tickets, structural-antipattern review, acceptance decisions, momentum recovery, and final integration judgment.

Peer-default work covers coding and code edits, TDD/red-green implementation, bugfix implementation after root defines the repro and invariant, tests, proof commands, code review, and bounded code cleanup. Root can still do this work inline when the human explicitly asks, when delegation costs more than the task, when no safe peer packet exists, or when verified provider/model failure makes peer unavailable. Root must state that reason and must not promote proof rows unless it actually ran the proof.

## When to reach for it

You invoke this by typing `/root` — the agent will not reach for it on its own.

Use it when a project needs a lead agent to keep momentum, own the mainline, do project work directly, and feed independent peers without exposing root-only protocol.

## Where it fits

It sits below [supervisor](https://aihero.dev/skills-supervisor) and coordinates [peer](https://aihero.dev/skills-peer). It uses [structural-antipatterns](https://aihero.dev/skills-structural-antipatterns) as the design-control lens.
