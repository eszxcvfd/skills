```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy this skill with `npx skills@latest add eszxcvfd/skills --skill=wizard`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/wizard)

## What it does

`wizard` turns a tedious manual procedure into a guided, repeatable shell
journey. It opens the right URLs, captures values, confirms irreversible steps,
and writes environment values or CI secrets where they belong.

It authors only the stages. The shared template owns progress, secret input,
cross-platform URL opening, idempotent environment updates, and the closing
summary.

## When to reach for it

You invoke this by typing `/wizard`; the agent will not reach for it on its own.

Reach for it when a human must complete a third-party setup, one-off migration,
or A-to-B state transition. For an automated code change, use
[implement](https://aihero.dev/skills-implement); for a repository-wide setup
conversation, use [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills).

## The stage contract

Each stage names the human action, the value it produces, where that value is
written, and whether it is secret. The generated script is checked with
`bash -n` and static tracing; it is not run end to end by the agent because it
opens browsers and waits for human input.

## Where it fits

`wizard` is a reach-for-it-anytime standalone for the manual edge of an
engineering workflow. It pairs with [setup-matt-pocock-skills](https://aihero.dev/skills-setup-matt-pocock-skills)
when setup needs human-held credentials, and with [ask-matt](https://aihero.dev/skills-ask-matt)
when the correct workflow is unclear.
