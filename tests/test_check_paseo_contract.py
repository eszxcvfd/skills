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


def write_project(root: Path, *, legacy: bool = False, wrong_model: bool = False) -> None:
    (root / ".agents/skills/root").mkdir(parents=True)
    (root / ".agents/skills/peer").mkdir(parents=True)
    (root / ".agents/skills/supervisor").mkdir(parents=True)
    (root / ".agents/skills/ask-matt").mkdir(parents=True)

    model = "minimax/MiniMax-M3" if wrong_model else "openai-codex/gpt-5.6-luna"
    thinking = "high" if wrong_model else "medium"
    (root / "config.model").write_text(
        f"""[supervisor]\nprovider=supervisor\nmodel=openai-codex/gpt-5.6-luna\nthinking=medium\n\n[root]\nprovider=root\nmodel=openai-codex/gpt-5.6-luna\nthinking=medium\n\n[peer]\nprovider=peer\nmodel={model}\nthinking={thinking}\n""",
        encoding="utf-8",
    )

    good_contract = (
        "MCP `paseo_create_agent` provider must be `<role>/<model>` after catalog verification.\n"
        "Existing agents keep their original model/thinking; fresh work uses `config.model`.\n"
        "Peer completion is a terminal run result retrieved through native wait/log/inspect.\n"
        "Use the role provider catalog before launch.\n"
        "Peer packets must not ask peer to read `WORKSPACE_PROTOCOL.md` or `config.model`.\n"
        "Never call `paseo_create_agent` with a bare model id.\n"
        "MCP create_agent model lives in provider; settings must not contain model.\n"
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


def test_checker_flags_legacy_contract_and_wrong_model(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path, legacy=True, wrong_model=True)

    result = checker.check_project(tmp_path)

    assert not result.ok
    assert any("ROOT_AGENT_ID:" in failure for failure in result.failures)
    assert any("peer workers" in failure for failure in result.failures)
    assert any("[peer].model" in failure for failure in result.failures)


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


def test_checker_accepts_current_contract(tmp_path: Path) -> None:
    checker = load_checker()
    write_project(tmp_path)

    result = checker.check_project(tmp_path)

    assert result.ok, result.failures
