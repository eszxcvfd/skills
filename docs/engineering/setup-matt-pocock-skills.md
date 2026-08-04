Quickstart:

```bash
claude plugin marketplace add --scope project eszxcvfd/skills
claude plugin install --scope project mattpocock-skills@eszxcvfd
```

```bash
claude plugin update --scope project mattpocock-skills@eszxcvfd
```

Non-Claude agents can copy just this skill with `npx skills@latest add eszxcvfd/skills --skill=setup-matt-pocock-skills`.

[Source](https://github.com/eszxcvfd/skills/tree/main/skills/engineering/setup-matt-pocock-skills)

## What it does

`setup-matt-pocock-skills` teaches one repo how the engineering skills should behave in it — where issues live, what the triage labels are called, where the domain docs sit, which root control docs govern architecture/runtime/proof/execution, which supervisor notebook records coordination lessons, and which Paseo model defaults supervisor/root/peer should use.

It writes config, it does not hard-code behaviour. The engineering chain assumes `docs/agents/` config, root control docs, `WORKSPACE_PROTOCOL.md`, `SUPERVISOR_NOTEBOOK.md`, and `config.model` exist; this skill is the one-time bootstrap that produces them, discovered from your actual repo (`git remote`, existing labels, existing `CONTEXT.md`, existing control docs) and confirmed with you rather than guessed. It is prompt-driven — explore, present what it found, confirm, then write — not a deterministic scaffold.

## When to reach for it

You invoke this by typing `/setup-matt-pocock-skills` — the agent won't reach for it on its own.

Reach for it **once per repo, before the first use of any other engineering skill**. If [triage](https://aihero.dev/skills-triage), [to-spec](https://aihero.dev/skills-to-spec), or [to-tickets](https://aihero.dev/skills-to-tickets) start guessing where your issues live or applying labels that don't exist, they haven't been set up here yet. Re-run it only to switch issue trackers or start over — day-to-day tweaks are edits to `docs/agents/*.md`, root control docs, `SUPERVISOR_NOTEBOOK.md`, or `config.model`.

## The setup decisions

It leads each with a recommended answer you can accept in a word, and skips whatever it can already infer — so most runs are a couple of quick confirmations:

- **Issue tracker** — where work is tracked, so `triage`/`to-spec`/`to-tickets` know whether to call `gh`, `glab`, write markdown under `.scratch/`, or follow a workflow you describe. GitHub, GitLab, local markdown, or other. (It proposes the one that matches your `git remote`.)
- **Triage labels** — asked only if the `triage` skill is installed, and then just: keep the default labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`)? Say no only if your tracker already uses other names, so `triage` applies real ones instead of creating duplicates.
- **Domain docs** — assumed single-context (one `CONTEXT.md` + `docs/adr/` at the root), which fits almost every repo; it only raises a multi-context map when it spots monorepo signals.
- **Control docs** — `ARCHITECTURE.md`, `RUNTIME_CONSTITUTION.md`, `PROCESS_AND_PROOF_POLICY.md`, `WORKSPACE_PROTOCOL.md`, and `SUPERVISOR_NOTEBOOK.md` are created from seed templates when missing. `ACTIVE_EXECUTION_PLAN.md` is not created during setup unless active work is starting; `/implement` owns it per task.
- **Supervisor notebook** — `SUPERVISOR_NOTEBOOK.md` is supervisor-owned memory for reusable coordination lessons: tool failures, missing env/config, quota exhaustion, stalled waits, permission loops, stale sessions, and protocol friction.
- **Paseo model config** — `config.model` is created when missing so each repo can choose supervisor/root/peer provider, model, and thinking defaults without editing prompts or global Paseo config.

The output is a set of files under `docs/agents/` — `issue-tracker.md`, `domain.md`, and `triage-labels.md` when `triage` is installed — root control docs, `WORKSPACE_PROTOCOL.md`, `SUPERVISOR_NOTEBOOK.md`, `config.model`, plus an `## Agent skills` block pointing to them in whichever of `CLAUDE.md` / `AGENTS.md` the repo already uses. Those files are the shared substrate the rest of the toolkit stands on.

## It's working if

- `issue-tracker.md` and `domain.md` land under `docs/agents/` (plus `triage-labels.md` when `triage` is installed), root control docs exist when missing, `WORKSPACE_PROTOCOL.md`, `SUPERVISOR_NOTEBOOK.md`, and `config.model` exist, and an `## Agent skills` section appears in your `CLAUDE.md` or `AGENTS.md`.
- The tracker it proposes matches your real `git remote`, the labels match strings that already exist in your repo, and `config.model` names providers/models available from Paseo.
- Afterwards, `triage` and `to-tickets` act on the right place with the right labels, while supervisor/root create downstream Paseo agents with the repo's chosen model defaults instead of prompt-hardcoded model IDs and supervisor records reusable coordination failures in `SUPERVISOR_NOTEBOOK.md`.

## Where it fits

`setup-matt-pocock-skills` is a **run-once setup** — the foundation the whole engineering set stands on, not a step you repeat. Its neighbours are the skills that read what it writes: [supervisor](https://aihero.dev/skills-supervisor), because it uses `SUPERVISOR_NOTEBOOK.md`, `WORKSPACE_PROTOCOL.md`, and `config.model`; [root](https://aihero.dev/skills-root), because it uses `WORKSPACE_PROTOCOL.md` and `config.model`; [triage](https://aihero.dev/skills-triage), because it applies the label vocabulary configured here; [to-spec](https://aihero.dev/skills-to-spec) / [to-tickets](https://aihero.dev/skills-to-tickets), because they publish into the issue tracker and carry control notes forward; and [implement](https://aihero.dev/skills-implement), because it follows the proof policy and active execution plan. Run it first; everything downstream assumes it has. When you're unsure which skill or flow fits, [ask-matt](https://aihero.dev/skills-ask-matt) routes you.
