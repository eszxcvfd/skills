```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy this skill with `npx skills@latest add eszxcvfd/skills --skill=peer`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/peer)

## What it does

`peer` executes exactly one bounded packet from detached `root`, using local
engineering judgment and returning evidence. It is intentionally narrow: the
packet supplies scope and acceptance, while Peer supplies implementation,
research, review, operation, or proof inside that scope.

## When to reach for it

You invoke this by typing `/peer` — the agent won't reach for it on its own.

Reach for it when the Lead has a focused execution, test, research, review,
proof, or cleanup slice. For planning, sequencing, and integration, use
[root](https://aihero.dev/skills-root).

## Boundary and handoff

Peer does not read `WORKSPACE_PROTOCOL.md` or `config.model`, create another
agent, broaden its packet, or open a callback channel. Root retrieves the
terminal `PEER_STATUS` result through native wait/log/inspect and inspects the
actual artifacts before accepting it.

## Where it fits

Peer is the bounded execution node in:

```text
task prompt → detached Root → bounded Peer
```

It maps most closely to Andrew Ng's Developer Agent and specialist tool-use
patterns. The [ask-matt router](https://aihero.dev/skills-ask-matt) routes a
focused packet here when Root has already made the ownership decision.
