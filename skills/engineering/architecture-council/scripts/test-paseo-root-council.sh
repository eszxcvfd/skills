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

require_in "$skill_file" 'paseo agent run' 'Paseo root launch command is missing'
require_in "$skill_file" '--provider root' 'Council roles must run as root provider agents'
require_in "$skill_file" '--background' 'full Council proposers must be launchable before waiting'
require_in "$skill_file" 'council-role=<role>' 'Council root role label is missing'
require_in "$skill_file" 'COUNCIL_ROOT_BOUNDARY' 'Council root boundary prompt is missing'
require_in "$skill_file" 'proposer-a' 'proposer root topology is missing'
require_in "$skill_file" 'challenger' 'challenger root is missing'
require_in "$skill_file" 'verifier' 'verifier root is missing'
require_in "$skill_file" 'judge' 'judge root is missing'
require_in "$skill_file" 'before waiting' 'proposal start-before-wait rule is missing'
require_in "$skill_file" 'paseo agent wait' 'root wait command is missing'
require_in "$skill_file" 'paseo agent logs' 'root transcript validation is missing'
require_in "$skill_file" 'any architecture decision' 'mandatory architecture decision trigger is missing'
require_in "$skill_file" 'cannot identify a safe next step' 'unclear architecture trigger is missing'
require_in "$skill_file" 'before.*production code' 'pre-code gate is missing'
require_in "$skill_file" 'reduced or full Council' 'risk must select Council size, not bypass it'
require_in "$docs_file" 'Paseo root agents' 'docs must describe Paseo root agents'
require_in "$ask_matt_file" 'Paseo.*root' 'ask-matt router must mention Paseo root Council'
reject_in "$skill_file" 'HERDR_ENV|herdr agent start|herdr agent wait|herdr agent read|-- pi' 'Herdr/Pi launch contract must not remain'
reject_in "$skill_file" 'harness supports subagents' 'internal subagent fallback must not remain'
reject_in "$skill_file" 'briefs serially' 'serial role-play fallback must not remain'

printf 'PASS: architecture-council uses dedicated Paseo root agents\n'
