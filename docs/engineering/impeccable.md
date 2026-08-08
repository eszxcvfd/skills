Quickstart:

```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can install the skill set with `npx skills@latest add eszxcvfd/skills`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/impeccable) · [Upstream Impeccable](https://github.com/pbakaus/impeccable)

## What it does

Impeccable gives an agent one frontend-design surface for shaping, building,
critiquing, auditing, and polishing interfaces across websites, product UIs,
dashboards, forms, and responsive surfaces. Its command references cover both
visual direction and production concerns such as accessibility, performance,
copy clarity, motion, typography, and edge cases.

The defining constraint is durable design context plus bounded verification:
load the project and surface context before acting, use the reference that owns
the requested command, and inspect the result in a finite visual pass instead
of endlessly polishing from memory.

## When to reach for it

Type `/impeccable`, or the agent reaches for it automatically when a task fits.
Reach for it when the work changes frontend visual language or UX quality —
new surfaces, redesigns, responsive behaviour, accessibility, interaction
polish, design-system extraction, or a visual audit. For a backend or deep
module boundary question, use [codebase-design](https://aihero.dev/skills-codebase-design)
instead; for a throwaway artifact that answers a state or design question, use
[prototype](https://aihero.dev/skills-prototype).

## Prerequisites

For a new project or a new visual world, start with `/impeccable init` so the
skill can capture `PRODUCT.md` and offer the project-level design context. An
existing project can proceed from its incumbent code and add durable context
afterward with `document`; a `DESIGN.md` or surface brief is useful but not a
blocker for a narrow refinement.

## Context, modes, and commands

The leading idea is **bounded craft**. Impeccable chooses the surface mode —
Persuade, Operate, Read, or Experience — then routes to a focused command such
as `shape`, `craft`, `critique`, `audit`, `polish`, `harden`, `layout`, or
`adapt`. The command owns the relevant playbook, so the agent does not carry a
large undifferentiated design checklist into every task.

The skill also includes deterministic detector rules and optional live browser
iteration. They are quality signals around the implementation, not a
replacement for product truth or the repository's engineering proof.

## Where it fits

Impeccable is a reach-for-it-anytime frontend craft and UX quality skill. It
sits beside [prototype](https://aihero.dev/skills-prototype) for exploratory
visual questions and [code-review](https://aihero.dev/skills-code-review) for
reviewing the resulting code and proof. For the complete route through these
skills, use [ask-matt](https://aihero.dev/skills-ask-matt).
