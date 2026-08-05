# Codex Role Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route Paseo's supervisor, root, and peer roles through isolated Codex runtimes that share the existing Codex login and machine baseline.

**Architecture:** Add three Paseo derived providers (`codex-supervisor`, `codex-root`, `codex-peer`) whose command override invokes a role-aware launcher. The launcher selects `~/.codex-runtime/<role>` as `CODEX_HOME`; a separate sync utility generates each runtime config from the current `~/.codex/config.toml` plus the checked-in role profile and symlinks only shared `auth.json`, `skills`, and `plugins`.

**Tech Stack:** Python 3.11 standard library (`tomllib`, `configparser`, `json`, `pathlib`), POSIX shell, TOML, Paseo JSON config, pytest.

---

## Files and boundaries

- Create: `scripts/codex-room-sync` — deterministic, atomic runtime generation; owns TOML validation, role config projection, and shared symlink setup.
- Create: `scripts/codex-room` — strict role selection and `CODEX_HOME` process wrapper; owns no config generation.
- Modify: `.codex/agents/supervisor.toml` — set `model_reasoning_effort = "medium"` while preserving instructions.
- Modify: `.codex/agents/root.toml` — set `model_reasoning_effort = "max"` while preserving instructions.
- Modify: `.codex/agents/peer.toml` — set `model_reasoning_effort = "high"` while preserving instructions.
- Modify: `config.model` — use `codex-supervisor`, `codex-root`, `codex-peer` and `gpt-5.6-luna` for every role; preserve `medium/max/high` thinking.
- Modify: `scripts/check-paseo-contract.py` — validate `provider=codex-<role>` and accept the new launch-contract wording.
- Modify: `tests/test_check_paseo_contract.py` — fixture the new provider/model contract and retain legacy-contract coverage.
- Create: `tests/test_codex_room.py` — unit/integration tests for sync output, atomic failure boundaries, symlinks, and launcher environment/argv forwarding.
- Modify: `WORKSPACE_PROTOCOL.md`, `.codex/agents/{root,supervisor,peer}.toml`, `skills/engineering/{root,supervisor,peer,ask-matt}/SKILL.md`, `docs/engineering/{root,supervisor,peer,ask-matt}.md`, and matching setup seed — refer to provider values from `config.model` and use `codex-*` in concrete examples.
- Modify: `skills/engineering/architecture-council/SKILL.md`, `skills/engineering/architecture-council/scripts/test-paseo-root-council.sh`, and any generated Codex metadata that hardcodes `--provider root|peer|supervisor` — make launch examples use the configured role provider while retaining `role=root|peer|supervisor` labels.
- Machine-only: `~/.paseo/config.json` — add three derived provider entries with backup; do not commit this file.
- Machine-only: `~/.local/bin/codex-room` and `~/.local/bin/codex-room-sync` — symlinks to the repository scripts.
- Machine-only: `~/.codex-runtime/{supervisor,root,peer}` — generated runtime state; do not commit or symlink mutable state back into `~/.codex`.

## Task 1: Define sync and launcher behavior with failing tests

**Files:**
- Create: `tests/test_codex_room.py`

- [ ] **Step 1: Add sync fixture helpers and the first failing test**

Create temporary inputs with:

```python
BASELINE = '''model = "gpt-5.6-luna"
model_reasoning_effort = "medium"

[features]
hooks = true
'''

PROFILE = '''name = "root"
description = "test root"
model_reasoning_effort = "max"
developer_instructions = """
ROOT_INSTRUCTIONS
"""
'''
```

The first test invokes `scripts/codex-room-sync` with `--repo-root`,
`--codex-home`, and `--runtime-root`, then asserts that the generated root
config parses with `tomllib`, has `model == "gpt-5.6-luna"`, has
`model_reasoning_effort == "max"`, and contains `ROOT_INSTRUCTIONS`.

- [ ] **Step 2: Run the focused test and verify the expected RED failure**

Run:

```bash
pytest -q tests/test_codex_room.py::test_sync_generates_role_config_and_shared_links
```

Expected: collection or subprocess failure because `scripts/codex-room-sync`
does not exist yet. Fix only test setup errors; do not add implementation.

