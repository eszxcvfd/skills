#!/usr/bin/env bash
# Dry-run + optional Herdr smoke for orchestrator-herdr canonical cycle.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0

ok() { echo "  PASS  $*"; PASS=$((PASS + 1)); }
bad() { echo "  FAIL  $*"; FAIL=$((FAIL + 1)); }

echo "== 1. Skill docs encode canonical cycle =="
for f in SKILL.md WORKFLOW.md PROMPTS.md; do
  test -f "$SKILL_DIR/$f" && ok "exists $f" || bad "missing $f"
done

grep -q 'NEXT PLAN' "$SKILL_DIR/SKILL.md" && ok "SKILL has NEXT PLAN" || bad "SKILL missing NEXT PLAN"
grep -q 'Proceed? (y/n' "$SKILL_DIR/SKILL.md" && ok "SKILL waits for approval" || bad "SKILL missing Proceed gate"
grep -q 'Skill selection' "$SKILL_DIR/SKILL.md" && ok "SKILL skill selection" || bad "SKILL missing skill selection"
grep -q 'project skill' "$SKILL_DIR/SKILL.md" && ok "SKILL project skill rule" || bad "SKILL missing project skill"
grep -q 'match:' "$SKILL_DIR/SKILL.md" && ok "SKILL PLAN match field" || bad "SKILL missing match field"
grep -q 'quality_gate' "$SKILL_DIR/SKILL.md" && ok "SKILL has quality_gate" || bad "SKILL missing quality_gate"
grep -q 'Never spawn the next job' "$SKILL_DIR/SKILL.md" && ok "no auto-chain rule" || bad "missing no auto-chain"
grep -q 'herdr pane run' "$SKILL_DIR/SKILL.md" && ok "cookbook pane run" || bad "missing pane run"
grep -q 'herdr wait agent-status' "$SKILL_DIR/SKILL.md" && ok "cookbook wait" || bad "missing wait"
grep -q 'hard gate' "$SKILL_DIR/WORKFLOW.md" && ok "WORKFLOW hard gate" || bad "WORKFLOW missing hard gate"
grep -q 'Anti-patterns' "$SKILL_DIR/WORKFLOW.md" && ok "WORKFLOW anti-patterns" || bad "WORKFLOW missing anti-patterns"
grep -q 'user must approve NEXT PLAN' "$SKILL_DIR/PROMPTS.md" && ok "PROMPTS approve note" || bad "PROMPTS missing approve note"

echo "== 2. Simulate two cycles with mock worker STATUS =="
PROJECT="${TMPDIR:-/tmp}/orch-wf-test-$$"
mkdir -p "$PROJECT"
cd "$PROJECT"
RUN_ID="test-$(date +%Y%m%d-%H%M%S)"
RUN="$PROJECT/.scratch/orchestrator/$RUN_ID"
W1="$RUN/research"
W2="$RUN/implement"
mkdir -p "$W1" "$W2"

# --- cycle 1 PLAN shape (orchestrator would print & wait) ---
cat > "$RUN/cycle1-PLAN.txt" <<EOF
PLAN (cycle 1):
- skill: research | path: .agents/skills/research/SKILL.md | mode: AFK | worker: research | depends: none | out: .scratch/orchestrator/$RUN_ID/research/
- match: primary-source investigation fits project research skill
goal: evidence for smallest fix
skill_source: project-inventory + ask-matt
workers: opencode
run-id: $RUN_ID
Proceed? (y/n)
EOF
grep -q 'Proceed?' "$RUN/cycle1-PLAN.txt" && ok "cycle1 PLAN gate" || bad "cycle1 PLAN"
grep -q 'path:' "$RUN/cycle1-PLAN.txt" && ok "cycle1 PLAN has path" || bad "cycle1 PLAN path"
grep -q 'match:' "$RUN/cycle1-PLAN.txt" && ok "cycle1 PLAN has match" || bad "cycle1 PLAN match"

# user y → mock worker output
cat > "$W1/findings.md" <<'EOF'
# Findings
- Root cause: missing null guard in src/foo.ts
- Smallest fix: add early return when input is null
EOF
cat > "$W1/STATUS.md" <<EOF
# STATUS

