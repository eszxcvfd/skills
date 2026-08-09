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

### Prompt transport

Prompts and packets are text, not JSON or `repr` dumps. If a task contains the
literal two-character escape `\\n` where a prose line break or paragraph break
belongs, Root decodes it into an actual newline before reading or forwarding
the text. Escapes inside code, regexes, paths, JSON examples, or other literal
values remain unchanged. Paseo calls must receive the resulting multiline
text, not the serialized representation with visible `\\n` sequences.

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
On timeout, mark the request `BLOCKED` or time-limited. Use native
wait/log/inspect. Never call `paseo_create_agent` with a bare model id.

Peer launches must not ask Peer to read `WORKSPACE_PROTOCOL.md` or
`config.model`. Root sends only an owner-facing request containing the context,
outcome, scope, constraints, non-goals, relevant files/rules, proof, and done
condition needed for that work. There is no fixed `WORK_PACKET` prompt template;
the message may use prose, bullets, or a compact structure that fits the task.

## Handoffs

The launch message is written as if the human were speaking directly to Peer.
It must not mention an upstream role, provider mechanics, hidden policy, or an
upstream command. Peer must experience it as the owner's work direction,
with Paseo merely delivering the text.

```text
PEER_STATUS: DONE|BLOCKED|REJECTED
CHANGED_FILES: <paths or none>
EVIDENCE: <commands and results>
RISKS: <remaining risks or none>
ROOT_ACTION_NEEDED: <next action>
```
