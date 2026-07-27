#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
failures=0

ok() { printf 'ok - %s\n' "$1"; }
bad() { printf 'not ok - %s\n' "$1"; failures=$((failures + 1)); }
has() { grep -Fq "$1" "$2" && ok "$3" || bad "$3"; }

has 'disable-model-invocation: true' "$SKILL_DIR/SKILL.md" "user invoked"
has 'allow_implicit_invocation: false' "$SKILL_DIR/agents/openai.yaml" "implicit invocation disabled"
has 'parallel()' "$SKILL_DIR/SKILL.md" "structural parallelism"
has 'withWorktree()' "$SKILL_DIR/SKILL.md" "isolated writers"
has 'workflow_retry' "$SKILL_DIR/SKILL.md" "failed-run recovery"
has 'workflow_resume' "$SKILL_DIR/SKILL.md" "budget recovery"
has 'workflow_respond' "$SKILL_DIR/SKILL.md" "human decisions"
has 'Agent success without opened evidence is not completion.' "$SKILL_DIR/SKILL.md" "evidence gate"
has 'failed            -> workflow_retry' "$SKILL_DIR/PATTERNS.md" "recovery map"
has 'approve-herdr-plan' "$SKILL_DIR/workflows/github-issue-to-herdr.js" "issue plan checkpoint"
has 'GitHub issue planner' "$SKILL_DIR/workflows/github-issue-to-herdr.js" "planner agent"
has 'Herdr plan executor' "$SKILL_DIR/workflows/github-issue-to-herdr.js" "Herdr executor agent"
has 'agentLaunches": { "hard": 2' "$SKILL_DIR/SKILL.md" "two Pi agent budget"
has 'never respawn an accepted or currently running task' "$SKILL_DIR/workflows/github-issue-to-herdr.js" "external replay guard"
has 'stage: "plan-validation"' "$SKILL_DIR/workflows/github-issue-to-herdr.js" "deterministic DAG validation"

node "$SKILL_DIR/scripts/test-github-issue-workflow.mjs"

exit "$failures"
