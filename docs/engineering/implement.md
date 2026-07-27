Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=implement
```

```bash
npx skills@latest update implement
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/implement)

## What it does

`implement` builds the work described in a spec or a set of tickets — reading the repo control docs, writing `ACTIVE_EXECUTION_PLAN.md`, driving test-driven slices, proving the work against policy, then handing off to review and committing to the current branch.

It does **not** decide what to build or silently change architecture. The spec is already settled, the seams are already agreed, and `ARCHITECTURE.md` / `RUNTIME_CONSTITUTION.md` / `PROCESS_AND_PROOF_POLICY.md` constrain execution. It is the hands, not the head — the thinking happened upstream.

## When to reach for it

You invoke this by typing `/implement` — the agent won't reach for it on its own.

Reach for it once the work is written down as a spec or split into tickets and you're ready to turn that into code. If the spec doesn't exist yet, write it first — for that, use [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) to break a spec into tickets. If you just want to build something test-first without a full spec, drop to [tdd](https://aihero.dev/skills-tdd) directly.

## Active plan and proof

`implement` starts by reading the control docs, then creates or resumes `ACTIVE_EXECUTION_PLAN.md`. That file is the live task memory: objective, included and excluded scope, architecture placement, affected runtime invariants, planned files, current step, risks, and verification commands. It is updated as the work changes, then archived or deleted when the task is finished so stale plans do not mislead the next agent.

The idea `implement` runs on is still the **seam** — the stable interface a feature is tested at, chosen before any code is written. It doesn't invent seams mid-build; it uses the ones already picked (during [to-spec](https://aihero.dev/skills-to-spec)) and writes tests against them via [tdd](https://aihero.dev/skills-tdd). The final claim of done must match `PROCESS_AND_PROOF_POLICY.md`: commands actually run, outcomes, missing checks, and unverified claims are all reported.

## Where it fits

`implement` is the build step near the end of the main chain, just before the review:

```txt
grill-with-docs → to-spec → to-tickets → implement → code-review
```

Reach for it after the work has been specced and sequenced, not before. Its key neighbours are [to-tickets](https://aihero.dev/skills-to-tickets), which produces tickets with architecture placement, runtime invariants, and required proof; [tdd](https://aihero.dev/skills-tdd), which it drives internally to write tests at each seam; and [code-review](https://aihero.dev/skills-code-review), which checks the diff and proof gate before the commit. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
