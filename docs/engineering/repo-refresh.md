Quickstart:

```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy just this skill with `npx skills@latest add eszxcvfd/skills --skill=repo-refresh`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/repo-refresh)

## What it does

Repo refresh is an explicit repository-wide cleanup skill. It removes stale documentation, completed plans, dead proof machinery, scripts, fixtures, tests, and generated debris only after current truth and live references are accounted for.

## When to reach for it

You invoke this by typing `/repo-refresh` — the agent will not reach for it on its own.

Reach for it when you explicitly want to clean a repo around current production truth rather than preserve historical clutter.

## Where it fits

It is standalone cleanup. It complements [root](https://aihero.dev/skills-root), which can assign cleanup peer packets, and [ask-matt](https://aihero.dev/skills-ask-matt), which routes ordinary work.
