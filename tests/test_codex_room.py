from __future__ import annotations

import json
import os
import subprocess
import tomllib
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SYNC = REPO_ROOT / "scripts" / "codex-room-sync"
ROOM = REPO_ROOT / "scripts" / "codex-room"
ROLES = ("supervisor", "root", "peer")


BASELINE = '''model = "gpt-5.6-luna"
model_reasoning_effort = "medium"

disable_response_storage = true

[features]
hooks = true
'''


PROFILE_TEMPLATE = '''name = "{role}"
description = "test {role}"
model_reasoning_effort = "{thinking}"
developer_instructions = """
{role_upper}_INSTRUCTIONS
"""
'''


def make_project(tmp_path: Path) -> tuple[Path, Path, Path]:
    repo = tmp_path / "project"
    profiles = repo / ".codex" / "agents"
    profiles.mkdir(parents=True)
    config_model = """[supervisor]
provider=codex-supervisor
model=gpt-5.6-luna
thinking=medium

[root]
provider=codex-root
model=gpt-5.6-luna
thinking=max

[peer]
provider=codex-peer
model=gpt-5.6-luna
thinking=high
"""
    (repo / "config.model").write_text(config_model, encoding="utf-8")
    for role, thinking in (("supervisor", "medium"), ("root", "max"), ("peer", "high")):
        (profiles / f"{role}.toml").write_text(
            PROFILE_TEMPLATE.format(role=role, thinking=thinking, role_upper=role.upper()),
            encoding="utf-8",
        )

    codex_home = tmp_path / "codex"
    (codex_home / "skills").mkdir(parents=True)
    (codex_home / "plugins").mkdir(parents=True)
    (codex_home / "auth.json").write_text(json.dumps({"token": "test"}), encoding="utf-8")
    (codex_home / "config.toml").write_text(BASELINE, encoding="utf-8")
    return repo, codex_home, tmp_path / "runtime"


def run_sync(repo: Path, codex_home: Path, runtime: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [
            str(SYNC),
            "--repo-root",
            str(repo),
            "--codex-home",
            str(codex_home),
            "--runtime-root",
            str(runtime),
        ],
        check=False,
        text=True,
        capture_output=True,
    )


def test_sync_generates_role_config_and_shared_links(tmp_path: Path) -> None:
    repo, codex_home, runtime = make_project(tmp_path)

    result = run_sync(repo, codex_home, runtime)

    assert result.returncode == 0, result.stderr
    config = tomllib.loads((runtime / "root" / "config.toml").read_text(encoding="utf-8"))
    assert config["model"] == "gpt-5.6-luna"
    assert config["model_reasoning_effort"] == "max"
    assert "ROOT_INSTRUCTIONS" in config["developer_instructions"]
    assert config["features"]["hooks"] is True
    assert (runtime / "root" / "auth.json").is_symlink()
    assert (runtime / "root" / "skills").is_symlink()
    assert (runtime / "root" / "plugins").is_symlink()


def test_sync_generates_all_roles_with_role_specific_reasoning(tmp_path: Path) -> None:
    repo, codex_home, runtime = make_project(tmp_path)

    result = run_sync(repo, codex_home, runtime)

    assert result.returncode == 0, result.stderr
    for role, thinking in (("supervisor", "medium"), ("root", "max"), ("peer", "high")):
        config = tomllib.loads((runtime / role / "config.toml").read_text(encoding="utf-8"))
        assert config["model"] == "gpt-5.6-luna"
        assert config["model_reasoning_effort"] == thinking
        assert config["features"]["hooks"] is True
        assert f"{role.upper()}_INSTRUCTIONS" in config["developer_instructions"]


def test_sync_creates_only_required_shared_symlinks(tmp_path: Path) -> None:
    repo, codex_home, runtime = make_project(tmp_path)

    result = run_sync(repo, codex_home, runtime)

    assert result.returncode == 0, result.stderr
    for role in ROLES:
        role_runtime = runtime / role
        assert (role_runtime / "config.toml").is_file()
        assert not (role_runtime / "config.toml").is_symlink()
        for name in ("auth.json", "skills", "plugins"):
            link = role_runtime / name
            assert link.is_symlink()
            assert link.resolve() == (codex_home / name).resolve()


def test_sync_rejects_invalid_provider_before_mutating_runtime(tmp_path: Path) -> None:
    repo, codex_home, runtime = make_project(tmp_path)
    peer_config = repo / "config.model"
    peer_config.write_text(
        peer_config.read_text(encoding="utf-8").replace("provider=codex-peer", "provider=peer"),
        encoding="utf-8",
    )
    sentinel = runtime / "root" / "config.toml"
    sentinel.parent.mkdir(parents=True)
    sentinel.write_text("sentinel", encoding="utf-8")

    result = run_sync(repo, codex_home, runtime)

    assert result.returncode != 0
    assert "codex-peer" in result.stderr
    assert sentinel.read_text(encoding="utf-8") == "sentinel"


def test_sync_rejects_missing_shared_target(tmp_path: Path) -> None:
    repo, codex_home, runtime = make_project(tmp_path)
    (codex_home / "plugins").rmdir()

    result = run_sync(repo, codex_home, runtime)

    assert result.returncode != 0
    assert "plugins" in result.stderr
    assert not runtime.exists()


def write_fake_codex(bin_dir: Path, capture: Path) -> None:
    bin_dir.mkdir(parents=True)
    fake = bin_dir / "codex"
    fake.write_text(
        "#!/bin/sh\n"
        f'printf \'%s\\n\' "$CODEX_HOME" > "{capture}"\n'
        "printf '%s\\n' \"$@\" >> "
        f'"{capture}"\n',
        encoding="utf-8",
    )
    fake.chmod(0o755)


def test_launcher_sets_role_home_and_forwards_arguments(tmp_path: Path) -> None:
    repo, codex_home, runtime = make_project(tmp_path)
    sync_result = run_sync(repo, codex_home, runtime)
    assert sync_result.returncode == 0, sync_result.stderr
    fake_bin = tmp_path / "bin"
    capture = tmp_path / "capture.txt"
    write_fake_codex(fake_bin, capture)
    env = {
        **os.environ,
        "HOME": str(tmp_path / "home"),
        "PATH": f"{fake_bin}:{os.environ['PATH']}",
        "CODEX_RUNTIME_ROOT": str(runtime),
    }

    result = subprocess.run(
        [str(ROOM), "root", "--version", "--flag"],
        check=False,
        text=True,
        capture_output=True,
        env=env,
    )

    assert result.returncode == 0, result.stderr
    assert capture.read_text(encoding="utf-8").splitlines() == [
        str(runtime / "root"),
        "--version",
        "--flag",
    ]


def test_launcher_rejects_unknown_or_unsynced_role(tmp_path: Path) -> None:
    runtime = tmp_path / "runtime"
    runtime.mkdir()
    env = {**os.environ, "HOME": str(tmp_path / "home"), "CODEX_RUNTIME_ROOT": str(runtime)}

    unknown = subprocess.run(
        [str(ROOM), "admin", "--version"],
        check=False,
        text=True,
        capture_output=True,
        env=env,
    )
    unsynced = subprocess.run(
        [str(ROOM), "peer", "--version"],
        check=False,
        text=True,
        capture_output=True,
        env=env,
    )

    assert unknown.returncode != 0
    assert "supervisor|root|peer" in unknown.stderr
    assert unsynced.returncode != 0
    assert "codex-room-sync" in unsynced.stderr
