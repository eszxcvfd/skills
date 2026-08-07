---
name: implement
description: "Implement a spec or ticket through Work Routing, TDD, proof, review, and commit."
disable-model-invocation: true
---

# Implement

Implement the work described by the user in the spec or tickets. This is
execution, not architecture drift: follow Work Routing, prove each claim, then
commit. Do not create a second project-document system just to support this
skill.

Apply the red-green-refactor loop at pre-agreed seams. Use the promoted `/tdd`
skill when the task is explicitly test-first; implementation keeps the same
discipline inline for every proof-sized slice.

## Process

### 1. Work-routing preflight

Before editing production code, open only the smallest current set selected by
the project's Work Routing:

- `ARCHITECTURE.md` for placement, ownership, and dependency direction;
- `docs/README.md` for document ownership and the next routing edge;
- `docs/process/DEVELOPMENT.md` for the implementation lane and proof;
- `docs/issues/ROADMAP.md` when the queue or dependency frontier matters;
- `PLANS.md` when the work is non-trivial or needs durable coordination;
- `docs/architecture/RUNTIME.md`, `NETCODE.md`, or `CONTENT.md` only when
  the change touches those concerns;
- the relevant `CONTEXT.md`, ADR, spec, or ticket.

If a governing document is missing or stale, use the best bounded evidence and
update its canonical owner when the rule must survive this task. Do not create
a replacement control document or silently make a structural decision that a
missing document should have governed.

If the work would change module ownership, dependency direction, request/event flow, data ownership, public contracts, infrastructure, or another hard-to-reverse choice, stop and run `/architecture-council` before coding.

### 2. Use the project's plan owner only when needed

`PLANS.md` owns the conditions and contents for design notes and checked-in
plans. When that document says the work needs a durable plan, create or update
one there (or in the canonical plan location named by `docs/README.md`). For a
small or owner-neutral change, keep the working checklist in the ticket or
conversation. Use `.scratch/` only when the repository's own routing permits
an ephemeral note. Never create a project-wide active-plan file by default.

### 3. Build in proof-sized slices

Apply the red-green-refactor loop at the pre-agreed seams. For each slice:

1. Mark the current step in the approved ticket or plan, when one exists.
2. Write or identify the proof first when `docs/process/DEVELOPMENT.md`
   requires it.
3. Make the smallest production change that can satisfy that proof.
4. Run the targeted verification.
5. Record the command and outcome in the owner artifact, or report it in the
   final handoff when no durable plan is required.

Run typechecking regularly, single test files regularly, and the full test suite once at the end unless the policy says a narrower proof is enough or the repo cannot run the full suite. If you skip a required check, record why and call the result unverified.

### 4. Final proof gate

Before saying the work is done, compare the actual evidence against
`docs/process/DEVELOPMENT.md` and the affected runtime/protocol documents.

The final summary must include:

- changed files;
- affected architecture rules and runtime invariants;
- verification commands actually run with outcomes;
- required checks not run and why;
- remaining unverified claims, if any.

Do not claim done while required proof is missing. Say `blocked`, `partial`, or `unverified` instead.

### 5. Review and commit

Once proof is complete, use `/code-review` to review the work.

Then commit your work to the current branch.
