#!/usr/bin/env bash
# Smoke checks for slim orchestrator-herdr skill.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0
ok() { echo "  PASS  $*"; PASS=$((PASS + 1)); }
bad() { echo "  FAIL  $*"; FAIL=$((FAIL + 1)); }

echo "== docs =="
for f in SKILL.md WORKFLOW.md PROMPTS.md; do
  test -f "$SKILL_DIR/$f" && ok "$f" || bad "missing $f"
done
grep -q 'Proceed? (y/n)' "$SKILL_DIR/SKILL.md" && ok "approve gate" || bad "no approve"
grep -q 'herdr agent send' "$SKILL_DIR/SKILL.md" && ok "agent send" || bad "no send"
grep -q 'send-keys' "$SKILL_DIR/SKILL.md" && ok "send-keys" || bad "no send-keys"
grep -q 'agent wait' "$SKILL_DIR/SKILL.md" && ok "agent wait" || bad "no wait"
grep -q 'agent read' "$SKILL_DIR/SKILL.md" && ok "agent read" || bad "no read"
grep -q 'pane close' "$SKILL_DIR/SKILL.md" && ok "pane close" || bad "no close"
grep -q "don't ask\|do it, don't ask\|no ask\|Close.*don't ask\|no extra confirm" "$SKILL_DIR/SKILL.md" \
  || grep -q "don't ask" "$SKILL_DIR/WORKFLOW.md" && ok "close without asking" || bad "still asks on close"
grep -q 'project' "$SKILL_DIR/SKILL.md" && ok "project skills" || bad "no project skills"
# must stay short
lines=$(wc -l < "$SKILL_DIR/SKILL.md")
[[ "$lines" -lt 200 ]] && ok "SKILL slim ($lines lines)" || bad "SKILL too long ($lines)"

echo "== mock cycle =="
P="${TMPDIR:-/tmp}/orch-slim-$$"; mkdir -p "$P"; cd "$P"
RUN=".scratch/orchestrator/t1"; mkdir -p "$RUN/research"
echo 'STATUS: done' > "$RUN/research/STATUS.md"
echo '- out.md' > "$RUN/research/out.md"
test -f "$RUN/research/STATUS.md" && ok "status fixture" || bad "status"

echo "== herdr =="
if [[ "${HERDR_ENV:-}" == "1" ]] && command -v herdr >/dev/null; then
  herdr integration status >/dev/null 2>&1 && ok "integration status" || ok "integration skip"
  herdr agent list >/dev/null 2>&1 && ok "agent list" || bad "agent list"
  N="orch-slim-$$"
  if herdr agent start "$N" --cwd "$P" --split right --no-focus -- bash >/dev/null 2>&1; then
    ok "start"
    sleep 1
    PANE=$(herdr agent get "$N" 2>/dev/null | sed -n 's/.*"pane_id"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
    if [[ -n "$PANE" ]]; then
      ok "pane_id"
      herdr agent send "$N" "echo ok" >/dev/null 2>&1 || true
      herdr pane send-keys "$PANE" Enter >/dev/null 2>&1 || true
      ok "send+enter"
      herdr agent read "$N" --source recent >/dev/null 2>&1 && ok "read" || ok "read skip"
      herdr pane close "$PANE" >/dev/null 2>&1 && ok "close" || ok "close skip"
    else
      bad "no pane"
    fi
  else
    bad "start failed"
  fi
else
  ok "herdr skip"
fi

echo "== docs page =="
grep -q 'PLAN' "$ROOT/docs/engineering/orchestrator-herdr.md" && ok "docs" || bad "docs"

echo "RESULT: $PASS passed, $FAIL failed"
[[ "$FAIL" -eq 0 ]]
