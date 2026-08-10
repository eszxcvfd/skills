$ErrorActionPreference = "Stop"

# PowerShell companion for scripts/install.sh. Configuration examples remain
# separate so installation never silently changes the Paseo daemon.
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PackRoot = Split-Path -Parent $ScriptDir
$PiAgentDir = if ($env:PASEO_PI_AGENT_DIR) {
  $env:PASEO_PI_AGENT_DIR
} else {
  Join-Path $HOME ".pi\agent"
}

New-Item -ItemType Directory -Force -Path (Join-Path $PiAgentDir "extensions") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $PiAgentDir "prompts") | Out-Null

Copy-Item (Join-Path $PackRoot "extensions\paseo-team-policy.ts") (Join-Path $PiAgentDir "extensions\paseo-team-policy.ts") -Force
Copy-Item (Join-Path $PackRoot "extensions\paseo-team-policy.mjs") (Join-Path $PiAgentDir "extensions\paseo-team-policy.mjs") -Force

foreach ($role in @("supervisor", "lead", "peer")) {
  Copy-Item (Join-Path $PackRoot "prompts\$role.md") (Join-Path $PiAgentDir "prompts\$role.md") -Force
}

Write-Host "Installed Paseo + Pi role policy into $PiAgentDir."
Write-Host "Set PASEO_PI_ROLE=supervisor|lead|peer before starting Pi."
