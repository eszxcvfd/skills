# Work Routing

Root-only contract for a detached Paseo Lead. Root must read this file before
planning, delegation, or edits. Peer agents must never read, quote, or request
it. Keep it short and project-specific.

Open only the smallest current document set needed:

- orientation and change routing: `ARCHITECTURE.md`;
- doc ownership and routing: `docs/README.md`;
- lane selection and proof: `docs/process/DEVELOPMENT.md`;
- current work queue: `docs/issues/ROADMAP.md`;
- non-trivial plans or durable coordination: `PLANS.md`;
- runtime or protocol ownership: `docs/architecture/RUNTIME.md` and
  `docs/architecture/NETCODE.md`;
- server-relevant resource and cook/package boundaries:
  `docs/architecture/CONTENT.md`.

Doctrine is editable repo truth. If governing docs are silent or stale, record
the bounded inference or update the canonical owner doc before relying on a
new rule.

`docs/process/DEVELOPMENT.md` owns lane selection, and `PLANS.md` owns the
conditions and contents for design notes and checked-in plans. Do not invent
another routing rule here. Do not trigger closeout for doc-only edits, small
owner-neutral fixes, or partial progress unless the governing plan requires it.

## Detached Root and Peer

The task prompt, project doctrine, artifacts, and explicit human follow-up are
the only authorities visible to Root. Root owns scope, plan, sequencing,
delegation, integration, acceptance, and the final decision. Root/Lead owns the
coordination method too: it may choose review, recon, dual-seat, sequencing,
topology, delegation, recovery, and acceptance tactics as needed. The
execution path is only:

```text
task prompt → detached Root → bounded Peer
```

Assess deviations by the result against the task, doctrine, and locked
boundaries; method choice alone is not a deviation. The examples above are
not a required workflow.

## Runtime

`config.model` contains only the project Root/Peer defaults. Verify the exact
provider/model/thinking tuple against the role catalog before a fresh launch.
Pass both `--model "$MODEL"` and `--thinking "$THINKING"`; for MCP use
`<configured-provider>/<model>`, keep model out of settings, and put thinking
in settings.thinkingOptionId.

Existing agents keep their original model/thinking; fresh work uses
`config.model`. Delegated work is never fire-and-forget: enable native
completion notification (`notifyOnFinish: true`) and wait at most 30 minutes.
For CLI use `--wait-timeout 30m`; for a background run immediately use
`paseo wait --timeout 1800 <agent-id>`. The completion notification releases
the parent, which then reads the terminal handoff and inspects the artifacts.
On timeout, mark the packet `BLOCKED` or time-limited. Use native
wait/log/inspect. Never call `paseo_create_agent` with a bare model id.

Peer packets must not ask Peer to read `WORKSPACE_PROTOCOL.md` or
`config.model`. Root sends only a sanitized packet-specific brief.

## Handoffs

```text
WORK_PACKET: <one bounded outcome>
GOAL: <observable result>
FILES_OR_SCOPE: <exact scope>
NON_GOALS: <exclusions>
PROOF: <command or scenario>
```

```text
PEER_STATUS: DONE|BLOCKED|REJECTED
CHANGED_FILES: <paths or none>
EVIDENCE: <commands and results>
RISKS: <remaining risks or none>
ROOT_ACTION_NEEDED: <next action>
```