- [ ] **Step 3: Add the remaining behavior tests before implementation**

Add tests for these observable contracts:

1. `test_sync_generates_all_roles_with_role_specific_reasoning` creates all
   three role profiles and a baseline containing a table, runs sync, and asserts
   all generated configs parse, retain `[features].hooks`, and use
   `medium/max/high` from `config.model`.
2. `test_sync_creates_only_required_shared_symlinks` asserts each runtime's
   `auth.json`, `skills`, and `plugins` are symlinks resolving to the shared
   Codex home, while `config.toml` is a regular file.
3. `test_sync_rejects_invalid_provider_before_mutating_runtime` writes a bad
   `[peer].provider`, pre-seeds a sentinel runtime config, expects non-zero exit,
   and asserts the sentinel remains unchanged.
4. `test_sync_rejects_missing_shared_target` omits `plugins` and asserts a
   non-zero exit without creating any role runtime.
5. `test_launcher_sets_role_home_and_forwards_arguments` creates a fake
   executable named `codex` in a temporary `PATH`, creates a synced root
   config, invokes `scripts/codex-room root --version --flag`, and asserts the
   fake executable observed `CODEX_HOME=<runtime>/root` and argv
   `--version --flag`.
6. `test_launcher_rejects_unknown_or_unsynced_role` asserts unknown roles and
   missing `config.toml` fail without invoking the fake Codex executable.

Use `subprocess.run(..., check=False, text=True, capture_output=True)` and
assert on exit status plus stable stderr fragments; do not mock the wrapper's
process boundary.

- [ ] **Step 4: Run all new tests and verify they fail for missing behavior**

Run:

```bash
pytest -q tests/test_codex_room.py
```

Expected: failures only for the absent sync/launcher implementation, not TOML
fixture or assertion errors.

## Task 2: Implement atomic role runtime synchronization

**Files:**
- Create: `scripts/codex-room-sync`
- Test: `tests/test_codex_room.py`

- [ ] **Step 1: Add the executable Python entry point and constants**

Use `#!/usr/bin/env python3`, `argparse`, `configparser`, `os`, `re`, `shutil`,
`tempfile`, `tomllib`, and `pathlib`. Define the fixed roles
`("supervisor", "root", "peer")`, derive the repository default from
`Path(__file__).resolve().parents[1]`, and default homes to `~/.codex` and
`~/.codex-runtime` after `expanduser()`.

- [ ] **Step 2: Implement complete preflight validation**

Before creating or replacing any runtime file:

- require the baseline `config.toml`, `auth.json`, `skills`, and `plugins`;
- parse the repo `config.model` with `ConfigParser` and require each role;
- require `provider == f"codex-{role}"`, a non-empty model, and one of the
  configured thinking values `medium`, `max`, or `high`;
- parse `.codex/agents/<role>.toml` with `tomllib` and require non-empty
  `name`, `model_reasoning_effort`, and `developer_instructions`;
- require the profile reasoning value to equal `config.model`'s `thinking`;
- reject an existing runtime link path when it is a real file/directory rather
  than a symlink; permit replacement of generated `config.toml` and role
  directories.

Raise a user-facing `SyncError` with the source path and reason; `main()` prints
`codex-room-sync: <reason>` to stderr and returns `1`.

- [ ] **Step 3: Implement top-level baseline projection**

Keep the baseline text and remove only existing top-level `model`,
`model_reasoning_effort`, and `developer_instructions` assignments. Insert the
role values before the first TOML table so they remain top-level keys, then
append a TOML multiline `developer_instructions` value before that first table.
Reject instruction content containing `"""` rather than emitting ambiguous TOML.
Parse the projected text with `tomllib` and assert the three role values before
writing it.

- [ ] **Step 4: Implement atomic writes and safe symlink replacement**

For each role, create its runtime directory, write the projected config to a
same-directory temporary file with mode `0600`, flush it, `os.fsync()` it, and
replace `config.toml` with `os.replace()`. For each shared target, unlink only
an existing symlink and create a new absolute symlink. Never delete a regular
file or directory. Exit non-zero on any unsafe path.

- [ ] **Step 5: Run the sync tests and verify GREEN**

