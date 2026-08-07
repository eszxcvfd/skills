# Engineering

Promoted engineering skills for code work, architecture, delivery, and the
Paseo roles. `WORKSPACE_PROTOCOL.md` is the single Root/Peer project contract:
detached Root owns planning and integration, while Peer owns bounded
task-local execution and evidence. The observer role is operator-side and does
not add project doctrine.

## User-invoked

Reachable only when the human types them (`disable-model-invocation: true` in
`SKILL.md` and `policy.allow_implicit_invocation: false` in
`agents/openai.yaml`).

- **[ask-matt](./ask-matt/SKILL.md)** — Route an unclear engineering request to the right skill or SLP role.
- **[setup-matt-pocock-skills](./setup-matt-pocock-skills/SKILL.md)** — Configure the issue tracker, Work Routing, detached Paseo contract, and model defaults.
- **[wayfinder](./wayfinder/SKILL.md)** — Turn a large foggy effort into decision tickets until the route is clear.
- **[grill-with-docs](./grill-with-docs/SKILL.md)** — Sharpen a plan through a one-question interview while recording decisions.
- **[to-spec](./to-spec/SKILL.md)** — Synthesize an aligned conversation into a spec with placement, invariants, and proof.
- **[to-tickets](./to-tickets/SKILL.md)** — Split a spec into tracer-bullet tickets with blocking edges and proof.
- **[implement](./implement/SKILL.md)** — Execute a settled spec or ticket with TDD, proof, review, and commit discipline.
- **[improve-codebase-architecture](./improve-codebase-architecture/SKILL.md)** — Find and explore deepening opportunities in an existing codebase.
- **[triage](./triage/SKILL.md)** — Move issues and external PRs through the configured triage state machine.
- **[wizard](./wizard/SKILL.md)** — Generate an interactive shell wizard for a manual setup or one-off transition.
- **[supervisor](./supervisor/SKILL.md)** — Observe Paseo lifecycle and launch detached Root sessions from outside the project.
- **[root](./root/SKILL.md)** — Act as the autonomous Lead (runtime `codex-root`) that plans, delegates, integrates, and accepts.
- **[peer](./peer/SKILL.md)** — Execute one bounded Root packet with task-local engineering judgment and evidence handback.

## Model-invoked

Model- or user-reachable when the task matches their trigger boundary.

- **[architecture-council](./architecture-council/SKILL.md)** — Gate architecture decisions with independent proposals, challenge, verification, and a verdict.
- **[codebase-design](./codebase-design/SKILL.md)** — Provide the deep-module vocabulary: interface, depth, seam, adapter, leverage, and locality.
- **[domain-modeling](./domain-modeling/SKILL.md)** — Sharpen domain language, scenarios, context, and consequential decisions.
- **[diagnosing-bugs](./diagnosing-bugs/SKILL.md)** — Run a tight reproduce, minimise, hypothesise, instrument, fix, and regression loop.
- **[research](./research/SKILL.md)** — Investigate a question against primary sources and preserve cited findings.
- **[tdd](./tdd/SKILL.md)** — Drive implementation through a red-green-refactor loop at public seams.
- **[prototype](./prototype/SKILL.md)** — Build a throwaway artifact that answers a design or state-model question.
- **[code-review](./code-review/SKILL.md)** — Review a fixed-point diff across Standards, Spec, and proof.
- **[resolving-merge-conflicts](./resolving-merge-conflicts/SKILL.md)** — Resolve an active merge or rebase conflict by preserving intent.
