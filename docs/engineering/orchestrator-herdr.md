Quickstart:

```bash
npx skills add eszxcvfd/skills --skill=orchestrator-herdr
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/orchestrator-herdr)

## What it does

User-invoked Herdr orchestrator: multi-job PLAN, workers each run one **project** skill with requirements copied from that skill’s SKILL.md, then **mandatory ingest** (STATUS + open artifacts + quality-gate + ORCH) before any next step. Approve gates on PLAN / NEXT PLAN / FINISH.

## Flow

```text
route → PLAN (y/n) → N workers (send+Enter) → ingest each → ORCH → NEXT/FINISH (y/n)
```

Worker idle is not success. Parallel only with no data edge.

## Fits

`/orchestrator-herdr` inside Herdr. Map: [ask-matt](https://aihero.dev/skills-ask-matt).
