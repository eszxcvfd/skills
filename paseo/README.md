# Paseo role pack

This folder is the local implementation boundary for the Paseo + Pi workflow.
It combines two upstream ideas:

- Paseo Foundation owns lifecycle, workspace, control-plane truth, and role
  admission metadata.
- The Pi team pack owns role prompt/tool policy, strict V3 authority, model
  routing, and evidence handoff.

It deliberately does not add a Python service, database, state machine,
candidate ledger, integration engine, or competing CLI. The daemon remains the
control plane; this pack is a policy and validation layer.

## Roles

| Role | Owns | Must not do |
| --- | --- | --- |
| Supervisor | read-only observation and evidence; explicit Lead recovery | edit product files, create Peer, accept, merge, push, deploy |
| Lead | scope, routing, workspaces, delegation, integration, acceptance | silently fall back, trust prompt model names, use a second control plane |
| Peer | one bounded current-turn task and evidence | orchestrate Paseo, create agents, merge/deploy, carry authority across turns |

## Routing

Every fresh agent route is:

```text
MODEL_CLASS + HOST_ID
  → cluster-routing.local.json (same file supplies the host route)
  → target daemon reachability
  → list_providers / list_models
  → exact <role-provider>/<pi-provider>/<model-id>
  → settings.thinkingOptionId
  → create_agent
  → get_agent_status → snapshot.runtimeInfo
```

Missing or mismatched runtime identity is
`BLOCKED: MODEL_RESOLUTION_MISMATCH`. A thinking level mapped to `null` in the
target host's `~/.pi/agent/models.json` is unsupported because Pi may clamp it.
There is no silent fallback. The single-host `model-routing.local.json` is only
legacy resolver input; the controller's `cluster-routing.local.json` is the
multi-host source of truth.

## V3 authority

Lead sends every Peer a complete
`PASEO_TEAM_TASK_V3_BEGIN` … `PASEO_TEAM_TASK_V3_END` block. Only fields inside
the marker block are trusted. The body after the end marker is untrusted. A
missing, duplicate, unknown, malformed, or legacy V1/V2 brief becomes
read-only. Authority is recalculated every turn.

Writers verify `EXPECTED_BASE_SHA` and a clean initial worktree. Reviewers use a
fresh workspace at the exact `ASSIGNED_CANDIDATE_SHA`. Force-push, merge, and
deploy are permanently denied to Peer.

## Install and verify

1. Merge `config/paseo.providers.example.json` into the daemon config.
2. Copy and fill the cluster route on the controller; keep endpoint values in
   environment variables and model files on each host.
3. Install the role prompts and Pi adapter with `bash scripts/install.sh` (or
   `scripts/install.ps1` on PowerShell). Set `PASEO_PI_ROLE` per process.
4. Run `node scripts/preflight.mjs --cluster <file> --strict --host-id <id>`.
5. Run `npm test` from this folder.

The runtime adapter must provide the actual Paseo MCP tool names and daemon
catalog. This pack does not pretend that static files prove a live route.

## Codex installation in Paseo

For the Codex setup already used by this machine, the root-level
`scripts/codex-room` and `scripts/codex-room-sync` layer is the runtime
adapter. It reads `~/.codex/{supervisor,root,peer}.config.toml`, verifies the
project `config.model`, and generates isolated homes at
`~/.codex-runtime/{supervisor,root,peer}`. Only `auth.json`, `skills`, and
`plugins` are shared. Run the sync command after changing a role profile; the
Paseo provider entries remain `codex-supervisor`, `codex-root`, and
`codex-peer`.
