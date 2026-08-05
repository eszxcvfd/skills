```bash
npx skills@latest add eszxcvfd/skills
```

Select `ask-matt` when prompted, along with the agent you want to install it for.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/ask-matt)

## What it does

`ask-matt` is the router over the skills in this repo. It routes the Paseo management hierarchy first — [supervisor](https://aihero.dev/skills-supervisor) → [root](https://aihero.dev/skills-root) → [peer](https://aihero.dev/skills-peer) — when work needs macro decisions, momentum recovery, an active project lead, or independent peers. It keeps the older grill/spec/ticket/implement flow available for smaller work.

It does no implementation itself. It answers which flow fits, which layer owns the next decision, and when to reach for design control, review, cleanup, or debugging skills.

## When to reach for it

You invoke this by typing `/ask-matt` — the agent won't reach for it on its own.

Reach for it whenever you're unsure whether work belongs to the Paseo hierarchy, the direct spec/build chain, a design-control review, a cleanup pass, or a standalone skill.

## The map

The current management chain is:

```txt
/supervisor → /root → /peer
```

Supervisor decides macro issues and recovers momentum for the human. Root is the active lead: it preserves the mainline, does central work, and starts peer only when bounded independent execution is useful. Peer executes bounded packets without reading `WORKSPACE_PROTOCOL.md` or `config.model` or spawning internal subagents.

Supervisor creates fresh root agents through Paseo for fresh requests, optionally overridden by `<repo>/config.model`'s `[root]` provider/model/thinking settings after exact catalog preflight. Root creates fresh peer agents through Paseo for bounded work, optionally overridden by `<repo>/config.model`'s `[peer]` provider/model/thinking settings after exact catalog preflight. Supervisor appends reusable coordination failures and anti-pattern lessons to `SUPERVISOR_NOTEBOOK.md`; root retrieves peer completion through native wait/log/inspect, and peer does not call upward or sideways.
CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"` from `config.model`; MCP `paseo_create_agent` provider must be `<role>/<model>` and `settings.thinkingOptionId` must equal the configured thinking value. Existing agents keep their original model/thinking; fresh work uses `config.model`, so stale sessions are reused only when explicitly named.

For ordinary small work, `ask-matt` still routes to `grill-with-docs → to-spec → to-tickets → implement → code-review`. For design-shape concerns it points at [structural-antipatterns](https://aihero.dev/skills-structural-antipatterns), [codebase-design](https://aihero.dev/skills-codebase-design), [architecture-premise-audit](https://aihero.dev/skills-architecture-premise-audit), or [architecture-council](https://aihero.dev/skills-architecture-council). For cleanup it points at [repo-refresh](https://aihero.dev/skills-repo-refresh). For maximum-recall peer review it points at [ultra-review](https://aihero.dev/skills-ultra-review).

## Where it fits

`ask-matt` is the router. It sits above the skills and points into the right chain. Every docs page can link back here instead of redrawing the map.
