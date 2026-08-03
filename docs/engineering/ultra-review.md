Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=ultra-review
```

```bash
npx skills@latest update ultra-review
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/ultra-review)

## What it does

Ultra review is a maximum-recall peer review pipeline. It deliberately overlaps ten independent peer review lanes, preserves every credible candidate, and writes one durable report under `docs/ultrareview/`.

## When to reach for it

You invoke this by typing `/ultra-review` — the agent will not reach for it on its own.

Reach for it when root or the human wants a deep peer review, false positives are acceptable, and losing a rare bug would be worse than sorting noise later.

## Where it fits

It is the heavy review tool for [peer](https://aihero.dev/skills-peer) reviewer swarms. For ordinary branch review, [code-review](https://aihero.dev/skills-code-review) remains lighter; [ask-matt](https://aihero.dev/skills-ask-matt) routes both.
