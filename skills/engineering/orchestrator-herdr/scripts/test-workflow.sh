#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
P=0; F=0
ok(){ echo "  PASS  $*"; P=$((P+1)); }
bad(){ echo "  FAIL  $*"; F=$((F+1)); }

for f in SKILL.md PROMPTS.md WORKFLOW.md; do
  test -f "$SKILL_DIR/$f" && ok "$f" || bad "miss $f"
done
grep -q 'INGEST\|Ingest (mandatory' "$SKILL_DIR/SKILL.md" && ok "mandatory ingest" || bad "no ingest"
grep -q 'quality.gate\|Quality gate' "$SKILL_DIR/SKILL.md" && ok "quality gate" || bad "no qg"
grep -q 'ORCH:' "$SKILL_DIR/SKILL.md" && ok "ORCH decision" || bad "no ORCH"
grep -q 'SKILL_REQUIREMENTS' "$SKILL_DIR/SKILL.md" && ok "skill reqs in dispatch" || bad "no skill reqs"
grep -q 'SKILL_REQUIREMENTS' "$SKILL_DIR/PROMPTS.md" && ok "prompt skill reqs" || bad "prompt no reqs"
grep -q 'parallel\|Multiple\|multi' "$SKILL_DIR/SKILL.md" && ok "multi worker" || bad "no multi"
grep -q 'herdr agent send' "$SKILL_DIR/SKILL.md" && ok "send" || bad "no send"
grep -q 'Proceed? (y/n)' "$SKILL_DIR/SKILL.md" && ok "approve" || bad "no approve"
grep -qE "don.t ask|Close.*FINISH" "$SKILL_DIR/SKILL.md" && ok "close no ask" || bad "close asks"
grep -q 'Worker finish ≠ success\|finish ≠ success\|Idle/done ≠\|Worker finish' "$SKILL_DIR/SKILL.md" && ok "finish not success" || bad "weak finish rule"

echo "RESULT: $P passed, $F failed"
[[ "$F" -eq 0 ]]
