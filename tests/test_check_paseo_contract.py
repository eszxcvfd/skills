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


def write_project(root: Path, *, legacy: bool = False, bad_config: bool = False) -> None:
    (root / ".agents/skills/root").mkdir(parents=True)
    (root / ".agents/skills/peer").mkdir(parents=True)
    (root / ".agents/skills/supervisor").mkdir(parents=True)
    (root / ".agents/skills/ask-matt").mkdir(parents=True)
    (root / ".agents/skills/root/agents").mkdir(parents=True)
    (root / ".agents/skills/supervisor/agents").mkdir(parents=True)

    provider = "codex-peer" if not bad_config else "codex"
    thinking_line = "thinking=high\n" if not bad_config else ""
    (root / "config.model").write_text(
        f"""[supervisor]\nprovider=codex-supervisor\nmodel=gpt-5.6-luna\nthinking=medium\n\n[root]\nprovider=codex-root\nmodel=gpt-5.6-luna\nthinking=max\n\n[peer]\nprovider={provider}\nmodel=gpt-5.6-luna\n{thinking_line}""",
        encoding="utf-8",
    )
    (root / "skills/misc/root/agents").mkdir(parents=True)
    (root / "skills/misc/supervisor/agents").mkdir(parents=True)


    good_contract = (
        "MCP `paseo_create_agent` provider must be `<configured-provider>/<model>` after catalog verification.\n"
        "Existing agents keep their original model/thinking; fresh work uses `config.model`.\n"
        'CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"`.\n'
        "Peer completion is a terminal run result retrieved through native wait/log/inspect.\n"
        "Use the role provider catalog before launch.\n"
        "Peer packets must not ask peer to read `WORKSPACE_PROTOCOL.md` or `config.model`.\n"
        "Never call `paseo_create_agent` with a bare model id.\n"
        "MCP create_agent model lives in provider; settings must not contain model; thinking lives in settings.thinkingOptionId.\n"
    )
    good_agent_prompt = (
        'CLI launches must pass both --model "$MODEL" and --thinking "$THINKING" from config.model, '
        "pass --mode full-access, "
        "use MCP paseo_create_agent provider as <configured-provider>/<model> after catalog verification, "
        "settings.thinkingOptionId must equal the configured thinking value, "
        "MCP create_agent model lives in provider and settings must not contain model; thinking lives in settings.thinkingOptionId"
    )

    legacy_text = "ROOT_AGENT_ID:\npeer workers\nsend the final PEER_STATUS block back\n" if legacy else ""

    for rel in [
        "WORKSPACE_PROTOCOL.md",
        ".agents/skills/root/SKILL.md",
        ".agents/skills/peer/SKILL.md",
        ".agents/skills/supervisor/SKILL.md",
        ".agents/skills/ask-matt/SKILL.md",
    ]:
        (root / rel).write_text(good_contract + legacy_text, encoding="utf-8")

    for rel in [
        ".agents/skills/root/agents/openai.yaml",
        ".agents/skills/supervisor/agents/openai.yaml",
        "skills/misc/root/agents/openai.yaml",
        "skills/misc/supervisor/agents/openai.yaml",
    ]:
        (root / rel).write_text(good_agent_prompt, encoding="utf-8")



def test_checker_flags_legacy_contract_and_bad_config(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path, legacy=True, bad_config=True)

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("ROOT_AGENT_ID:" in failure for failure in result.failures)
    assert any("peer workers" in failure for failure in result.failures)
    assert any("[peer].provider" in failure for failure in result.failures)
    assert any("[peer].thinking" in failure for failure in result.failures)


def test_checker_requires_root_only_packet_boundary(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)
    for rel in [
        "WORKSPACE_PROTOCOL.md",
        ".agents/skills/root/SKILL.md",
        ".agents/skills/peer/SKILL.md",
        ".agents/skills/supervisor/SKILL.md",
        ".agents/skills/ask-matt/SKILL.md",
    ]:
        path = tmp_path / rel
        path.write_text(
            path.read_text(encoding="utf-8").replace(
                "Peer packets must not ask peer to read `WORKSPACE_PROTOCOL.md` or `config.model`.\n",
                "",
            ),
            encoding="utf-8",
        )

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("Peer packets must not ask peer" in failure for failure in result.failures)



def test_checker_requires_explicit_model_and_thinking_cli_flags(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)
    required_phrase = 'CLI launches must pass both `--model "$MODEL"` and `--thinking "$THINKING"`'
    for rel in [
        "WORKSPACE_PROTOCOL.md",
        ".agents/skills/root/SKILL.md",
        ".agents/skills/peer/SKILL.md",
        ".agents/skills/supervisor/SKILL.md",
        ".agents/skills/ask-matt/SKILL.md",
    ]:
        path = tmp_path / rel
        path.write_text(
            path.read_text(encoding="utf-8").replace(required_phrase + ".\n", ""),
            encoding="utf-8",
        )

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("--thinking" in failure for failure in result.failures)


def test_checker_requires_agent_prompts_to_pass_thinking(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)
    agent_prompt = tmp_path / "skills/misc/root/agents/openai.yaml"
    agent_prompt.write_text(
        agent_prompt.read_text(encoding="utf-8").replace("--thinking \"$THINKING\"", ""),
        encoding="utf-8",
    )

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("root/agents/openai.yaml" in failure and "--thinking" in failure for failure in result.failures)

def test_checker_accepts_current_contract(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)

    result = checker.check_project(tmp_path)

    assert result.ok, result.failures
