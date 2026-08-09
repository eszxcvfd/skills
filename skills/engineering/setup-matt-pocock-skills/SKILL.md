---
name: setup-matt-pocock-skills
description: Configure this repo for the engineering skills — set up its issue tracker, triage label vocabulary, and domain doc layout. Run once before first use of the other engineering skills.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker** — where issues live (GitHub by default; local markdown is also supported out of the box)
- **Triage labels** — the strings used for the five canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them
- **Canonical project docs** — the Work Routing owner documents used by the repository

This is a prompt-driven skill, not a deterministic script. Explore, present
what you found, ask the user one section at a time, show the complete draft,
then write. Do not collapse Sections A, B, and C into one confirmation.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever
exists; don't assume:

- `git remote -v` and `.git/config` — is this a GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at the repo root — does either exist? Is there
  already an `## Agent skills` section in either?
- `ARCHITECTURE.md`, `docs/README.md`, `docs/process/DEVELOPMENT.md`,
  `docs/issues/ROADMAP.md`, `PLANS.md`, and relevant `docs/architecture/`
  owner docs;
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root;
- `docs/adr/` and any `src/*/docs/adr/` directories;
- `docs/agents/` — does this skill's prior output already exist?
- `.scratch/` — sign that a local-markdown issue tracker convention is already
  in use;
- Is the `triage` skill installed? (a `triage` skill folder alongside this one,
  or `triage` in your available skills.) This decides whether Section B runs at
  all.
- Monorepo signals — a `pnpm-workspace.yaml`, a `workspaces` field in
  `package.json`, or a populated `packages/*` with its own `src/`. Present only
  in a genuinely large multi-package repo; their absence means single-context,
  which is almost every repo.
- `WORKSPACE_PROTOCOL.md` and `config.model` when the repo uses the detached
  Paseo Root/Peer runtime.
- the local Paseo/Codex prerequisites when the user uses detached roles:
  `paseo --version`, `codex --version`, `~/.codex/config.toml`,
  `~/.codex/{supervisor,root,peer}.config.toml`, the supported
  `codex-profile` launcher, and the relevant `~/.paseo/config.json` provider
  entries;

### 2. Present findings and ask

Summarise what's present and what's missing. Then take the sections in order —
one section, one answer, then the next.