Run:

```bash
pytest -q tests/test_codex_room.py
```

Expected: all sync tests pass; launcher tests remain red because Task 3 has not
implemented the wrapper.

## Task 3: Implement the strict Codex room launcher

**Files:**
- Create: `scripts/codex-room`
- Test: `tests/test_codex_room.py`

- [ ] **Step 1: Implement role and runtime checks**

Use POSIX shell with `set -eu`. Require at least one argument and accept only
`supervisor`, `root`, or `peer`; print usage and exit `64` otherwise. Resolve
`CODEX_RUNTIME_ROOT` from the environment or `$HOME/.codex-runtime`, require
`$CODEX_RUNTIME_ROOT/$role/config.toml` to be a regular file, resolve `codex`
with `command -v`, reject a missing or identical wrapper path, export
`CODEX_HOME`, shift the role, and `exec "$codex_bin" "$@"`. Do not call sync
implicitly and do not fall back to `$HOME/.codex`.

- [ ] **Step 2: Run launcher tests and verify GREEN**

Run:

```bash
pytest -q tests/test_codex_room.py
```

Expected: every sync and launcher test passes with no subprocess warnings.

## Task 4: Cut over repository role routing and contract checks

**Files:**
- Modify: `config.model`
- Modify: `.codex/agents/{supervisor,root,peer}.toml`
- Modify: `scripts/check-paseo-contract.py`
- Modify: `tests/test_check_paseo_contract.py`
- Modify: `WORKSPACE_PROTOCOL.md`
- Modify: `skills/engineering/{root,supervisor,peer,ask-matt}/SKILL.md`
- Modify: `docs/engineering/{root,supervisor,peer,ask-matt}.md`
- Modify: `skills/engineering/setup-matt-pocock-skills/workspace-protocol.md`
- Modify: `skills/engineering/architecture-council/SKILL.md`
- Modify: `skills/engineering/architecture-council/scripts/test-paseo-root-council.sh`
- Modify: matching `.agents/skills/**` generated/symlinked contract files if they are real files rather than symlinks

- [ ] **Step 1: Write the contract test expectation first**

Update `write_project()` so a valid fixture has:

```ini
[supervisor]
provider=codex-supervisor
model=gpt-5.6-luna
thinking=medium

[root]
provider=codex-root
model=gpt-5.6-luna
thinking=max

[peer]
provider=codex-peer
model=gpt-5.6-luna
thinking=high
```

Add an assertion that a valid project with these aliases passes and a fixture
with `provider=root` fails the provider-contract check. Run:

```bash
pytest -q tests/test_check_paseo_contract.py
```

Expected: the new valid fixture fails against the old checker.

- [ ] **Step 2: Update checker validation minimally**

Change the provider assertion to require `provider == f"codex-{role}"` and
change required wording to say launch commands use the configured provider
value while labels retain the role name. Keep all legacy phrase checks and all
MCP model/thinking checks intact.

- [ ] **Step 3: Update role guidance at the source**

Replace hardcoded launch examples with:

```bash
ROLE_PROVIDER="$(python3 -c 'import configparser; c=configparser.ConfigParser(); c.read("config.model"); print(c["peer"]["provider"])')"
paseo agent run --provider "$ROLE_PROVIDER" --model "$MODEL" --thinking "$THINKING" \
  --label hierarchy=paseo --label role=peer --label parent=root --cwd <repo> "<WORK_PACKET>"
```

For supervisor/root examples, read the matching section and retain the role
label (`role=root` or `role=supervisor`). MCP examples must use
`<configured-provider>/<model>`, never a bare model ID. Keep the peer ban on
reading `WORKSPACE_PROTOCOL.md` and `config.model`.

- [ ] **Step 4: Update architecture-council launch checks**

The architecture council launches the configured root provider, not a literal
`root` provider. Keep the required `--model "$MODEL"`,
`--thinking "$THINKING"`, `--background`, and `role=root` label. Update its
shell test to assert the configured-provider form and remove only the obsolete
literal-provider assertion.

- [ ] **Step 5: Run contract tests and repository checker**

Run:

```bash
pytest -q tests/test_check_paseo_contract.py
python3 scripts/check-paseo-contract.py .
```

