Quickstart:

```bash
npx skills add eszxcvfd/skills --skill=orchestrator-herdr
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/orchestrator-herdr)

## What it does

User-invoked Herdr orchestrator: **PLAN → approve → worker → ingest → NEXT PLAN → approve**. One project skill per worker; STATUS under `.scratch/orchestrator/`. Reuse idle workers when useful; close them when done (no extra confirm).

## When

Inside Herdr (`HERDR_ENV=1`), multi-step skill work with human gates. Invoke `/orchestrator-herdr`.

## Flow

```text
herdr integration status → agent list → agent start
→ agent send + send-keys Enter → agent wait idle → agent read
→ pane close if not reusing
```

## Fits

Standalone beside [ask-matt](https://aihero.dev/skills-ask-matt); dispatches research/implement/tdd/… as workers.
