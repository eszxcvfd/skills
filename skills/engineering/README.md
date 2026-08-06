# Engineering

Skills I use daily for code work. The promoted surface currently has thirteen
skills, within the requested 10–15 range. Paseo role instructions for
`codex-supervisor`, `codex-root`, and
`codex-peer` live separately under `skills/misc/` and are wired into their
profiles.

## User-invoked

Reachable only when you type them (Claude Code: `disable-model-invocation: true`; Codex: `policy.allow_implicit_invocation: false` in `agents/openai.yaml`).

- **[ask-matt](./ask-matt/SKILL.md)** — Ask which active engineering skill or preserved specialized workflow fits the situation.
- **[setup-matt-pocock-skills](./setup-matt-pocock-skills/SKILL.md)** — Configure this repo's issue tracker, control docs, `WORKSPACE_PROTOCOL.md`, `SUPERVISOR_NOTEBOOK.md`, and `config.model`.
- **[wayfinder](./wayfinder/SKILL.md)** — Map a very large, foggy effort as decision tickets until the route is clear.
- **[grill-with-docs](./grill-with-docs/SKILL.md)** — Sharpen a plan through a one-question-at-a-time interview while recording terms and decisions.
- **[to-spec](./to-spec/SKILL.md)** — Turn an aligned conversation into a spec with architecture placement, invariants, and proof.
- **[to-tickets](./to-tickets/SKILL.md)** — Split a spec or plan into tracer-bullet tickets with blocking edges and required proof.
- **[implement](./implement/SKILL.md)** — Build a settled spec or ticket with an active execution plan, TDD, proof policy, review, and commit.

## Model-invoked

Model- or user-reachable (rich trigger phrasing so the model can reach for them).

- **[architecture-council](./architecture-council/SKILL.md)** — Mandatory pre-code gate for architecture decisions and unclear architectural next steps.
- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)** — Disciplined diagnosis loop for hard bugs and performance regressions.
- **[research](./research/SKILL.md)** — Investigate questions against high-trust primary sources and leave cited findings.
- **[tdd](./tdd/SKILL.md)** — Drive implementation with a red-green-refactor loop and seam-level proof.
- **[prototype](./prototype/SKILL.md)** — Build a throwaway artifact to answer a design or state-model question.
- **[code-review](./code-review/SKILL.md)** — Review a fixed-point diff along Standards and Spec axes, including the proof gate.

The three Paseo role sources are intentionally not promoted as user skills:
`skills/misc/supervisor`, `skills/misc/root`, and `skills/misc/peer` remain
repository references; the matching Codex profiles contain their role
instructions inline.