Expected: both pass; the checker reports `PASS paseo contract`.

## Task 5: Install wrappers, register Paseo providers, and generate runtimes

**Files:**
- Machine-only: `~/.local/bin/codex-room`
- Machine-only: `~/.local/bin/codex-room-sync`
- Machine-only: `~/.paseo/config.json`
- Machine-only: `~/.codex-runtime/{supervisor,root,peer}/`

- [ ] **Step 1: Install PATH symlinks without overwriting unrelated files**

For each destination, if it is a real file/directory, stop. Otherwise create or
refresh a symlink to the repository script:

```bash
ln -sfn /home/trung/Documents/2026/project/skills/scripts/codex-room ~/.local/bin/codex-room
ln -sfn /home/trung/Documents/2026/project/skills/scripts/codex-room-sync ~/.local/bin/codex-room-sync
```

Verify both symlinks resolve to the checked-in files.

- [ ] **Step 2: Back up and update Paseo provider JSON**

Create a timestamped copy of `~/.paseo/config.json`, parse it as JSON, and
insert/replace only these keys under `.agents.providers`:

```json
"codex-supervisor": {
  "extends": "codex",
  "label": "Codex Supervisor",
  "description": "Codex supervisor role with isolated runtime",
  "command": ["codex-room", "supervisor"]
},
"codex-root": {
  "extends": "codex",
  "label": "Codex Root",
  "description": "Codex root role with isolated runtime",
  "command": ["codex-room", "root"]
},
"codex-peer": {
  "extends": "codex",
  "label": "Codex Peer",
  "description": "Codex peer role with isolated runtime",
  "command": ["codex-room", "peer"]
}
```

Write JSON through a temporary file and atomic rename. Preserve all unrelated
keys and leave the current Pi role providers intact. Do not restart a running
Paseo daemon without explicit approval.

- [ ] **Step 3: Run the sync command against the real baseline**

Run:

```bash
~/.local/bin/codex-room-sync \
  --repo-root /home/trung/Documents/2026/project/skills \
  --codex-home "$HOME/.codex" \
  --runtime-root "$HOME/.codex-runtime"
```

Expected: three successful role summaries. Inspect each generated TOML with
`python3 -c 'import tomllib, pathlib; ...'` and assert the common model,
role-specific reasoning, and non-empty developer instructions.

- [ ] **Step 4: Verify runtime link topology**

For every role, assert `config.toml` is regular and the three shared entries are
symlinks resolving to `$HOME/.codex/{auth.json,skills,plugins}`. Assert no role
runtime symlinks to another role runtime.

- [ ] **Step 5: Run non-session launcher smoke tests**

Run each role with the installed binary's version probe:

```bash
~/.local/bin/codex-room supervisor --version
~/.local/bin/codex-room root --version
~/.local/bin/codex-room peer --version
```

Expected: Codex prints its version and exits successfully for all three roles;
no session state is created in the shared home.

## Task 6: Final verification and review

**Files:**
- No new files; inspect all changed files and generated machine state.

- [ ] **Step 1: Run the focused test set**

```bash
pytest -q tests/test_codex_room.py tests/test_check_paseo_contract.py
python3 scripts/check-paseo-contract.py .
```

Expected: all tests pass and the checker prints `PASS paseo contract`.

- [ ] **Step 2: Validate JSON and provider shape**

Use `python3`/`jq` to assert the three Paseo entries have `extends == "codex"`
and exact command arrays, and that the backup file exists. Do not claim live
catalog discovery if the daemon is stopped; report that limitation explicitly.

- [ ] **Step 3: Review the final diff boundaries**

Confirm the repository's pre-existing user edit to `config.model` was migrated
only to the approved Codex alias/common-model contract, no `~/.codex` secret or
machine-local config was added to git, and no generated runtime appears under
this repository. Leave unrelated working-tree changes untouched.

- [ ] **Step 4: Commit repository implementation only**

Stage the scripts, tests, role/config/contract updates, and any required docs;
exclude all `~/.paseo`, `~/.codex-runtime`, and symlink artifacts. Use a focused
commit message such as `feat: add isolated Codex Paseo role profiles`.
