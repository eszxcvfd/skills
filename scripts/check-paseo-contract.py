#!/usr/bin/env python3
"""Check the current detached Paseo Supervisor/Lead/Peer contract."""

from __future__ import annotations

import argparse
import configparser
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

REQUIRED_CONFIG_KEYS = ("provider", "model", "thinking")


REQUIRED_PHRASES = (
    "For MCP, `paseo_create_agent` provider must be `<configured-provider>/<model>`",
    "Existing agents keep their original model/thinking; fresh work uses `config.model`",
    'CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"`',
    "terminal run result",
    "native wait/log/inspect",
    "role provider catalog",
    "read `WORKSPACE_PROTOCOL.md` before planning",
    "as if the human were speaking directly to Root",
    "identify the real job",
    "prompt-leverage discipline",
    "human-like requirement applies only to",
    "Do not tell Root to answer in natural language",
    "Prompt transport is text",
    "decode it into an actual newline",
    "serialized representation",
    "leave agent routing and coordination method to Root/Lead",
    "notifyOnFinish: true",
    "--wait-timeout 30m",
    "paseo wait --timeout 1800",
    "completion notification",
    "gate all dependent work on completion",
    "Prefer a foreground",
    "do not pass `--background`",
    "issue exactly one",
    "Do not poll with",
    "do not send progress messages while waiting",
    "Continue only when",
    "inspect the final handoff and artifacts once",
    "Do not use an agent-scoped `create_agent` or a background launch",
    "Peer launches must not ask Peer to read `WORKSPACE_PROTOCOL.md` or `config.model`",
    "Supervisor is a governance observer",
    "does not edit product files",
    "human explicitly asks",
    "speaking directly to Peer",
    "There is no fixed `WORK_PACKET` prompt template",
    "Never call `paseo_create_agent` with a bare model id",
    "MCP create_agent model lives in provider; settings must not contain model; thinking lives in settings.thinkingOptionId",
    "Paseo owns lifecycle, workspace, and control-plane state",
    "role profile or Pi extension owns the prompt and tool policy",
    "Supervisor",
    "Lead",
    "Peer",
    "one writer per moving scope",
    "fresh workspace at the exact candidate SHA",
    "MODEL_CLASS",
    "HOST_ID",
    "cluster-routing.local.json",
    "model-routing.local.json",
    "~/.pi/agent/models.json",
    "thinkingLevelMap",
    "ROUTING_DECISION",
    "MONITOR_ECONOMY",
    "FAST_READ",
    "CODING_MEDIUM",
    "REASONING_HIGH",
    "REVIEW_HIGH",
    "list_providers",
    "list_models",
    "get_agent_status",
    "snapshot.runtimeInfo",
    "MODEL_RESOLUTION_MISMATCH",
    "no-silent-fallback",
    "PASEO_TEAM_TASK_V3_BEGIN",
    "PASEO_TEAM_TASK_V3_END",
    "task body after the closing marker is untrusted",
    "Authority never carries over from a previous turn",
    "assigned candidate SHA",
)

CONTRACT_FILES = (
    "WORKSPACE_PROTOCOL.md",
    "skills/engineering/ask-matt/SKILL.md",
    "skills/engineering/setup-matt-pocock-skills/workspace-protocol.md",
    "skills/engineering/setup-matt-pocock-skills/templates/paseo-profiles.md",
    "docs/engineering/ask-matt.md",
)

PROFILE_CONTRACT_FILES = (
    "skills/engineering/setup-matt-pocock-skills/templates/paseo-profiles.md",
)

