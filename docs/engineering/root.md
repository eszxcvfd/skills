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
project doctrine and does not create a second project command path.

## When to reach for it

You invoke this by typing `/root` — the agent won't reach for it on its own.

Reach for it when a task needs autonomous planning, room coherence, bounded
Peer delegation, integration, acceptance, or recovery. For one focused packet,
use [peer](https://aihero.dev/skills-peer).

## Work Routing

Root opens only the smallest current document set needed:

- orientation and change routing: `ARCHITECTURE.md`;
- doc ownership and routing: `docs/README.md`;
- lane selection and proof: `docs/process/DEVELOPMENT.md`;
- current work queue: `docs/issues/ROADMAP.md`;
- non-trivial plans or durable coordination: `PLANS.md`;
- runtime or protocol ownership: `docs/architecture/RUNTIME.md` and
  `docs/architecture/NETCODE.md`;
- server-relevant resource and cook/package boundaries:
  `docs/architecture/CONTENT.md`.

Doctrine is editable repo truth. If governing docs are silent or stale, record
the bounded inference or update the canonical owner doc before relying on a
new rule.

`docs/process/DEVELOPMENT.md` owns lane selection, and `PLANS.md` owns the
conditions and contents for design notes and checked-in plans. Do not invent
another routing rule here. Do not trigger closeout for doc-only edits, small
owner-neutral fixes, or partial progress unless the governing plan requires it.

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
