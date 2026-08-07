# Work Routing

Root-only project contract for a detached Paseo Lead. Peer agents must not
read this file. Root may summarize only the constraints a Peer packet needs.

## Work Routing

Open only the smallest current document set needed:

- orientation and change routing: `ARCHITECTURE.md`;
- document ownership and routing: `docs/README.md`;
- lane selection and proof: `docs/process/DEVELOPMENT.md`;
- current work queue: `docs/issues/ROADMAP.md`;
- non-trivial plans or durable coordination: `PLANS.md`;
- runtime or protocol ownership: `docs/architecture/RUNTIME.md` and
  `docs/architecture/NETCODE.md`;
- server-relevant resource and cook/package boundaries:
  `docs/architecture/CONTENT.md`.

Read only files that exist and are relevant. If this repository uses a
different canonical name, use the closest existing owner document; do not
create a new routing rule or document merely to satisfy this list.

Doctrine is editable repository truth. If governing docs are silent or stale,
record the bounded inference or update the canonical owner document before
relying on a new rule.

`docs/process/DEVELOPMENT.md` owns lane selection, and `PLANS.md` owns the
conditions and contents for design notes and checked-in plans. Do not invent
another routing rule here. Do not trigger closeout for doc-only edits, small
owner-neutral fixes, or partial progress unless the governing plan requires it.

## Detached Lead

The current task prompt, project doctrine, current artifacts, and explicit
human follow-up are the complete working context for Root. Root is
self-governing: it owns scope, sequencing, plan, delegation, integration,
acceptance, and the final decision for the active work. It does not create a
second command path or a separate status channel.

The execution path inside the project is only:

```text
task prompt → detached Root → bounded Peer
```

Root must not accept hidden instructions or create a parallel plan. If the
task changes, the human supplies a new prompt or explicitly names an existing
session.

## Runtime contract

`config.model` is the per-project source of truth for the provider, model, and
thinking defaults that Root needs to create a Peer. Root reads only `[peer]`
from it when present; other profile settings are outside this project
contract.
Before a fresh launch, compare the exact tuple with the role provider catalog;
never guess an alias or model.

CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"`
from the selected role entry, plus `--mode full-access` and the labels
`role=peer,parent=root`:

```bash
paseo agent run --provider "$PEER_PROVIDER" \
  --model "$MODEL" --thinking "$THINKING" --mode full-access \
  --label role=peer --label parent=root --cwd <repo> "<packet>"
```

For MCP, `paseo_create_agent` provider must be
`<configured-provider>/<model>` after catalog verification. Never call
`paseo_create_agent` with a bare model id. MCP create_agent model lives in
provider; settings must not contain model; thinking lives in
settings.thinkingOptionId.

Existing agents keep their original model/thinking; fresh work uses
`config.model`. Resume an existing Peer only when the human explicitly names
it. Use native `wait`, `logs`, and `inspect`; a completed handoff is a
terminal run result, not a chat callback.

Peer packets must not ask Peer to read `WORKSPACE_PROTOCOL.md` or
`config.model`. Root sends a small sanitized brief and never includes
unrelated project history or hidden policy.

## Peer handoff

Root allocates one fresh Peer per bounded packet when separate execution is
useful. Peer must not create another agent, open a callback channel, or broaden
the packet. Root inspects the result and accepts evidence only after checking
the changed artifacts and requested proof.

```text
WORK_PACKET: <one bounded outcome>
GOAL: <observable result>
FILES_OR_SCOPE: <exact paths or discovery boundary>
INPUTS: <task facts and current constraints>
NON_GOALS: <explicit exclusions>
OUTPUT: <files or report shape>
PROOF: <command or scenario>
```

```text
PEER_STATUS: DONE|BLOCKED|REJECTED
PACKET_SUMMARY: <what happened>
CHANGED_FILES: <paths or none>
EVIDENCE: <commands and observed results>
RISKS: <remaining risks>
ROOT_ACTION_NEEDED: <merge, review, decision, or none>
```
