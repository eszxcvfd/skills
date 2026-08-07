```bash
npx skills@latest add eszxcvfd/skills
```

Select `implement` when prompted, along with the agent you want to install it for.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/implement)

## What it does

`implement` builds the work described in a spec or a set of tickets — following
Work Routing, driving test-driven slices, proving the work against the
project's proof owner, then handing off to review and committing to the
current branch.

It does **not** decide what to build or silently change architecture. The spec
is already settled, the seams are already agreed, and the routed owner docs —
usually `ARCHITECTURE.md`, `docs/architecture/RUNTIME.md`, and
`docs/process/DEVELOPMENT.md` — constrain execution. It is the hands, not the
head — the thinking happened upstream.

## When to reach for it

You invoke this by typing `/implement` — the agent won't reach for it on its own.

Reach for it once the work is written down as a spec or split into tickets and you're ready to turn that into code. If the spec doesn't exist yet, write it first — for that, use [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) to break a spec into tickets. If you just want to build something test-first without a full spec, drop to [tdd](https://aihero.dev/skills-tdd) directly.

## Plan and proof

`implement` starts with the smallest document set selected by Work Routing. If
the work is non-trivial, `PLANS.md` decides whether a durable plan or design
note is required and what it contains. Small changes stay in their ticket or
conversation; the skill does not create a project-wide active-plan file.

The idea `implement` runs on is still the **seam** — the stable interface a
feature is tested at, chosen before any code is written. It doesn't invent
seams mid-build; it uses the ones already picked (during
[to-spec](https://aihero.dev/skills-to-spec)) and writes tests against them
via [tdd](https://aihero.dev/skills-tdd). The final claim of done must match
`docs/process/DEVELOPMENT.md`: commands actually run, outcomes, missing
checks, and unverified claims are all reported.

## Where it fits

`implement` is the build step near the end of the main chain, just before the review:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Reach for it after the work has been specced and sequenced, not before. Its key neighbours are [to-tickets](https://aihero.dev/skills-to-tickets), which produces tickets with architecture placement, runtime invariants, and required proof; [tdd](https://aihero.dev/skills-tdd), which it drives internally to write tests at each seam; and [code-review](https://aihero.dev/skills-code-review), which checks the diff and proof gate before the commit. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