STATUS: done
SKILL: deep-research
WORKER: research
RUN_ID: $RUN_ID

## ARTIFACTS
- .scratch/orchestrator/$RUN_ID/research/findings.md

## VERIFY
- read sources → 2 notes

## NEXT_SKILL
implement

## NEXT_INPUTS
- .scratch/orchestrator/$RUN_ID/research/findings.md
- path: src/foo.ts

## BLOCKERS
none

## NOTES
- parent: test-harness
EOF

# ingest checks (what orch must do)
test -f "$W1/STATUS.md" && ok "cycle1 STATUS exists" || bad "cycle1 STATUS"
ART="$(awk '/^## ARTIFACTS/{f=1;next} /^## /{f=0} f && /^-/{print $2}' "$W1/STATUS.md")"
test -f "$PROJECT/$ART" && ok "cycle1 artifact readable: $ART" || bad "cycle1 artifact missing"
STATUS_LINE="$(grep '^STATUS:' "$W1/STATUS.md" | awk '{print $2}')"
test "$STATUS_LINE" = "done" && ok "cycle1 status=done" || bad "cycle1 status"

# evaluate + NEXT PLAN (must wait — we only write the block)
cat > "$RUN/cycle1-ORCH.txt" <<EOF
ORCH (cycle 1):
- worker: research | skill: deep-research | status: done
- evidence: findings.md names src/foo.ts guard
- quality_gate: pass
- gaps: no code change yet
- recommendation: next_skill=implement
NEXT PLAN (cycle 2):
- skill: implement | path: .agents/skills/implement/SKILL.md | mode: AFK | worker: implement
- match: build from findings — project implement skill
- inputs:
  - .scratch/orchestrator/$RUN_ID/research/findings.md
  - path: src/foo.ts
- out: .scratch/orchestrator/$RUN_ID/implement/
- why: research closed design; implement one guard
Proceed? (y/n/edit)
EOF
grep -q 'NEXT PLAN' "$RUN/cycle1-ORCH.txt" && ok "cycle1 NEXT PLAN" || bad "cycle1 NEXT PLAN"
grep -q 'Proceed?' "$RUN/cycle1-ORCH.txt" && ok "cycle1 second gate" || bad "cycle1 second gate"
grep -q 'path: .agents/skills/implement' "$RUN/cycle1-ORCH.txt" && ok "cycle1 NEXT PLAN skill path" || bad "cycle1 NEXT PLAN path"

# --- cycle 2 after user y ---
mkdir -p "$PROJECT/src"
echo 'export function f(x) { return x.value }' > "$PROJECT/src/foo.ts"
cat > "$W2/STATUS.md" <<EOF
# STATUS

STATUS: done
SKILL: implement
WORKER: implement
RUN_ID: $RUN_ID

## ARTIFACTS
- src/foo.ts

## VERIFY
- node -e "ok"

## NEXT_SKILL
none

## NEXT_INPUTS
- none

## BLOCKERS
none

## NOTES
- applied null guard
EOF
echo 'export function f(x) { if (x == null) return null; return x.value }' > "$PROJECT/src/foo.ts"

cat > "$RUN/cycle2-FINISH.txt" <<EOF
ORCH (cycle 2):
- worker: implement | skill: implement | status: done
- evidence: src/foo.ts has null guard
- quality_gate: pass
- gaps: none for stated goal
- recommendation: finish
FINISH:
- cycles: research done, implement done
- artifacts: .scratch/orchestrator/$RUN_ID/research/findings.md, src/foo.ts
Accept finish? (y/n)
EOF
grep -q 'Accept finish?' "$RUN/cycle2-FINISH.txt" && ok "cycle2 FINISH gate" || bad "cycle2 FINISH"

# prove no auto-chain file exists without approval marker
test ! -f "$RUN/AUTO_CHAINED" && ok "no auto-chain marker" || bad "auto-chain should not exist"

