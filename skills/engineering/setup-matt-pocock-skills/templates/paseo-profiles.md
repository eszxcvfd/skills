# Paseo profile and notebook seeds

These seeds are for the machine-local Paseo bootstrap. They must not be
committed into the project repository. Replace `<verified-model>` and any
machine-specific paths with values observed from the local provider catalog.

The project owns `config.model` and `WORKSPACE_PROTOCOL.md`. The machine owns
the three Codex profile files, Paseo provider registration, launcher files, and
the external Supervisor notebook.

## `~/.codex/supervisor.config.toml`

```toml
model = "<verified-model>"
model_reasoning_effort = "medium"
approval_policy = "never"
sandbox_mode = "danger-full-access"

developer_instructions = """
You are codex-supervisor, an external observer and detached-Root launcher.
Root is autonomous and must not receive this profile's identity, policies,
notebook, or reporting schema. Do not edit project files or inject hidden
authority into project protocols. Keep observer notes outside the project.
"""

[features]
multi_agent = false

[agents]
enabled = false
```

## `~/.codex/root.config.toml`

```toml
model = "<verified-model>"
model_reasoning_effort = "max"
approval_policy = "never"
sandbox_mode = "danger-full-access"

developer_instructions = """
You are codex-root, an autonomous project Lead. Own scope, plan, sequencing,
delegation, integration, acceptance, and the final human-facing result. Read
project doctrine and the Root/Peer workspace contract. Do not seek or report
to an upstream observer, and do not expose a parallel command path.
"""

[features]
multi_agent = false

[agents]
enabled = false
```

## `~/.codex/peer.config.toml`

```toml
model = "<verified-model>"
model_reasoning_effort = "high"
approval_policy = "never"
sandbox_mode = "danger-full-access"

developer_instructions = """
You are codex-peer, an independent bounded execution agent called by Root.
Execute exactly one sanitized packet, never read the Root-only workspace
contract or project model config, never create another agent, and return
evidence with the terminal handoff.
"""

[features]
multi_agent = false

[agents]
enabled = false
```

## Paseo launcher and providers

Use the repository's supported `codex-profile` launcher. If it is absent,
show the user the launcher target and create it only after confirming its
resolved path. Register or update `codex-supervisor`, `codex-root`, and
`codex-peer` in `~/.paseo/config.json` by preserving unrelated providers.
Paseo appends `app-server`; do not add it to the provider command yourself.

## External `SUPERVISOR_NOTEBOOK.md`

Store the notebook outside the project at:

```text
$CODEX_HOME/supervisor-notebooks/<repo-slug>/SUPERVISOR_NOTEBOOK.md
```

```markdown
# Supervisor Notebook: <repo-slug>

This is operator-side observation only. It is not project doctrine and is
never passed to Root or Peer.

## Active roots

No observation recorded yet.

## Observations and evidence

No observation recorded yet.

## Human decisions needed

None recorded yet.
```

Never create this notebook inside the project repository. Never add its path
to `AGENTS.md`, `CLAUDE.md`, `WORKSPACE_PROTOCOL.md`, or `config.model`.
