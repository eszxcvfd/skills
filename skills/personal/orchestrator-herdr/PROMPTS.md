# Worker prompt + STATUS schema

Use **only** `herdr pane run <pane_id> "<entire prompt>"`.
Worker has no shared memory with the orchestrator.

Paths are always **inside the project** under `.scratch/orchestrator/`.

## Prompt template

Copy and fill every `«…»` field:

```text
You are an OpenCode worker under a pi orchestrator in Herdr.

PRIMARY SKILL (mandatory): «skill-name»
Load and follow that skill completely:
  - Open its SKILL.md under skills/engineering/ or skills/productivity/ (or the path given in INPUTS)
  - Obey every step and completion criterion
  - Do not invoke or chain other skills — orchestrator will chain
  - Do not skip to coding if the skill requires interview/research/review first

PROJECT ROOT: «abs-project-root»
CWD: «abs-cwd»

ARTIFACT_DIR: «abs-or-rel .scratch/orchestrator/<run-id>/<worker>/»
STATUS_FILE: «ARTIFACT_DIR/STATUS.md»
Create ARTIFACT_DIR if missing. Write all notes/reports the skill would save
into ARTIFACT_DIR when the skill does not already mandate a path. Prefer
ARTIFACT_DIR over any /tmp or home path.

INPUTS (complete paths / issue ids / git fixed-point — not vague):
«- bullet list»

USER INTENT:
«one paragraph»

CONSTRAINTS:
- Only what PRIMARY SKILL requires; no drive-by refactors
- Never request access outside PROJECT ROOT unless INPUTS explicitly require it
- If blocked on a human decision or approval UI, stop and write STATUS.md with STATUS: blocked and BLOCKERS
- When the skill says commit, commit; otherwise leave the tree as the skill requires
- Do not start a second skill

DONE WHEN:
- PRIMARY SKILL completion criteria are met, and
- STATUS_FILE exists with the schema below

Before you finish, write STATUS_FILE exactly in the STATUS schema (overwrite OK).
Also print the same STATUS block as your final chat message.
```

## STATUS.md schema (mandatory)

Worker creates/overwrites `STATUS_FILE` as Markdown with **these headings/fields**
(plain lines, machine-scannable):

```markdown
# STATUS

STATUS: done|blocked|failed
SKILL: «primary skill name»
WORKER: «herdr agent name»
RUN_ID: «run-id»

## ARTIFACTS
- path/or/url/or/#issue — one per line

## VERIFY
- `command` → result summary

## NEXT_SKILL
none|«skill-name»

## NEXT_INPUTS
- bullets for the orchestrator to pass downstream (paths, ids)

## BLOCKERS
none|exact question or permission needed

## NOTES
- short handoff for orchestrator only
```

### Field rules

| Field | Rule |
|-------|------|
| `STATUS` | `done` = skill criteria met; `blocked` = needs human; `failed` = cannot proceed |
| `ARTIFACTS` | Every file/issue the orchestrator must read next; paths relative to project root preferred |
| `NEXT_SKILL` | At most one; orchestrator decides spawn — worker does not self-chain |
| `BLOCKERS` | If `blocked`, must be actionable (what to approve / what to answer) |

## Follow-up: missing STATUS

If the worker goes idle without `STATUS_FILE`:

```text
Write STATUS.md now at the ARTIFACT_DIR path from your instructions, using the orchestrator STATUS schema (STATUS/SKILL/ARTIFACTS/VERIFY/NEXT_SKILL/NEXT_INPUTS/BLOCKERS/NOTES). Do no other work.
```

## Follow-up: user answered a blocker

```text
Orchestrator relay from user:
«user answer»

Resume PRIMARY SKILL. Update STATUS.md when finished (or still blocked).
```