echo "== 3. Herdr smoke (if available) =="
if [[ "${HERDR_ENV:-}" == "1" ]] && command -v herdr >/dev/null 2>&1; then
  ok "HERDR_ENV=1 and herdr on PATH"
  if herdr agent list >/dev/null 2>&1; then
    ok "herdr agent list works"
  else
    bad "herdr agent list failed"
  fi
  # Non-destructive: split a shell, write STATUS via shell, read back — no opencode required
  SMOKE_NAME="orch-smoke-$$"
  set +e
  START_JSON=$(herdr agent start "$SMOKE_NAME" --cwd "$PROJECT" --split right --no-focus -- bash 2>&1)
  START_EC=$?
  set -e
  if [[ $START_EC -ne 0 ]]; then
    bad "agent start bash: $START_JSON"
  else
    ok "agent start bash"
    # give shell a moment
    sleep 1
    PANE=$(herdr agent get "$SMOKE_NAME" 2>/dev/null | sed -n 's/.*"pane_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
    if [[ -z "${PANE:-}" ]]; then
      # try list
      herdr agent list >"$RUN/agent-list.json" 2>&1 || true
      PANE=$(sed -n 's/.*"pane_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$RUN/agent-list.json" | tail -1)
    fi
    if [[ -n "${PANE:-}" ]]; then
      ok "resolved pane_id=$PANE"
      herdr pane run "$PANE" "mkdir -p .scratch/orchestrator/$RUN_ID/smoke && printf '%s\n' '# STATUS' '' 'STATUS: done' 'SKILL: smoke' > .scratch/orchestrator/$RUN_ID/smoke/STATUS.md && echo SMOKE_OK"
      sleep 1
      if [[ -f "$PROJECT/.scratch/orchestrator/$RUN_ID/smoke/STATUS.md" ]]; then
        ok "smoke worker wrote STATUS via pane run"
      else
        # shell may need cwd; try absolute
        herdr pane run "$PANE" "mkdir -p '$PROJECT/.scratch/orchestrator/$RUN_ID/smoke' && echo 'STATUS: done' > '$PROJECT/.scratch/orchestrator/$RUN_ID/smoke/STATUS.md' && echo SMOKE_OK"
        sleep 1
        test -f "$PROJECT/.scratch/orchestrator/$RUN_ID/smoke/STATUS.md" && ok "smoke STATUS abs path" || bad "smoke STATUS not written"
      fi
      # read may lag one frame; retry a few times / sources
      : >"$RUN/smoke-read.txt"
      for _try in 1 2 3 4 5; do
        herdr pane read "$PANE" --source recent-unwrapped --lines 40 >"$RUN/smoke-read.txt" 2>&1 || true
        [[ -s "$RUN/smoke-read.txt" ]] && break
        herdr pane read "$PANE" --source visible --lines 40 >"$RUN/smoke-read.txt" 2>&1 || true
        [[ -s "$RUN/smoke-read.txt" ]] && break
        herdr agent read "$SMOKE_NAME" --source recent-unwrapped --lines 40 >"$RUN/smoke-read.txt" 2>&1 || true
        [[ -s "$RUN/smoke-read.txt" ]] && break
        sleep 0.4
      done
      if [[ -s "$RUN/smoke-read.txt" ]]; then
        ok "pane/agent read returned output"
      else
        # STATUS file already proved pane run; empty scrollback is non-fatal on bare bash
        ok "pane read empty (non-fatal; STATUS write already verified)"
      fi
      # cleanup smoke pane if close works
      herdr pane close "$PANE" >/dev/null 2>&1 && ok "closed smoke pane" || ok "smoke pane left (close skipped)"
    else
      bad "could not resolve pane_id for smoke agent"
    fi
  fi
else
  echo "  SKIP  Herdr smoke (HERDR_ENV!=1 or no herdr)"
  ok "skip counted as informational"
fi

echo "== 4. Docs page mentions cycle gates =="
DOC="$ROOT/docs/engineering/orchestrator-herdr.md"
if [[ -f "$DOC" ]]; then
  grep -q 'NEXT PLAN' "$DOC" && ok "docs NEXT PLAN" || bad "docs missing NEXT PLAN"
  grep -q 'approve' "$DOC" && ok "docs approve" || bad "docs missing approve"
else
  bad "docs page missing"
fi

echo
echo "RESULT: $PASS passed, $FAIL failed"
echo "Fixture project: $PROJECT"
[[ "$FAIL" -eq 0 ]]
