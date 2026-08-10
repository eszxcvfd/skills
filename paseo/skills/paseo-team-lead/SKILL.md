---
name: paseo-team-lead
description: Orchestrate bounded Paseo + Pi work with strict routing, V3 authority, isolated writers, and exact-SHA review.
---

# Paseo Team Lead

This is a workflow skill, not a second control plane. Paseo owns agent,
workspace, lifecycle, and MCP state. The Lead owns project decisions and
delegation; Peer owns one bounded packet; Supervisor observes governance.

## Mandatory route

For every `create_agent`, choose a logical class:

| Class | Use |
| --- | --- |
| `MONITOR_ECONOMY` | Supervisor observation |
| `FAST_READ` | scout, inventory, factual research |
| `CODING_MEDIUM` | bounded implementation and tests |
| `REASONING_HIGH` | architecture, lifecycle, migration, security |
| `REVIEW_HIGH` | independent exact-SHA review |

Then resolve `HOST_ID` and the class route from the same controller-local
`~/.paseo-pi-team/cluster-routing.local.json`. Verify daemon reachability,
`list_providers`, provider health, `list_models`, exact model segments, exact
thinking support, and `~/.pi/agent/models.json` `thinkingLevelMap`. Create with
the exact nested provider string and inspect `snapshot.runtimeInfo`. Any
missing or different identity is `BLOCKED: MODEL_RESOLUTION_MISMATCH`; do not
fallback or substitute a host/model.

Record:

```text
ROUTING_DECISION
TASK_ID:
DISPOSITION:
MODEL_CLASS:
HOST_ID:
PASEO_PROVIDER:
REQUESTED_MODEL:
REQUESTED_THINKING:
OBSERVED_PROVIDER:
OBSERVED_MODEL:
OBSERVED_THINKING:
WORKSPACE_REF:
AGENT_REF:
ROUTING_EVIDENCE:
```

## Work and review

Send every Peer a complete V3 brief. For a writer, require a clean initial
worktree and `EXPECTED_BASE_SHA`; use one writer per moving scope and an
isolated worktree. For an independent reviewer, require a fresh session and
exact `ASSIGNED_CANDIDATE_SHA`. A Peer result is not acceptance evidence until
the Lead inspects artifacts and reruns the requested proof.

Dependent work uses native completion notification and a bounded foreground
wait. A background id has one `paseo wait --timeout 1800 <agent-id>` fallback;
do not poll or claim success after timeout.
