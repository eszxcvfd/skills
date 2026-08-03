---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along Standards and Spec axes, including architecture/runtime/proof control docs and a proof gate. Use when the user wants to review a branch, PR, work-in-progress changes, or asks to "review since X".
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards and control docs?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes run as separate review lanes. Under Paseo, root should assign them to independent peer reviewer packets; otherwise run them inline without Pi/Codex internal subagents.

The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` is missing.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here — not inside the review lanes.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. A path the user passed as an argument.
3. A PRD/spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** lane will skip and report "no spec available".

### 3. Identify the standards and control sources

Anything in the repo that documents how code should be written or constrained, such as `CODING_STANDARDS.md`, `CONTRIBUTING.md`, `ARCHITECTURE.md`, `RUNTIME_CONSTITUTION.md`, `PROCESS_AND_PROOF_POLICY.md`, relevant ADRs, and `ACTIVE_EXECUTION_PLAN.md` if present.

Treat the control docs as binding review inputs:

- `ARCHITECTURE.md` answers whether code went in the right module and respected allowed dependencies.
- `RUNTIME_CONSTITUTION.md` answers whether runtime invariants were preserved.
- `PROCESS_AND_PROOF_POLICY.md` answers what evidence is required before done can be claimed.
- `ACTIVE_EXECUTION_PLAN.md` answers whether the diff stayed within the active scope and ran the planned checks.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Run the two review lanes

Do not use Pi/Codex internal subagents. In a Paseo run, root assigns two `peer` reviewer packets. Outside Paseo, run the Standards lane and Spec lane inline, keeping their notes separate.

**Standards lane packet** — include:

- The full diff command and commit list.
- The list of standards/control-source files you found in step 3, **plus the smell baseline from step 3** pasted in full — the reviewer lane has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard or control doc: cite the source file and rule; (b) any architecture placement, runtime invariant, proof-policy, or active-plan scope issue; and (c) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard/control-doc breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 500 words."

**Spec lane packet** — include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec lane and note this in the final report.

### 5. Aggregate and proof-gate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_).

Then add a `## Proof Gate` section. Read `PROCESS_AND_PROOF_POLICY.md` and `ACTIVE_EXECUTION_PLAN.md` if present, list the required proof for the change types in the diff, and mark each as `provided`, `missing`, or `unverified`. If required proof is missing, the review cannot say the change is done even if Standards and Spec have no findings.

End with a one-line summary: total findings per axis, proof-gate status, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