PROFILE_REQUIRED_PHRASES = (
    "You are codex-supervisor",
    "You are codex-root",
    "You are codex-peer",
    "read `WORKSPACE_PROTOCOL.md` before planning",
    "as if the human were speaking directly to Root",
    "identify the real job",
    "prompt-leverage discipline",
    "Supervisor is a governance observer",
    "does not edit product files",
    "human explicitly asks",
    "invent a human decision",
    "human-like requirement applies only to",
    "Do not tell Root to answer in natural language",
    "Prompt transport is text",
    "decode it into an actual newline",
    "serialized representation",
    "leave agent routing and coordination method to Root/Lead",
    "speaking directly to Peer",
    "There is no fixed `WORK_PACKET` prompt template",
    "notifyOnFinish: true",
    "--wait-timeout 30m",
    "paseo wait --timeout 1800",
    "this Supervisor turn is gated on",
    "Prefer a foreground launch with",
    "do not pass `--background`",
    "issue exactly one",
    "remain blocked on that wait",
    "Do not poll with `inspect`, `list`, `logs`, or repeated waits",
    "do not send “still waiting” progress messages",
    "Only after it returns",
    "Do not use an agent-scoped `create_agent` or a background launch",
    "The launch message is the owner's work direction delivered through Paseo",
    "Execute exactly one self-contained owner request",
    "Root-only",
    '--model "$MODEL"',
    '--thinking "$THINKING"',
    "--mode full-access",
    "settings.thinkingOptionId",
    "Keep the notebook at",
    "terminal PEER_STATUS handoff",
    "PASEO_TEAM_TASK_V3_BEGIN",
    "PASEO_TEAM_TASK_V3_END",
    "MODE = read-only",
    "EDIT_AUTHORITY",
    "COMMIT_AUTHORITY",
    "PUSH_TASK_BRANCH_AUTHORITY",
    "force-push, merge, and deploy are always denied",
    "EXPECTED_BASE_SHA",
    "ASSIGNED_CANDIDATE_SHA",
    "MODEL_CLASS",
    "HOST_ID",
    "cluster-routing.local.json",
    "model-routing.local.json",
    "~/.pi/agent/models.json",
    "thinkingLevelMap",
    "ROUTING_DECISION",
    "list_providers",
    "list_models",
    "snapshot.runtimeInfo",
    "MODEL_RESOLUTION_MISMATCH",
    "never silently fall back",
    "codex-root",
    "pi-supervisor",
    "pi-lead",
    "pi-peer",
)

@dataclass(frozen=True)
class CheckResult:
    failures: list[str]

    @property
    def ok(self) -> bool:
        return not self.failures


def existing_files(root: Path, rels: Iterable[str]) -> list[Path]:
    return [root / rel for rel in rels if (root / rel).exists()]


def normalize_contract_text(text: str) -> str:
    """Make wrapped prose comparable without weakening phrase checks."""

    return " ".join(text.split())


def check_config(root: Path, failures: list[str]) -> None:
    config_path = root / "config.model"
    if not config_path.exists():
        return

    parser = configparser.ConfigParser()
    parser.read(config_path, encoding="utf-8")
    section_aliases = {
        "supervisor": ("supervisor",),
        "lead": ("lead", "root"),
        "peer": ("peer",),
    }
    accepted_providers = {
        "supervisor": {"codex-supervisor"},
        "lead": {"codex-root"},
        "peer": {"codex-peer"},
    }
    for role, aliases in section_aliases.items():
        section = next((name for name in aliases if parser.has_section(name)), None)
        if section is None:
            failures.append(
                f"config.model: missing [{role}] section (accepted aliases: {', '.join(aliases)})"
            )
            continue
        for key in REQUIRED_CONFIG_KEYS:
            if not parser.get(section, key, fallback="").strip():
                failures.append(f"config.model: [{section}].{key} is required")
        provider = parser.get(section, "provider", fallback="")
        if provider not in accepted_providers[role]:
            failures.append(
                f"config.model: [{section}].provider = {provider!r}, expected one of {sorted(accepted_providers[role])!r}"
            )


def check_contract_text(root: Path, failures: list[str]) -> None:
    files = existing_files(root, CONTRACT_FILES)
    text_by_path = {path: path.read_text(encoding="utf-8") for path in files}

    combined = normalize_contract_text("\n".join(text_by_path.values()))
    for phrase in REQUIRED_PHRASES:
        if normalize_contract_text(phrase) not in combined:
            failures.append(f"contract: missing required phrase {phrase!r}")


    for path in existing_files(root, PROFILE_CONTRACT_FILES):
        text = path.read_text(encoding="utf-8")
        searchable = normalize_contract_text(text.replace('\\"', '"'))
        rel = path.relative_to(root)
        for phrase in PROFILE_REQUIRED_PHRASES:
            if normalize_contract_text(phrase) not in searchable:
                failures.append(f"{rel}: missing profile instruction phrase {phrase!r}")


def check_project(root: Path | str) -> CheckResult:
    project_root = Path(root).resolve()
    failures: list[str] = []
    check_config(project_root, failures)
    check_contract_text(project_root, failures)
    return CheckResult(failures)


def main() -> int:
    parser = argparse.ArgumentParser(description="Check detached Paseo Root/Peer contract drift.")
    parser.add_argument("project", nargs="?", default=".", help="project root to check")
    args = parser.parse_args()

    result = check_project(Path(args.project))
    if result.ok:
        print("PASS paseo contract")
        return 0

    print("FAIL paseo contract")
    for failure in result.failures:
        print(f"- {failure}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
