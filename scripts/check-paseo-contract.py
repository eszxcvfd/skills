#!/usr/bin/env python3
"""Check Paseo hierarchy prompt/config contract drift.

This checker is intentionally narrow. It catches the failure modes that caused
runtime drift in test-v2: stale callback fields, stale peer-worker wording,
missing native-result handoff language, missing MCP provider/model guidance,
and wrong per-role model defaults.
"""

from __future__ import annotations

import argparse
import configparser
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

EXPECTED_MODEL = "openai-codex/gpt-5.6-luna"
EXPECTED_THINKING = "medium"

LEGACY_PHRASES = (
    "ROOT_AGENT_ID:",
    "include ROOT_AGENT_ID",
    "send the final PEER_STATUS block back",
    "must send its final PEER_STATUS block back",
    "must send its final status to root",
    "send its final status to root with",
    "send the final status block to root",
    "paseo agent send <root-id>",
    "peer workers",
    "Peer worker",
)

REQUIRED_PHRASES = (
    "MCP `paseo_create_agent` provider must be `<role>/<model>`",
    "Existing agents keep their original model/thinking; fresh work uses `config.model`",
    "terminal run result",
    "native wait/log/inspect",
    "role provider catalog",
    "Peer packets must not ask peer to read `WORKSPACE_PROTOCOL.md` or `config.model`",
    "Never call `paseo_create_agent` with a bare model id",
    "MCP create_agent model lives in provider; settings must not contain model",
)

CONTRACT_FILES = (
    "WORKSPACE_PROTOCOL.md",
    ".agents/skills/root/SKILL.md",
    ".agents/skills/peer/SKILL.md",
    ".agents/skills/supervisor/SKILL.md",
    ".agents/skills/ask-matt/SKILL.md",
    "skills/engineering/root/SKILL.md",
    "skills/engineering/peer/SKILL.md",
    "skills/engineering/supervisor/SKILL.md",
    "skills/engineering/ask-matt/SKILL.md",
    "skills/engineering/setup-matt-pocock-skills/workspace-protocol.md",
    "docs/engineering/root.md",
    "docs/engineering/peer.md",
    "docs/engineering/supervisor.md",
    "docs/engineering/ask-matt.md",
    ".codex/agents/root.toml",
    ".codex/agents/peer.toml",
    ".codex/agents/supervisor.toml",
)


@dataclass(frozen=True)
class CheckResult:
    failures: list[str]

    @property
    def ok(self) -> bool:
        return not self.failures


def existing_files(root: Path, rels: Iterable[str]) -> list[Path]:
    return [root / rel for rel in rels if (root / rel).exists()]


def check_config(root: Path, failures: list[str]) -> None:
    config_path = root / "config.model"
    if not config_path.exists():
        return

    parser = configparser.ConfigParser()
    parser.read(config_path, encoding="utf-8")
    for role in ("supervisor", "root", "peer"):
        if not parser.has_section(role):
            failures.append(f"config.model: missing [{role}] section")
            continue
        provider = parser.get(role, "provider", fallback="")
        model = parser.get(role, "model", fallback="")
        thinking = parser.get(role, "thinking", fallback="")
        if provider != role:
            failures.append(f"config.model: [{role}].provider = {provider!r}, expected {role!r}")
        if model != EXPECTED_MODEL:
            failures.append(f"config.model: [{role}].model = {model!r}, expected {EXPECTED_MODEL!r}")
        if thinking != EXPECTED_THINKING:
            failures.append(f"config.model: [{role}].thinking = {thinking!r}, expected {EXPECTED_THINKING!r}")


def check_contract_text(root: Path, failures: list[str]) -> None:
    files = existing_files(root, CONTRACT_FILES)
    text_by_path = {path: path.read_text(encoding="utf-8") for path in files}

    for path, text in text_by_path.items():
        rel = path.relative_to(root)
        for phrase in LEGACY_PHRASES:
            if phrase in text:
                failures.append(f"{rel}: contains legacy phrase {phrase!r}")

    combined = "\n".join(text_by_path.values())
    for phrase in REQUIRED_PHRASES:
        if phrase not in combined:
            failures.append(f"contract: missing required phrase {phrase!r}")


def check_project(root: Path | str) -> CheckResult:
    project_root = Path(root).resolve()
    failures: list[str] = []
    check_config(project_root, failures)
    check_contract_text(project_root, failures)
    return CheckResult(failures)


def main() -> int:
    parser = argparse.ArgumentParser(description="Check Paseo hierarchy prompt/config contract drift.")
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
