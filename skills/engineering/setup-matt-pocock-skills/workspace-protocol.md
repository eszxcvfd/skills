# Work Routing

Root-only contract for a detached Paseo Lead. Peer agents must not read this
file. Keep it short and project-specific.

## Work Routing

Open only the smallest current document set needed:

- `ARCHITECTURE.md` for orientation and change routing;
- `docs/README.md` for document ownership and routing;
- `docs/process/DEVELOPMENT.md` for lane selection and proof;
- `docs/issues/ROADMAP.md` for the current queue;
- `PLANS.md` for non-trivial plans or durable coordination;
- `docs/architecture/RUNTIME.md`, `NETCODE.md`, and `CONTENT.md` for runtime,
  protocol, and resource boundaries.

Read only files that exist and are relevant. Use the repository's canonical
equivalent when a name differs; do not create a new routing rule just to fill
this list. Doctrine is editable repository truth. If it is silent or stale,
record the bounded inference or update the canonical owner document first.

`docs/process/DEVELOPMENT.md` owns lane selection and proof. `PLANS.md` owns
design-note and checked-in-plan conditions. Do not trigger closeout for
doc-only edits, small owner-neutral fixes, or partial progress unless the
governing plan requires it.

## Detached Root and Peer

The task prompt, project doctrine, artifacts, and explicit human follow-up are
the only authorities visible to Root. Root owns scope, plan, sequencing,
delegation, integration, acceptance, and the final decision. The execution
path is only:

```text
task prompt → detached Root → bounded Peer
```

## Runtime

`config.model` contains only the project Root/Peer defaults. Verify the exact
provider/model/thinking tuple against the role catalog before a fresh launch.
Pass both `--model "$MODEL"` and `--thinking "$THINKING"`; for MCP use
`<configured-provider>/<model>`, keep model out of settings, and put thinking
in settings.thinkingOptionId.

Existing agents keep their original model/thinking; fresh work uses
`config.model`. Use native wait/log/inspect. Never call
`paseo_create_agent` with a bare model id.

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
