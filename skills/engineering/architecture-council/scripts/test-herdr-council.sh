#!/usr/bin/env bash
set -euo pipefail

skill_file="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/SKILL.md"

require() {
  local pattern="$1"
  local message="$2"

  if ! grep -Eiq -- "$pattern" "$skill_file"; then
    printf 'FAIL: %s\n' "$message" >&2
    exit 1
  fi
}

reject() {
  local pattern="$1"
  local message="$2"

  if grep -Eiq -- "$pattern" "$skill_file"; then
    printf 'FAIL: %s\n' "$message" >&2
    exit 1
  fi
}

require 'HERDR_ENV' 'full Council must require a Herdr session'
require 'herdr agent start' 'worker launch command is missing'
require '-- pi' 'workers must launch Pi'
require 'council-proposer-a' 'proposer worker topology is missing'
require 'council-challenger' 'challenger worker is missing'
require 'council-verifier' 'verifier worker is missing'
require 'council-judge' 'judge worker is missing'
require 'start all' 'proposal start rule is missing'
require 'before waiting' 'proposal wait rule is missing'
require 'herdr agent wait' 'worker wait command is missing'
require 'herdr agent read' 'worker transcript validation is missing'
require 'any architecture decision' 'mandatory architecture decision trigger is missing'
require 'cannot identify a safe next step' 'unclear architecture trigger is missing'
require 'before.*production code' 'pre-code gate is missing'
require 'reduced or full Council' 'risk must select Council size, not bypass it'
reject '-- omp' 'OMP must not launch Council workers'
reject 'harness supports subagents' 'internal subagent fallback must not remain'
reject 'briefs serially' 'serial role-play fallback must not remain'

printf 'PASS: architecture-council uses independent Pi workers in Herdr\n'
