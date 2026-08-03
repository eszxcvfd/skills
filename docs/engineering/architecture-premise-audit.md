Quickstart:

```bash
npx skills@latest add eszxcvfd/skills --skill=architecture-premise-audit
```

```bash
npx skills@latest update architecture-premise-audit
```

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/architecture-premise-audit)

## What it does

Architecture premise audit is the broad-system check for a wrong foundation. It asks whether the product is built around the right system archetype before trusting repository vocabulary, internal module boundaries, passing tests, or benchmark evidence.

It is read-only unless you separately request changes, and it reports only premise-level findings backed by production evidence.

## When to reach for it

Type `/architecture-premise-audit`, or the agent reaches for it automatically only when you explicitly ask for a broad premise audit of a whole project or named system.

Reach for it when the suspected problem is not one module smell but a possible wrong product model: the repo may be optimizing a mechanism that should not exist, putting ownership in the wrong layer, or paying platform tax without a product responsibility.

## Premise before vocabulary

The leading move is to derive the expected product atlas first. The skill maps jobs, owners, lifecycle, trust boundaries, scaling variables, failure behavior, and platform-versus-application responsibility before accepting the repo's names for itself.

The output leads with a verdict such as `KEEP_FOUNDATION`, `REPAIR_FIRST`, `REDIRECT_RECOMMENDED`, `STOP_AND_REDIRECT`, or `INSUFFICIENT_EVIDENCE`, then shows the expected-versus-observed map and the few findings that justify the verdict.

## It's working if

- The audit names the product boundary and assumptions before reading the repo as truth.
- Findings explain the hidden premise and amplification route, not just generic complexity.
- Each serious finding includes a counterargument and falsifier.
- The report stops when ingress, state, durable effects, expensive work, and external outputs are covered or explicitly excluded.

## Where it fits

It is a standalone architecture audit for foundation-level suspicion. Use [structural-antipatterns](https://aihero.dev/skills-structural-antipatterns) for ordinary design-control review, [codebase-design](https://aihero.dev/skills-codebase-design) for module/interface shaping, and [architecture-council](https://aihero.dev/skills-architecture-council) before committing to an architecture decision. [ask-matt](https://aihero.dev/skills-ask-matt) routes the wider set.