Lead each section with the recommended answer so the user can accept it in a
word. Give a one-line explainer only when the choice genuinely branches; skip
the section entirely when exploration already settled it (Section B when
`triage` isn't installed, Section C when there is no monorepo).

Do not write any file while Sections A, B, or C are still being answered.

#### Section A — Issue tracker

> Explainer: The "issue tracker" is where issues live for this repo. Skills
> like `to-tickets`, `triage`, and `to-spec` read from and write to it — they
> need to know whether to call `gh issue create`, write a markdown file under
> `.scratch/`, or follow some other workflow you describe. Pick the place you
> actually track work for this repo.

Default posture: these skills were designed for GitHub. If a `git remote`
points at GitHub, propose that. If a `git remote` points at GitLab
(`gitlab.com` or a self-hosted host), propose GitLab. Otherwise (or if the
user prefers), offer:

- **GitHub** — issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab** — issues live in the repo's GitLab Issues (uses the [`glab`](https://gitlab.com/gitlab-org/cli) CLI)
- **Local markdown** — issues live as files under `.scratch/<feature>/` in this repo (good for solo projects or repos without a remote)
- **Other** (Jira, Linear, etc.) — ask the user to describe the workflow in one paragraph; record it as freeform prose

Record the choice in `docs/agents/issue-tracker.md`. The GitHub and GitLab
templates carry a "PRs as a request surface" flag, defaulted **off** — leave it
off and don't raise it; a user who wants external PRs in the triage queue can
flip the flag in the file later.

#### Section B — Triage label vocabulary

Skip this section entirely if the `triage` skill isn't installed — an uninstalled
skill needs no labels.

If it is installed, ask exactly one question:

> Do you want to keep the default triage labels? (recommended: **yes**)

The defaults are the five canonical roles, each label string equal to its name:
`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.
On **yes**, write them as-is. Only if the user says no — usually because their
tracker already uses other names (e.g. `bug:triage` for `needs-triage`) — collect
the overrides so `triage` applies existing labels instead of creating
duplicates.

#### Section C — Domain docs

Default to **single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root.
This fits almost every repo; write it without asking.

Offer **multi-context** — a root `CONTEXT-MAP.md` pointing to per-context
`CONTEXT.md` files — only when exploration found monorepo signals. Then confirm
which layout they want.

The eight Work Routing owner documents are initialized as part of the selected
layout, without adding another question:

- `ARCHITECTURE.md`;
- `docs/README.md`;
- `docs/process/DEVELOPMENT.md`;
- `docs/issues/ROADMAP.md`;
- `PLANS.md`;
- `docs/architecture/RUNTIME.md`;
- `docs/architecture/NETCODE.md`;
- `docs/architecture/CONTENT.md`.

#### Section D — Paseo workspace and role profiles

Run this section when the repository uses Paseo or the user asks for the
detached Root/Peer/Supervisor workflow. Lead with **enable the complete Paseo
bootstrap** as the recommended answer and ask one question:

> Should setup create the project `config.model` and `WORKSPACE_PROTOCOL.md`,
> the machine-local `supervisor.config.toml`, `root.config.toml`, and
> `peer.config.toml`, the registered Paseo role providers, and the external
> Supervisor notebook? (recommended: **yes**)

On **yes**, include every project and machine-local target in the draft. On
**no**, still create the project `config.model` and `WORKSPACE_PROTOCOL.md`,
but report the explicitly declined machine-local targets as omitted. Do not
silently treat missing profiles, providers, or notebook as a complete Paseo
setup.

The three profile files use the local machine baseline plus the matching role
instructions; they are not `.codex/agents/*.toml` and must not be replaced by
editing an agent instruction file. Use
[templates/paseo-profiles.md](./templates/paseo-profiles.md) and the supplied
Paseo profile guide for their exact shape.

The Supervisor notebook is operator-side state and must be stored outside the
project under `$CODEX_HOME/supervisor-notebooks/<repo-slug>/`. It must never be
linked from Root-facing project documents or passed to Root/Peer.

The generated role boundary has only a few fixed invariants: Root/Lead owns
coordination method and acceptance; Supervisor only observes and alerts the
human on material result deviation; Peer executes one sanitized Root packet.
Root must read `WORKSPACE_PROTOCOL.md` before planning, while Peer must never
read, quote, or request that Root-only document. Do not turn the Supervisor
into a second project command path.

Keep capability guidance role-scoped: Supervisor gets routing and Paseo
lifecycle guidance; Root gets task-matching engineering skills; Peer gets only
the skills and public files named by its Root packet. Supervisor remains
observer-only and never becomes a second project command path.

Make the Supervisor-to-Root launch message human-facing. Carry the owner's
language, intent, tone, uncertainty, and decisions as if the owner were
speaking directly to Root. Use the prompt-leverage discipline selectively:
identify the real job, then add only the context, work expectations, tool/file
rules, verification, and done condition that improve execution. Prefer natural
prose over a fixed `ROOT_BRIEF` schema, do not invent human decisions, and keep
Root's coordination method autonomous. This applies to the launch message only;
do not impose a response style or fixed report format on Root unless the owner
actually asked for one.

Keep prompt transport lossless: when a task arrives with literal `\\n` escape
sequences standing in for prose line breaks, decode those to real newlines
before launching Root or forwarding a packet. Preserve escapes inside code,
regexes, paths, JSON examples, and other literal values; never pass a
JSON-serialized or `repr`-style prompt to Paseo.

Delegation must use Paseo's native completion signal: fresh Root/Peer launches
enable `notifyOnFinish: true` and wait no longer than 30 minutes. A background
launch is immediately followed by `paseo wait --timeout 1800 <agent-id>`;
timeouts are reported as blocked or time-limited, never as success.

`CONTEXT.md` and ADR files remain domain content. Create them when the
repository has terms or consequential decisions to record; do not create
empty placeholders solely because setup ran.

#### Required output invariant

There is no minimal-document mode. A setup run is incomplete unless its draft
and final report include every required output below:

- the selected `CLAUDE.md` or `AGENTS.md`;
- `docs/agents/issue-tracker.md`;
- `docs/agents/domain.md`;
- all eight Work Routing owner documents listed above;
- `docs/agents/triage-labels.md` when `triage` is installed;
- `WORKSPACE_PROTOCOL.md` and `config.model`;
- when Section D is enabled: `~/.codex/supervisor.config.toml`,
  `~/.codex/root.config.toml`, `~/.codex/peer.config.toml`, the three Paseo
  provider registrations, the supported `codex-profile` launcher, and the
  external Supervisor notebook.

An existing required document may be classified as `keep` only after checking
that it is present, substantive, and current. Otherwise classify it as
`create` or `update`; never omit it because the repository did not have it
before setup.

### 3. Confirm and edit

After Sections A, B, and C are settled, show the user a complete draft of:

- the `## Agent skills` block to add to whichever of `CLAUDE.md` / `AGENTS.md`
  is being edited (see step 4 for selection rules);
- the contents of `docs/agents/issue-tracker.md`,
  `docs/agents/domain.md`, and `docs/agents/triage-labels.md` (the last only
  when `triage` is installed);
- a compact manifest of the eight canonical owner documents and any existing
  overwrite diffs;
- the contents of `WORKSPACE_PROTOCOL.md` and `config.model`;
- when Section D applies, the three profile TOMLs, provider-registration diffs,
  launcher target, and external notebook path/content.

Let the user edit the draft before writing. If they change a choice, update the
affected draft and show it again; do not restart unrelated sections.

### 4. Write

**Pick the file to edit:**

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask the user which one to create — don't pick for them.

Never create `AGENTS.md` when `CLAUDE.md` already exists (or vice versa) —
always edit the one that's already there.

If an `## Agent skills` block already exists in the chosen file, update its
contents in-place rather than appending a duplicate. Don't overwrite user
edits to the surrounding sections.

The block:

```markdown
## Agent skills

### Issue tracker

[one-line summary of where issues are tracked]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary of the label vocabulary]. See `docs/agents/triage-labels.md`.

### Domain docs

[one-line summary of layout — "single-context" or "multi-context"]. See `docs/agents/domain.md`.
```

Include the `### Triage labels` sub-block, and write
`docs/agents/triage-labels.md`, only when `triage` is installed and Section B
ran. When it isn't, both are omitted.

Then write the docs files using the seed templates in this skill folder as a
starting point:

- [issue-tracker-github.md](./issue-tracker-github.md) — GitHub issue tracker
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md) — GitLab issue tracker
- [issue-tracker-local.md](./issue-tracker-local.md) — local-markdown issue tracker
- [triage-labels.md](./triage-labels.md) — label mapping (only if `triage` is installed)
- [domain.md](./domain.md) — domain doc consumer rules + layout
- [templates/paseo-profiles.md](./templates/paseo-profiles.md) — role profiles,
  Paseo registration, and the external Supervisor notebook seed

For "other" issue trackers, write `docs/agents/issue-tracker.md` from scratch
using the user's description.

For the canonical owner documents, use the matching sections in
[templates/canonical-docs.md](./templates/canonical-docs.md). Replace generic
bootstrap text with verified repository facts. If a fact is not established,
record `Not established yet` and what would establish it; never invent project
architecture, process, runtime, protocol, or content details. Create or update
all eight canonical files in the same write pass, preserving unrelated user
content and existing decisions.

Always write `WORKSPACE_PROTOCOL.md` and `config.model` in the same pass. Keep
those project files limited to project doctrine, Root ownership, and bounded
Peer execution; do not put an upstream observer or operator status protocol in
them.

When Section D is enabled, write or update the three machine-local profile
files, the three Paseo provider entries, the supported launcher target, and the
external notebook in the same confirmed setup operation. Preserve unrelated
machine configuration, never commit machine-local files, and never create the
notebook inside the project.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read
from these files. Verify that all eight canonical owner documents,
`WORKSPACE_PROTOCOL.md`, and `config.model` are present and non-empty, and that
`docs/agents/domain.md` routes to them. When Section D was enabled, verify all
three profile files, provider registrations, launcher, and external notebook
too; otherwise report each declined or unavailable target explicitly. Mention
they can edit `docs/agents/*.md` and the canonical owner docs directly later —
re-running this skill is only necessary if they want to switch issue trackers,
change domain layout, rebuild the setup, or repair the Paseo machine bootstrap.
