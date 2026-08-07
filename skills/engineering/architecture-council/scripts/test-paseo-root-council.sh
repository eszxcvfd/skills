#!/usr/bin/env bash
set -euo pipefail

skill_file="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/SKILL.md"
docs_file="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)/docs/engineering/architecture-council.md"
ask_matt_file="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/ask-matt/SKILL.md"

require_in() {
  local file="$1"
  local pattern="$2"
  local message="$3"

  if ! grep -Eiq -- "$pattern" "$file"; then
    printf 'FAIL: %s\n' "$message" >&2
    exit 1
  fi
}

require_in "$skill_file" 'architecture decision|architecture change' 'mandatory architecture decision trigger is missing'
require_in "$skill_file" 'cannot identify a safe next step|no safe next step' 'unclear architecture trigger is missing'
require_in "$skill_file" 'before production work|pre-code' 'pre-code gate is missing'
require_in "$skill_file" 'full mode|reduced mode' 'risk must select Council size, not bypass it'
require_in "$skill_file" 'Reduced Council.*peer|reduced mode.*peer/delegated' 'reduced Council must use cheaper peer/delegated workers'
require_in "$skill_file" 'full mode.*Paseo root agents|full mode.*configured provider' 'full/high-risk Council must still use Paseo root agents'
require_in "$skill_file" '--provider "\$ROOT_PROVIDER"' 'full Council roles must use the configured root provider'
require_in "$skill_file" 'paseo agent run' 'Paseo root launch command is missing for full Council'
require_in "$skill_file" '--background' 'full Council proposers must be launchable before waiting'
require_in "$skill_file" '--model "\$MODEL"' 'full Council root launch must pass configured model'
require_in "$skill_file" '--thinking "\$THINKING"' 'full Council root launch must pass configured thinking'
require_in "$skill_file" 'council-role=<role>' 'Council role label is missing'
require_in "$skill_file" 'COUNCIL_AGENT_BOUNDARY' 'Council agent boundary prompt is missing'
require_in "$skill_file" 'proposer-a' 'proposer topology is missing'
require_in "$skill_file" 'proposer-b' 'Council must keep two independent proposers'
require_in "$skill_file" 'challenger' 'challenger role is missing'
require_in "$skill_file" 'verifier' 'verifier role is missing'
require_in "$skill_file" 'judge' 'judge role is missing'
require_in "$skill_file" 'before waiting' 'full proposal start-before-wait rule is missing'
require_in "$skill_file" 'paseo agent wait' 'root wait command is missing'
require_in "$skill_file" 'paseo agent logs' 'root transcript validation is missing'
require_in "$docs_file" 'peer/delegated' 'docs must describe reduced peer/delegated Council mode'
require_in "$docs_file" 'Paseo root agents' 'docs must describe full/high-risk Paseo root mode'
require_in "$docs_file" 'two independent proposers|two proposers' 'docs must describe the two-proposer invariant'
require_in "$ask_matt_file" 'peer/delegated.*Paseo root|Paseo root.*peer/delegated' 'ask-matt router must mention risk-based peer/root Council modes'

printf 'PASS: architecture-council uses risk-based peer/root Council agents\n'
