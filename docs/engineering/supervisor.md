```bash
npx skills@latest add eszxcvfd/skills
```

Select `supervisor` when prompted, along with the agent you want to install it for.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/supervisor)

## What it does

Supervisor is the decision proxy above root in the Paseo hierarchy. It handles macro decisions such as requirements, architecture solution, scope, acceptance, quality, and momentum recovery; it does not plan peer work or implement code.

Supervisor calls root through Paseo with the `root` provider via `${PASEO_CLI:-paseo}`. Every fresh human request to call, summon, start, open, create, or "gọi" root creates a fresh root. It resumes an existing root only when the human explicitly names an existing root/session id or asks to continue/reuse it. Before launch, it reads `<repo>/config.model` when present, verifies the exact `[root]` provider/model/thinking values against the role provider catalog, and refuses guessed or unavailable model IDs. CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"` from `[root]`; MCP `paseo_create_agent` provider must be `<role>/<model>` and `settings.thinkingOptionId` must equal `[root].thinking`. Existing agents keep their original model/thinking; fresh work uses `config.model`, so stale-model roots are reused only when explicitly named.

Supervisor also owns `SUPERVISOR_NOTEBOOK.md`: a durable memory for coordination failures and anti-patterns observed while monitoring root. It appends lessons for tool-call loops, missing env/config, quota exhaustion, stalled root/peer waits, permission loops, stale sessions, or protocol friction, with observation, counterevidence, diagnosis, cost, existing coverage, correction candidate, and next comparable check.

For coding, TDD, bugfix implementation, test/proof, and code review, supervisor passes root the macro constraint that those slices are peer-default unless the human explicitly asks root to do them inline. Supervisor still does not plan or assign peer packets; root owns the split.

## When to reach for it

You invoke this by typing `/supervisor` — the agent will not reach for it on its own.

Use it when you want an agent to speak for you on project decisions, accept or reject root plans, recover lost momentum from git/session history, record reusable coordination lessons in `SUPERVISOR_NOTEBOOK.md`, and report evidence-backed progress.

## Where it fits

It sits above [root](https://aihero.dev/skills-root) and below the human. When unsure which ordinary skill fits, [ask-matt](https://aihero.dev/skills-ask-matt) remains the router.
