# Workspace Protocol — example

```text
WORKSPACE_PROTOCOL_VERSION: 1
PROJECT_ID:
PROJECT_CRITICALITY: low | medium | high
DEFAULT_BRANCH:
REPOSITORY_REMOTE:

LEAD_WRITE_POLICY: denied
MERGE_OWNER: human | named-integration-owner
DEPLOY_OWNER: human | external-system

MODEL_POLICY:
MONITOR_ECONOMY:
FAST_READ:
CODING_MEDIUM:
REASONING_HIGH:
REVIEW_HIGH:

MACHINE_TOPOLOGY:
PRIMARY_HOST:
REVIEW_HOST:

GIT_POLICY:
ONE_WRITER_PER_MOVING_SCOPE: true
WRITER_WORKTREE_REQUIRED: true
TASK_BRANCH_PATTERN: agent/<task-id>
FORCE_PUSH: denied
PEER_MERGE: denied
PEER_DEPLOY: denied

REVIEW_POLICY:
EXACT_SHA_REQUIRED: true
FRESH_REVIEW_WORKSPACE: true
REVIEWER_MUST_BE_NEW_SESSION: true

ACCEPTANCE_EVIDENCE:
- candidate SHA
- clean worktree
- required test output
- independent review when required
- residual risks
```

Paseo owns lifecycle/workspace/control-plane state. Role prompts and this
briefing layer do not become a second authority system.
