#!/usr/bin/env python3
"""Check the current detached Paseo Root/Peer prompt/config contract."""

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
    "Peer packets must not ask Peer to read `WORKSPACE_PROTOCOL.md` or `config.model`",
    "Never call `paseo_create_agent` with a bare model id",
    "MCP create_agent model lives in provider; settings must not contain model; thinking lives in settings.thinkingOptionId",
)

CONTRACT_FILES = (
    "WORKSPACE_PROTOCOL.md",
    "skills/engineering/root/SKILL.md",
    "skills/engineering/peer/SKILL.md",
    "skills/engineering/ask-matt/SKILL.md",
    "skills/engineering/setup-matt-pocock-skills/workspace-protocol.md",
    "docs/engineering/ask-matt.md",
)

AGENT_CONTRACT_FILES = (
    "skills/engineering/root/agents/openai.yaml",
)

AGENT_REQUIRED_PHRASES = (
    '--model "$MODEL"',
    '--thinking "$THINKING"',
    "--mode full-access",
    "settings.thinkingOptionId",
    "MCP create_agent model lives in provider and settings must not contain model; thinking lives in settings.thinkingOptionId",
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
    for role in ("root", "peer"):
        if not parser.has_section(role):
            failures.append(f"config.model: missing [{role}] section")
            continue
        for key in REQUIRED_CONFIG_KEYS:
            if not parser.get(role, key, fallback="").strip():
                failures.append(f"config.model: [{role}].{key} is required")
        provider = parser.get(role, "provider", fallback="")
        expected_provider = f"codex-{role}"
        if provider != expected_provider:
            failures.append(
                f"config.model: [{role}].provider = {provider!r}, expected {expected_provider!r}"
            )


def check_contract_text(root: Path, failures: list[str]) -> None:
    files = existing_files(root, CONTRACT_FILES)
    text_by_path = {path: path.read_text(encoding="utf-8") for path in files}

    combined = normalize_contract_text("\n".join(text_by_path.values()))
    for phrase in REQUIRED_PHRASES:
        if normalize_contract_text(phrase) not in combined:
            failures.append(f"contract: missing required phrase {phrase!r}")


    for path in existing_files(root, AGENT_CONTRACT_FILES):
        text = path.read_text(encoding="utf-8")
        searchable = normalize_contract_text(text.replace('\\"', '"'))
        rel = path.relative_to(root)
        for phrase in AGENT_REQUIRED_PHRASES:
            if normalize_contract_text(phrase) not in searchable:
                failures.append(f"{rel}: missing agent launch phrase {phrase!r}")


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
