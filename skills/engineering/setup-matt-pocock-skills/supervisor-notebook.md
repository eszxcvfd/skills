# Supervisor Notebook

Durable cross-workspace record of coordination behavior, failure lessons, and protocol experiments. This is not a task tracker, transcript, or project decision log.

## Working method

- Record only behavior tied to a concrete workspace episode.
- Every monitored failure becomes a lesson: tool-call failure loops, missing env/config, quota exhaustion, idle waits, permission loops, stale sessions, or coordination anti-patterns.
- Capture the cause while the evidence is fresh; do not leave only the symptom.
- Separate observation, counterevidence, diagnosis, and cost.
- Check existing instruction coverage before proposing more prose.
- Prefer authority, information-surface, or deterministic integration corrections over incident-specific rules.
- Brief the project owner before changing profiles, protocols, or integration.
- Evaluate an approved change against the next comparable workstream.

## Active patterns

| ID | Pattern | State | First workspace | Likely owner |
|----|---------|-------|-----------------|--------------|
| P001 | Outcome ownership collapses into procedural work-order framing | applied | nova | Root profile and salience |
| P002 | Lifecycle waiting substitutes status for bounded progress evidence | applied | nova | Root profile and control-plane events |
| P003 | Root creates ownership outside the visible workspace | observed | o2skin | capability boundary and integration |
| P004 | A role seat launches under a generic provider and falls into permission ceremony | applied | nova | role-provider mapping and full-access launch mode |
| P005 | Finish routing can strand completed seats outside Root attention | adopted | o2skin, fantasy, nova | Paseo notification routing and lifecycle persistence |
| P006 | Composed design and review gates starve implementation | applied | nova | skill triggers, root gate proportionality, and workspace protocol |
| P007 | Broad review briefs plus raw tool dumps exhaust reviewer context | observed | nova | Root review scoping and provider output shaping |

## Failure lessons

Append new lessons below. Keep entries short, factual, and reusable.

### FL000 — Template

- Date:
- Workspace:
- Trigger:
- Observation:
- Counterevidence:
- Diagnosis:
- Cost:
- Existing coverage:
- Correction candidate:
- Next comparable check:
