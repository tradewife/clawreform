#!/usr/bin/env python3
"""Prepare and optionally launch a multi-CLI swarm with pi as coordinator."""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import shlex
import shutil
import subprocess
import sys
from dataclasses import asdict, dataclass
from typing import Iterable


SUPPORTED_TOOLS = ("gemini", "opencode", "codex", "claude")
DEFAULT_MODELS = {
    "pi": "google/gemini-2.5-pro",
    "gemini": "gemini-2.5-pro",
    "opencode": "google/gemini-2.5-pro",
    "codex": "gpt-5.4",
    "claude": "claude-sonnet-4-5",
}
WORKER_PROMPT = (
    "You are a swarm worker for this repository. Work only inside the provided workspace, "
    "leave a concise status trail in your session, and hand results back to the pi coordinator."
)
COORDINATOR_PROMPT = (
    "You are the nominal orchestrator for this repo-local swarm. Delegate build, e2e, proof, "
    "demo-video, and remediation work across the available worker CLIs. Use sandbox-safe commands "
    "and keep artifacts under output/ and .swarm/."
)


@dataclass
class SessionSpec:
    name: str
    role: str
    tool: str
    model: str
    workdir: str
    state_dir: str
    log_file: str
    prompt_file: str
    command: list[str]
    launch_command: list[str]
    screen_command: list[str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--count", "-n", type=int, required=True, help="Total worker count.")
    parser.add_argument(
        "--tools",
        default="gemini,opencode,codex,claude",
        help="Comma-separated worker tools. Default: gemini,opencode,codex,claude",
    )
    parser.add_argument(
        "--coordinator",
        default="pi",
        help="Coordinator CLI. Default: pi",
    )
    parser.add_argument(
        "--name",
        default="default",
        help="Swarm run name. Output goes under .swarm/<name>/",
    )
    parser.add_argument(
        "--workspace",
        default=".",
        help="Workspace root for all sessions.",
    )
    parser.add_argument(
        "--launch",
        action="store_true",
        help="Launch detached screen sessions after preparing files.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite an existing swarm directory.",
    )
    parser.add_argument(
        "--no-sandbox",
        action="store_true",
        help="Launch sessions directly instead of wrapping them in bubblewrap.",
    )
    parser.add_argument(
        "--require-sandbox",
        action="store_true",
        help="Fail instead of falling back when bubblewrap is unavailable in this environment.",
    )
    return parser.parse_args()


def tool_binary(tool: str) -> str:
    resolved = shutil.which(tool)
    if not resolved:
        raise SystemExit(f"Required CLI not found in PATH: {tool}")
    return resolved


def require_screen() -> str:
    resolved = shutil.which("screen")
    if not resolved:
        raise SystemExit("`screen` is required for --launch.")
    return resolved


def bubblewrap_available(workspace: pathlib.Path) -> tuple[bool, str | None]:
    bwrap = shutil.which("bwrap")
    if not bwrap:
        return False, "bwrap not found in PATH"
    probe = subprocess.run(
        [
            bwrap,
            "--ro-bind",
            "/",
            "/",
            "--bind",
            str(workspace),
            str(workspace),
            "--dev",
            "/dev",
            "--proc",
            "/proc",
            "--tmpfs",
            "/tmp",
            "--chdir",
            str(workspace),
            "bash",
            "-lc",
            "pwd >/dev/null",
        ],
        capture_output=True,
        text=True,
    )
    if probe.returncode == 0:
        return True, None
    reason = probe.stderr.strip() or probe.stdout.strip() or f"exit {probe.returncode}"
    return False, reason


def repo_root(workspace: str) -> pathlib.Path:
    return pathlib.Path(workspace).resolve()


def ensure_clean_dir(path: pathlib.Path, force: bool) -> None:
    if path.exists():
        if not force:
            raise SystemExit(f"{path} already exists; rerun with --force to replace it.")
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def distribute(total: int, tools: Iterable[str]) -> list[str]:
    ordered = list(tools)
    if total < 1:
        raise SystemExit("--count must be at least 1")
    return [ordered[idx % len(ordered)] for idx in range(total)]


def local_env_exports(root: pathlib.Path, tool: str, session_dir: pathlib.Path) -> dict[str, str]:
    home_dir = root / "homes" / tool
    for directory in (
        home_dir,
        home_dir / ".config",
        home_dir / ".local" / "share",
        home_dir / ".local" / "state",
        home_dir / ".cache",
        home_dir / ".pi" / "agent",
        home_dir / ".codex",
        home_dir / ".config" / "opencode",
        home_dir / ".local" / "share" / "opencode",
        home_dir / ".gemini",
        home_dir / ".claude",
        session_dir,
    ):
        directory.mkdir(parents=True, exist_ok=True)
    env = {
        "HOME": str(home_dir),
        "XDG_CONFIG_HOME": str(home_dir / ".config"),
        "XDG_DATA_HOME": str(home_dir / ".local" / "share"),
        "XDG_STATE_HOME": str(home_dir / ".local" / "state"),
        "XDG_CACHE_HOME": str(home_dir / ".cache"),
        "PI_CODING_AGENT_DIR": str(home_dir / ".pi" / "agent"),
        "PI_OFFLINE": "1",
        "CODEX_HOME": str(home_dir / ".codex"),
        "OPENCODE_CONFIG_HOME": str(home_dir / ".config" / "opencode"),
        "OPENCODE_DATA_HOME": str(home_dir / ".local" / "share" / "opencode"),
        "GEMINI_CLI_HOME": str(home_dir / ".gemini"),
        "CLAUDE_CONFIG_DIR": str(home_dir / ".claude"),
        "SWARM_SESSION_DIR": str(session_dir),
    }
    for key in ("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY", "OPENCODE_API_KEY", "OPENROUTER_API_KEY"):
        if key in os.environ:
            env[key] = os.environ[key]
    return env


def render_shell_command(command: list[str], env: dict[str, str], cwd: pathlib.Path, log_file: pathlib.Path) -> str:
    exports = " ".join(f"{key}={shlex.quote(value)}" for key, value in env.items())
    quoted = " ".join(shlex.quote(part) for part in command)
    return f"cd {shlex.quote(str(cwd))} && mkdir -p {shlex.quote(str(log_file.parent))} && env {exports} {quoted} >> {shlex.quote(str(log_file))} 2>&1"


def wrap_launch_command(shell_command: str, workspace: pathlib.Path, sandboxed: bool) -> list[str]:
    if not sandboxed:
        return ["bash", "-lc", shell_command]
    return [
        tool_binary("bwrap"),
        "--ro-bind",
        "/",
        "/",
        "--bind",
        str(workspace),
        str(workspace),
        "--dev",
        "/dev",
        "--proc",
        "/proc",
        "--tmpfs",
        "/tmp",
        "--chdir",
        str(workspace),
        "bash",
        "-lc",
        shell_command,
    ]


def base_command(tool: str, workspace: pathlib.Path, role: str, model: str, prompt_file: pathlib.Path) -> list[str]:
    if tool == "pi":
        return [
            tool_binary("pi"),
            "--session-dir",
            str(prompt_file.parent.parent / "state" / prompt_file.stem / "sessions"),
            "--model",
            model,
            "--tools",
            "read,bash,edit,write,grep,find,ls",
            "--append-system-prompt",
            str(prompt_file),
        ]
    if tool == "gemini":
        return [tool_binary("gemini"), "--model", model, "--prompt", WORKER_PROMPT]
    if tool == "opencode":
        return [tool_binary("opencode"), str(workspace), "--model", model, "--prompt", WORKER_PROMPT]
    if tool == "codex":
        return [
            tool_binary("codex"),
            "--full-auto",
            "-C",
            str(workspace),
            "--model",
            model,
            "-c",
            "shell_environment_policy.inherit=all",
            WORKER_PROMPT,
        ]
    if tool == "claude":
        return [
            tool_binary("claude"),
            "--permission-mode",
            "auto",
            "--add-dir",
            str(workspace),
            "--model",
            model,
            "--append-system-prompt",
            WORKER_PROMPT,
        ]
    raise SystemExit(f"Unsupported tool: {tool}")


def create_prompt_file(path: pathlib.Path, role: str, prompt: str, workspace: pathlib.Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    body = (
        f"Role: {role}\n"
        f"Workspace: {workspace}\n"
        "Artifacts: output/, .swarm/\n"
        f"Instructions: {prompt}\n"
    )
    path.write_text(body, encoding="utf-8")


def create_spec(
    run_root: pathlib.Path,
    workspace: pathlib.Path,
    name: str,
    role: str,
    tool: str,
    index: int,
    sandboxed: bool,
) -> SessionSpec:
    tool_name = "pi" if role == "coordinator" else tool
    slug = f"{name}-{role}-{index:02d}-{tool_name}"
    state_dir = run_root / "state" / slug
    prompt_file = run_root / "prompts" / f"{slug}.txt"
    log_file = run_root / "logs" / f"{slug}.log"
    state_dir.mkdir(parents=True, exist_ok=True)
    (state_dir / "sessions").mkdir(parents=True, exist_ok=True)
    prompt = COORDINATOR_PROMPT if role == "coordinator" else WORKER_PROMPT
    create_prompt_file(prompt_file, role, prompt, workspace)
    model = DEFAULT_MODELS[tool_name]
    command = base_command(tool_name, workspace, role, model, prompt_file)
    env = local_env_exports(run_root, tool_name, state_dir / "sessions")
    shell_command = render_shell_command(command, env, workspace, log_file)
    launch_command = wrap_launch_command(shell_command, workspace, sandboxed)
    screen_name = f"swarm-{name}-{index:02d}-{tool_name}"
    screen_command = [require_screen(), "-dmS", screen_name, *launch_command]
    return SessionSpec(
        name=screen_name,
        role=role,
        tool=tool_name,
        model=model,
        workdir=str(workspace),
        state_dir=str(state_dir),
        log_file=str(log_file),
        prompt_file=str(prompt_file),
        command=command,
        launch_command=launch_command,
        screen_command=screen_command,
    )


def write_control_plane(run_root: pathlib.Path, workspace: pathlib.Path, name: str, count: int, tools: list[str]) -> dict[str, object]:
    control_dir = run_root / "control"
    control_dir.mkdir(parents=True, exist_ok=True)
    tasks = [
        {
            "id": "build",
            "goal": "Compile the workspace cleanly.",
            "default_command": "cargo build --workspace --lib",
            "success_signal": "exit_code == 0",
        },
        {
            "id": "test",
            "goal": "Run the core test surface.",
            "default_command": "cargo test --workspace",
            "success_signal": "exit_code == 0",
        },
        {
            "id": "lint",
            "goal": "Hold warnings at zero where the repo expects it.",
            "default_command": "cargo clippy --workspace --all-targets -- -D warnings",
            "success_signal": "exit_code == 0",
        },
        {
            "id": "proof",
            "goal": "Generate browser proof artifacts for the live dashboard.",
            "default_command": "scripts/dashboard-proof.sh http://127.0.0.1:4332/#agents",
            "success_signal": "output/playwright contains fresh proof artifacts",
        },
        {
            "id": "demo",
            "goal": "Generate an end-to-end demo video from the proof path.",
            "default_command": "scripts/cli-swarm/proof-demo.sh http://127.0.0.1:4332/#agents",
            "success_signal": "output/demo contains video or reportable skip reason",
        },
        {
            "id": "remediate",
            "goal": "Fix failures and rerun the narrowest failing stage first.",
            "default_command": "Use the smallest reproducer, patch, rerun, then fold back into full verification.",
            "success_signal": "previously failing stage passes",
        },
    ]
    mission = (
        f"# Swarm Mission: {name}\n\n"
        f"Workspace: {workspace}\n"
        f"Coordinator: pi\n"
        f"Workers: {count}\n"
        f"Tool pool: {', '.join(tools)}\n\n"
        "First principles:\n"
        "1. Preserve reproducibility: all state stays in .swarm/, output/, or the workspace.\n"
        "2. Prefer the narrowest failing surface before broad reruns.\n"
        "3. Treat build, test, proof, and demo artifacts as separate evidence layers.\n"
        "4. When blocked by missing auth, dependencies, or services, record the concrete missing prerequisite.\n"
    )
    (control_dir / "mission.md").write_text(mission, encoding="utf-8")
    (control_dir / "tasks.json").write_text(json.dumps(tasks, indent=2) + "\n", encoding="utf-8")
    return {"mission": str(control_dir / "mission.md"), "tasks": str(control_dir / "tasks.json")}


def main() -> int:
    args = parse_args()
    worker_tools = [tool.strip() for tool in args.tools.split(",") if tool.strip()]
    for tool in worker_tools:
        if tool not in SUPPORTED_TOOLS:
            raise SystemExit(f"Unsupported tool in --tools: {tool}")
        tool_binary(tool)
    tool_binary(args.coordinator)

    workspace = repo_root(args.workspace)
    run_root = workspace / ".swarm" / args.name
    ensure_clean_dir(run_root, args.force)
    (run_root / "logs").mkdir(parents=True, exist_ok=True)
    sandbox_requested = not args.no_sandbox
    sandbox_effective = sandbox_requested
    sandbox_probe_reason = None
    if sandbox_requested:
        sandbox_effective, sandbox_probe_reason = bubblewrap_available(workspace)
        if not sandbox_effective and args.require_sandbox:
            raise SystemExit(f"Sandbox requested but unavailable: {sandbox_probe_reason}")
    control_paths = write_control_plane(run_root, workspace, args.name, args.count, worker_tools)

    specs: list[SessionSpec] = []
    specs.append(create_spec(run_root, workspace, args.name, "coordinator", args.coordinator, 0, sandbox_effective))
    for idx, tool in enumerate(distribute(args.count, worker_tools), start=1):
        specs.append(create_spec(run_root, workspace, args.name, "worker", tool, idx, sandbox_effective))

    manifest_path = run_root / "manifest.json"
    manifest_path.write_text(
        json.dumps(
            {
                "name": args.name,
                "workspace": str(workspace),
                "count": args.count,
                "tools": worker_tools,
                "coordinator": args.coordinator,
                "sandbox_requested": sandbox_requested,
                "sandboxed": sandbox_effective,
                "sandbox_probe_reason": sandbox_probe_reason,
                "control": control_paths,
                "sessions": [asdict(spec) for spec in specs],
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"Prepared swarm manifest: {manifest_path}")
    if sandbox_requested and not sandbox_effective:
        print(f"Sandbox fallback: {sandbox_probe_reason}")
    for spec in specs:
        print(f"[{spec.role}] {spec.name}")
        print("  command:", " ".join(shlex.quote(part) for part in spec.screen_command))
        print("  log:", spec.log_file)

    if args.launch:
        for spec in specs:
            subprocess.run(spec.screen_command, check=True)
        print("\nDetached sessions launched.")
        print(f"List sessions: screen -ls | grep swarm-{args.name}")
        print(f"Attach to coordinator: screen -r {specs[0].name}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
