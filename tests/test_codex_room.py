from __future__ import annotations

import json
import os
from pathlib import Path
import subprocess
import sys
import tomllib


ROOT = Path(__file__).resolve().parents[1]
SYNC = ROOT / "scripts" / "codex-room-sync"
LAUNCHER = ROOT / "scripts" / "codex-room"
ROLES = {
    "supervisor": ("medium", "codex-supervisor"),
    "root": ("max", "codex-root"),
    "peer": ("high", "codex-peer"),
}


def fixture(tmp_path: Path) -> tuple[Path, Path, Path]:
    repo = tmp_path / "repo"
    codex_home = tmp_path / "codex"
    runtime_root = tmp_path / "runtime"
    repo.mkdir()
    codex_home.mkdir()
    (codex_home / "auth.json").write_text("{}", encoding="utf-8")
    (codex_home / "skills").mkdir()
    (codex_home / "plugins").mkdir()
    (codex_home / "config.toml").write_text(
        'model = "baseline-model"\n'
        'model_reasoning_effort = "low"\n'
        "\n[features]\n"
        "hooks = true\n\n"
        '[mcp_servers.example]\n'
        'command = "example"\n'
        'CODEX_HOME = "/shared/codex"\n',
        encoding="utf-8",
    )
    sections = []
    for role, (thinking, provider) in ROLES.items():
        sections.append(
            f"[{role}]\nprovider={provider}\nmodel=gpt-5.6-luna\nthinking={thinking}\n"
        )
        (codex_home / f"{role}.config.toml").write_text(
            f'model = "gpt-5.6-luna"\n'
            f'model_reasoning_effort = "{thinking}"\n'
            'developer_instructions = """\n'
            f"ROLE_{role.upper()}_INSTRUCTIONS\n"
            '"""\n',
            encoding="utf-8",
        )
    (repo / "config.model").write_text("\n".join(sections), encoding="utf-8")
    return repo, codex_home, runtime_root


def run_sync(repo: Path, codex_home: Path, runtime_root: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            sys.executable,
            str(SYNC),
            "--repo-root",
            str(repo),
            "--codex-home",
            str(codex_home),
            "--runtime-root",
            str(runtime_root),
        ],
        check=False,
        text=True,
        capture_output=True,
    )


def test_sync_generates_all_roles_with_role_specific_reasoning(tmp_path: Path) -> None:
    repo, codex_home, runtime_root = fixture(tmp_path)
    result = run_sync(repo, codex_home, runtime_root)

    assert result.returncode == 0, result.stderr
    for role, (thinking, _provider) in ROLES.items():
        generated = runtime_root / role / "config.toml"
        parsed = tomllib.loads(generated.read_text(encoding="utf-8"))
        assert parsed["model"] == "gpt-5.6-luna"
        assert parsed["model_reasoning_effort"] == thinking
        assert parsed["features"]["hooks"] is True
        assert f"ROLE_{role.upper()}_INSTRUCTIONS" in parsed["developer_instructions"]
        assert parsed["mcp_servers"]["example"]["CODEX_HOME"] == str(runtime_root / role)


def test_sync_creates_only_required_shared_symlinks(tmp_path: Path) -> None:
    repo, codex_home, runtime_root = fixture(tmp_path)
    result = run_sync(repo, codex_home, runtime_root)

    assert result.returncode == 0, result.stderr
    for role in ROLES:
        runtime = runtime_root / role
        assert (runtime / "config.toml").is_file()
        assert not (runtime / "config.toml").is_symlink()
        for name in ("auth.json", "skills", "plugins"):
            link = runtime / name
            assert link.is_symlink()
            assert link.resolve() == (codex_home / name).resolve()


def test_sync_rejects_invalid_provider_before_mutating_runtime(tmp_path: Path) -> None:
    repo, codex_home, runtime_root = fixture(tmp_path)
    runtime_root.mkdir()
    sentinel = runtime_root / "root" / "config.toml"
    sentinel.parent.mkdir()
    sentinel.write_text("sentinel", encoding="utf-8")
    config = (repo / "config.model").read_text(encoding="utf-8")
    (repo / "config.model").write_text(config.replace("provider=codex-peer", "provider=peer"), encoding="utf-8")

    result = run_sync(repo, codex_home, runtime_root)

    assert result.returncode != 0
    assert "provider must be codex-peer" in result.stderr
    assert sentinel.read_text(encoding="utf-8") == "sentinel"


def test_sync_rejects_missing_shared_target(tmp_path: Path) -> None:
    repo, codex_home, runtime_root = fixture(tmp_path)
    (codex_home / "plugins").rmdir()

    result = run_sync(repo, codex_home, runtime_root)

    assert result.returncode != 0
    assert "missing shared Codex target" in result.stderr
    assert not runtime_root.exists()


def test_launcher_sets_role_home_and_forwards_arguments(tmp_path: Path) -> None:
    repo, codex_home, runtime_root = fixture(tmp_path)
    assert run_sync(repo, codex_home, runtime_root).returncode == 0
    fake_bin = tmp_path / "bin"
    fake_bin.mkdir()
    observed = tmp_path / "observed.json"
    fake_codex = fake_bin / "codex"
    fake_codex.write_text(
        "#!/usr/bin/env python3\n"
        "import json, os, sys\n"
        f"json.dump({{'home': os.environ.get('CODEX_HOME'), 'argv': sys.argv[1:]}}, open({str(observed)!r}, 'w'))\n",
        encoding="utf-8",
    )
    fake_codex.chmod(0o755)
    env = os.environ.copy()
    env.update({"PATH": f"{fake_bin}:/usr/bin:/bin", "CODEX_RUNTIME_ROOT": str(runtime_root)})

    result = subprocess.run(
        [str(LAUNCHER), "root", "--version", "--flag"],
        check=False,
        text=True,
        capture_output=True,
        env=env,
    )

    assert result.returncode == 0, result.stderr
    assert json.loads(observed.read_text(encoding="utf-8")) == {
        "home": str(runtime_root / "root"),
        "argv": ["--version", "--flag"],
    }


def test_launcher_rejects_unknown_or_unsynced_role(tmp_path: Path) -> None:
    env = os.environ.copy()
    env["CODEX_RUNTIME_ROOT"] = str(tmp_path / "runtime")
    unknown = subprocess.run(
        [str(LAUNCHER), "unknown"], check=False, text=True, capture_output=True, env=env
    )
    missing = subprocess.run(
        [str(LAUNCHER), "peer"], check=False, text=True, capture_output=True, env=env
    )

    assert unknown.returncode == 64
    assert "usage: codex-room" in unknown.stderr
    assert missing.returncode != 0
    assert "missing synced runtime" in missing.stderr
