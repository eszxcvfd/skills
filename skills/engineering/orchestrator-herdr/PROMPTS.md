# Worker prompt + STATUS

Dispatch: `herdr agent send <name> "$(cat PROMPT.txt)"` then `herdr pane send-keys <pane_id> Enter`.

Orchestrator **must** open the skill’s SKILL.md and copy its steps/completion criteria into `SKILL_REQUIREMENTS` before send.

## Prompt template

```text
You are a worker under a Herdr orchestrator.

PRIMARY SKILL: «exact folder name»
SKILL_PATH: «path — open and follow this file»
Load SKILL_PATH. Obey every step and completion criterion below.
Do not chain other skills. Do not skip interview/research steps the skill requires.

PROJECT ROOT: «abs»
ARTIFACT_DIR: «.scratch/orchestrator/<run-id>/<worker>/»
STATUS_FILE: «ARTIFACT_DIR/STATUS.md»
Create ARTIFACT_DIR. Write skill outputs here when the skill has no fixed path. Never /tmp.

SKILL_REQUIREMENTS (from SKILL.md — execute all):
«- step / criterion 1
«- step / criterion 2
«- DONE WHEN / completion lines from the skill»

INPUTS (concrete):
«- paths, issue ids, prior artifacts»

USER INTENT:
«paragraph»

CONSTRAINTS:
- Only PRIMARY SKILL scope
- If blocked on human/approval: STATUS: blocked + BLOCKERS, stop
- When finished: write STATUS_FILE (schema below) and print the same block as final message

DONE WHEN:
- Every SKILL_REQUIREMENTS item satisfied, AND
- STATUS_FILE exists with schema below
```

## STATUS.md

```markdown
# STATUS

STATUS: done|blocked|failed
SKILL: «name»
WORKER: «name»
RUN_ID: «id»

## ARTIFACTS
- path   # orchestrator will open each

## VERIFY
- `cmd` → result

## NEXT_SKILL
none|«hint only»

## NEXT_INPUTS
- paths/ids for next worker

## BLOCKERS
none|question

## NOTES
- what changed, risks, what orch should re-check
```

`NEXT_SKILL` is a hint. Orchestrator ingests, quality-gates, then plans with the user.
