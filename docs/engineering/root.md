```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy this skill with `npx skills@latest add eszxcvfd/skills --skill=root`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/root)

## What it does

`root` is the detached Lead for one active project. It owns the current task's
scope, plan, sequencing, delegation, integration, acceptance, and final
decision. Its defining constraint is autonomy: the Lead receives a task and
project doctrine, not an operator management protocol.

## When to reach for it

You invoke this by typing `/root` — the agent won't reach for it on its own.

Reach for it when a task needs autonomous planning, room coherence, bounded
Peer delegation, integration, acceptance, or recovery. For one focused packet,
use [peer](https://aihero.dev/skills-peer).

## Work Routing

Root opens only the smallest current document set: architecture/change owner,
docs ownership, development/proof lane, current roadmap, durable plan, and
runtime/content ownership docs when they exist. Missing names are skipped in
favour of the repository's canonical equivalents; no routing document is
created just to satisfy a checklist.

`WORKSPACE_PROTOCOL.md` is the root-only execution contract. It keeps doctrine
editable, makes `DEVELOPMENT.md` own lane selection, and makes `PLANS.md` own
design-note and checked-in-plan rules.

## Prerequisites

The repository needs its current doctrine and, when the task delegates work,
the Paseo provider catalog plus the `[peer]` entry in `config.model`. Peer
packets never receive `WORKSPACE_PROTOCOL.md` or `config.model`.

## Where it fits

`root` is the autonomous project owner in the small execution path:

```text
task prompt → detached Root → bounded Peer
```

It is closest to Andrew Ng's Tech Lead Agent plus planning, reflection, and
multi-agent collaboration patterns. The [ask-matt router](https://aihero.dev/skills-ask-matt)
points to it when the work needs a Lead rather than a single packet.
