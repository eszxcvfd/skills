Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=supervisor
```

```bash
npx skills@latest update supervisor
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/supervisor)

## What it does

Supervisor is the decision proxy above root in the Paseo hierarchy. It handles macro decisions such as requirements, architecture solution, scope, acceptance, quality, and momentum recovery; it does not plan peer work or implement code.

Supervisor calls root through Paseo with the `root` provider via `${PASEO_CLI:-paseo}`. It inspects any candidate before sending; only a verified `root` provider (or `role=root` label) counts as root. If no verified root exists, it starts one with `agent run --provider root --label hierarchy=paseo --label role=root --cwd <repo> "<packet>"`. It never sends root packets to its own supervisor session and never calls peer directly.

## When to reach for it

You invoke this by typing `/supervisor` — the agent will not reach for it on its own.

Use it when you want an agent to speak for you on project decisions, accept or reject root plans, recover lost momentum from git/session history, and report evidence-backed progress.

## Where it fits

It sits above [root](https://aihero.dev/skills-root) and below the human. When unsure which ordinary skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) remains the router.
