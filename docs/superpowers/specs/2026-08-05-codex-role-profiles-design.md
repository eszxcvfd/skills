# Codex role profiles through Paseo

## Goal

Run Paseo's supervisor, root, and peer roles through Codex without sharing
role-local runtime state, while keeping one shared login and one shared machine
baseline. The repository remains the source of truth for role instructions and
routing defaults; machine-local Codex configuration remains the source of truth
for MCP, trusted projects, TUI, sandbox, and plugin settings.

## Decisions

- Register `codex-supervisor`, `codex-root`, and `codex-peer` as Paseo derived
  providers extending the built-in `codex` provider.
- Make those aliases the providers in the repository's `config.model` entries.
- Normalize all three Codex model values to the installed Codex slug
  `gpt-5.6-luna`. Preserve role-specific reasoning levels: `medium` for
  supervisor, `max` for root, and `high` for peer.
- Keep `.codex/agents/{supervisor,root,peer}.toml` as the checked-in source for
  each role's developer instructions. Runtime configs are generated from these
  files and are not committed.
- Use the current `~/.codex/config.toml` as the runtime baseline. Do not copy
  machine-specific paths into the repository.
- Use `~/.codex-runtime/<role>` as the isolated `CODEX_HOME` for each role.
  Each runtime owns its config, logs, state, cache, and session data.
- Symlink only shared login and capability trees from `~/.codex`: `auth.json`,
  `skills`, and `plugins`.
- Keep the existing Pi providers available in Paseo; do not remove them. The
  role entries in `config.model` select the Codex aliases for fresh hierarchy
  work.

## Components and responsibilities

### Checked-in role profiles

`.codex/agents/*.toml` already contain the role descriptions and developer
instructions used by Codex. Their `model_reasoning_effort` values will match the
role defaults above. No second instruction source is introduced.

### `scripts/codex-room-sync`

The sync command accepts the repository root and optionally the Codex home,
then creates all three role runtimes. For each role it:

1. validates the shared baseline with Python's standard-library TOML parser;
2. reads the matching checked-in role profile and validates required fields;
3. copies the baseline text while replacing the top-level `model` and
   `model_reasoning_effort` values;
4. writes the role's `developer_instructions` as a TOML-safe value;
5. creates or refreshes symlinks to shared `auth.json`, `skills`, and `plugins`;
6. uses a temporary file and atomic rename for each generated config.

The command fails before changing a role if the baseline, role, model, or role
name is invalid. It never copies credentials or mutable shared state.

### `scripts/codex-room`

The launcher accepts exactly one role before Codex arguments. It validates the
role, requires the corresponding synced config, sets `CODEX_HOME` to that role's
runtime, and `exec`s the real `codex` binary with all remaining arguments. It
has no fallback to the shared home, preventing accidental cross-role state
sharing.

### Paseo custom providers

Each provider uses a command override equivalent to:

```json
["codex-room", "<role>"]
```

Paseo appends `app-server`, so the effective process is
`codex-room <role> app-server`. The provider continues to use Codex's native
app-server client and model negotiation; the wrapper only selects
`CODEX_HOME`.

## Data flow

```text
config.model role entry
        |
        v
Paseo codex-<role> provider
        |
        v
codex-room <role> app-server
        |
        v
CODEX_HOME=~/.codex-runtime/<role>
        |
        +--> role config generated from ~/.codex/config.toml + .codex/agents/<role>.toml
        +--> shared auth.json / skills / plugins via symlink
        +--> role-local state, logs, cache, and sessions
```

`codex-room-sync` is explicit and idempotent. It is run after changing the
baseline or role profiles and before launching a role. The launcher refuses an
unsynced runtime instead of silently using the shared home.

## Repository contract updates

The Paseo contract checker and the public root/supervisor/peer guidance will
refer to the provider value read from `config.model`, not hardcode the old
`root`, `supervisor`, and `peer` provider IDs. Labels and hierarchy semantics
remain `role=supervisor|root|peer`; provider identity and role identity stay
separate.

The existing peer boundary remains unchanged: peer does not read
`WORKSPACE_PROTOCOL.md` or `config.model`, does not create subagents, and
returns its terminal `PEER_STATUS` result to root.

## Failure handling

- Unknown role: fail with the accepted role list.
- Missing baseline or role profile: fail before writing runtime files.
- Invalid TOML or missing required profile fields: fail with the source path.
- Missing shared auth/skills/plugins target: fail rather than creating a local
  replacement.
- Missing synced runtime at launch: fail with the exact sync command.
- Paseo config update: create a timestamped backup before writing and preserve
  unrelated provider entries.

No compatibility provider aliases are added to `config.model`; `codex-*` is the
clean cutover selected for this project. Existing Pi provider definitions remain
available only as explicit Paseo choices, not as hidden fallbacks.

## Verification

- Parse every generated role config and inspect its model, reasoning level, and
  developer instructions.
- Assert each runtime has an independent regular config file and the three
  required symlinks target the shared Codex home.
- Run each launcher with `--version` (or an equivalent non-session probe) and
  observe the role-specific `CODEX_HOME` without creating a session.
- Validate Paseo config JSON and confirm all three derived providers extend
  `codex` with the expected command arguments.
- Run the repository Paseo contract test and the existing focused test suite.
