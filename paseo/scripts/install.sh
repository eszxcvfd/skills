#!/usr/bin/env bash
set -euo pipefail

# Install the Pi adapter, pure policy core, and role prompts without touching
# the user's daemon config. Provider/route configuration stays explicit and is
# handled from the JSON examples in ../config.

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PACK_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
PI_AGENT_DIR="${PASEO_PI_AGENT_DIR:-${HOME}/.pi/agent}"

mkdir -p "${PI_AGENT_DIR}/extensions" "${PI_AGENT_DIR}/prompts"
install -m 0644 "${PACK_ROOT}/extensions/paseo-team-policy.ts" \
  "${PI_AGENT_DIR}/extensions/paseo-team-policy.ts"
install -m 0644 "${PACK_ROOT}/extensions/paseo-team-policy.mjs" \
  "${PI_AGENT_DIR}/extensions/paseo-team-policy.mjs"

for role in supervisor lead peer; do
  install -m 0644 "${PACK_ROOT}/prompts/${role}.md" \
    "${PI_AGENT_DIR}/prompts/${role}.md"
done

echo "Installed Paseo + Pi role policy into ${PI_AGENT_DIR}."
echo "Set PASEO_PI_ROLE=supervisor|lead|peer before starting Pi."
