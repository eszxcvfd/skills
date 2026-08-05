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

reject_in() {
  local file="$1"
  local pattern="$2"
  local message="$3"

  if grep -Eiq -- "$pattern" "$file"; then
    printf 'FAIL: %s\n' "$message" >&2
    exit 1
  fi
}

require_in "$skill_file" 'any architecture decision' 'mandatory architecture decision trigger is missing'
require_in "$skill_file" 'cannot identify a safe next step|no safe next step' 'unclear architecture trigger is missing'
require_in "$skill_file" 'before.*production code' 'pre-code gate is missing'
require_in "$skill_file" 'reduced or full Council' 'risk must select Council size, not bypass it'
require_in "$skill_file" 'Reduced Council.*peer|peer/delegated' 'reduced Council must use cheaper peer/delegated workers'
require_in "$skill_file" 'Full Council.*Paseo.*root|--provider root' 'full/high-risk Council must still use Paseo root agents'
require_in "$skill_file" 'paseo agent run' 'Paseo root launch command is missing for full Council'
require_in "$skill_file" '--provider root' 'full Council roles must run as root provider agents'
require_in "$skill_file" '--background' 'full Council proposers must be launchable before waiting'
require_in "$skill_file" 'council-role=<role>' 'Council role label is missing'
require_in "$skill_file" 'COUNCIL_AGENT_BOUNDARY' 'Council agent boundary prompt is missing'
require_in "$skill_file" 'proposer-a' 'proposer topology is missing'
require_in "$skill_file" 'challenger' 'challenger role is missing'
require_in "$skill_file" 'verifier' 'verifier role is missing'
require_in "$skill_file" 'judge' 'judge role is missing'
require_in "$skill_file" 'before waiting' 'full proposal start-before-wait rule is missing'
require_in "$skill_file" 'paseo agent wait' 'root wait command is missing'
require_in "$skill_file" 'paseo agent logs' 'root transcript validation is missing'
require_in "$docs_file" 'peer/delegated' 'docs must describe reduced peer/delegated Council mode'
require_in "$docs_file" 'Paseo root agents' 'docs must describe full/high-risk Paseo root mode'
require_in "$ask_matt_file" 'peer/delegated.*Paseo root|Paseo root.*peer/delegated' 'ask-matt router must mention risk-based peer/root Council modes'
reject_in "$skill_file" 'HERDR_ENV|herdr agent start|herdr agent wait|herdr agent read|-- pi' 'Herdr/Pi launch contract must not remain'
reject_in "$skill_file" 'harness supports subagents' 'uncontrolled internal subagent fallback must not remain'
reject_in "$skill_file" 'briefs serially' 'serial role-play fallback must not remain'

printf 'PASS: architecture-council uses risk-based peer/root Council agents\n'
