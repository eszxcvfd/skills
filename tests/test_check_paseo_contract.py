from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "check-paseo-contract.py"


def load_checker():
    spec = importlib.util.spec_from_file_location("check_paseo_contract", SCRIPT)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def write_project(root: Path, *, bad_config: bool = False) -> None:
    provider = "codex-peer" if not bad_config else "codex"
    thinking_line = "thinking=high\n" if not bad_config else ""
    (root / "config.model").write_text(
        f"""[root]\nprovider=codex-root\nmodel=gpt-5.6-luna\nthinking=max\n\n[peer]\nprovider={provider}\nmodel=gpt-5.6-luna\n{thinking_line}""",
        encoding="utf-8",
    )
    for rel in (
        "skills/engineering/ask-matt",
        "skills/engineering/setup-matt-pocock-skills/templates",
    ):
        (root / rel).mkdir(parents=True)

    good_contract = (
        "For MCP, `paseo_create_agent` provider must be `<configured-provider>/<model>` after catalog verification.\n"
        "Existing agents keep their original model/thinking; fresh work uses `config.model`.\n"
        'CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"`.\n'
        "Peer completion is a terminal run result retrieved through native wait/log/inspect.\n"
        "Use the role provider catalog before launch.\n"
        "Peer packets must not ask Peer to read `WORKSPACE_PROTOCOL.md` or `config.model`.\n"
        "Never call `paseo_create_agent` with a bare model id.\n"
        "MCP create_agent model lives in provider; settings must not contain model; thinking lives in settings.thinkingOptionId.\n"
    )
    for rel in ["WORKSPACE_PROTOCOL.md", "skills/engineering/ask-matt/SKILL.md"]:
        (root / rel).write_text(good_contract, encoding="utf-8")

    good_profile = (
        "You are codex-supervisor, an external observer.\n"
        "You are codex-root, an autonomous Lead.\n"
        "You are codex-peer, a bounded execution agent.\n"
        'CLI launches must pass both --model "$MODEL" and --thinking "$THINKING" from config.model, '
        "pass --mode full-access, use settings.thinkingOptionId, and\n"
        "Keep the notebook at "
        "$CODEX_HOME/supervisor-notebooks/<repo-slug>/SUPERVISOR_NOTEBOOK.md.\n"
        "Return a terminal PEER_STATUS handoff.\n"
    )
    profile_path = root / "skills/engineering/setup-matt-pocock-skills/templates/paseo-profiles.md"
    profile_path.write_text(good_profile, encoding="utf-8")



def test_checker_flags_bad_config(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path, bad_config=True)

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("[peer].provider" in failure for failure in result.failures)
    assert any("[peer].thinking" in failure for failure in result.failures)


def test_checker_requires_root_only_packet_boundary(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)
    for rel in ["WORKSPACE_PROTOCOL.md", "skills/engineering/ask-matt/SKILL.md"]:
        path = tmp_path / rel
        path.write_text(
            path.read_text(encoding="utf-8").replace(
                "Peer packets must not ask Peer to read `WORKSPACE_PROTOCOL.md` or `config.model`.\n",
                "",
            ),
            encoding="utf-8",
        )

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("Peer packets must not ask Peer" in failure for failure in result.failures)


def test_checker_requires_explicit_model_and_thinking_cli_flags(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)
    required_phrase = 'CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"`'
    for rel in ["WORKSPACE_PROTOCOL.md", "skills/engineering/ask-matt/SKILL.md"]:
        path = tmp_path / rel
        path.write_text(
            path.read_text(encoding="utf-8").replace(required_phrase + ".\n", ""),
            encoding="utf-8",
        )

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("--thinking" in failure for failure in result.failures)


def test_checker_requires_profile_instructions_to_pass_thinking(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)
    profile = tmp_path / "skills/engineering/setup-matt-pocock-skills/templates/paseo-profiles.md"
    profile.write_text(
        profile.read_text(encoding="utf-8").replace("--thinking \"$THINKING\"", ""),
        encoding="utf-8",
    )

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("paseo-profiles.md" in failure and "--thinking" in failure for failure in result.failures)


def test_checker_accepts_current_contract(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)

    result = checker.check_project(tmp_path)

    assert result.ok, result.failures
