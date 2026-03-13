#!/usr/bin/env python3
"""Prepare per-task worktrees and launch visible multi-CLI windows with kitty."""

from __future__ import annotations

import argparse
import ast
import json
import os
import pathlib
import re
import shlex
import shutil
import subprocess
import sys
from dataclasses import asdict, dataclass


WORKER_PROMPT = (
    "You are a launch-task agent for the clawREFORM repository. Work only inside the assigned "
    "git worktree. Read the commander doc, your task brief, and the metallic launch baseline "
    "before acting. Write artifacts to the required output/launch directory and keep a concise "
    "handoff trail."
)
KITTY_PROFILE_NAME = "pi"
RGB_TRIPLE = re.compile(r"rgb\((\d+),(\d+),(\d+)\)")
HUNTER_ALPHA_MODEL = "openrouter/openrouter/hunter-alpha"


@dataclass(frozen=True)
class TaskSpec:
    task_id: int
    slug: str
    title: str
    cli: str
    model: str
    doc_name: str

    @property
    def branch(self) -> str:
        return f"launch/{self.task_id:02d}-{self.slug}"

    @property
    def worktree_dir(self) -> str:
        return f"{self.task_id:02d}-{self.slug}"

    @property
    def artifact_slug(self) -> str:
        return f"{self.task_id:02d}-{self.slug}"


TASKS: dict[int, TaskSpec] = {
    1: TaskSpec(1, "pre-site-deployment", "01 Site Deployment", "opencode", HUNTER_ALPHA_MODEL, "1_clawREFORM_pre-site-deployment.md"),
    2: TaskSpec(2, "audit-dl-path", "02 Download Audit", "opencode", HUNTER_ALPHA_MODEL, "2_clawREFORM_audit_dl-path.md"),
    3: TaskSpec(3, "release-packaging-proof", "03 Packaging Proof", "opencode", HUNTER_ALPHA_MODEL, "3_clawREFORM_release-packaging-proof.md"),
    4: TaskSpec(4, "onboarding-first-run-smoke", "04 First Run Smoke", "opencode", HUNTER_ALPHA_MODEL, "4_clawREFORM_onboarding-first-run-smoke.md"),
    5: TaskSpec(5, "parallel-proof-screenshots", "05 Proof Screenshots", "opencode", HUNTER_ALPHA_MODEL, "5_clawREFORM_parallel-proof-screenshots.md"),
    6: TaskSpec(6, "public-alpha-go-live", "06 Go Live", "opencode", HUNTER_ALPHA_MODEL, "6_clawREFORM_public-alpha-go-live.md"),
    7: TaskSpec(7, "twitter-x-launch-chain", "07 X Launch", "opencode", HUNTER_ALPHA_MODEL, "7_clawREFORM_twitter-x-launch-chain.md"),
    8: TaskSpec(8, "youtube-launch-automation", "08 YouTube", "opencode", HUNTER_ALPHA_MODEL, "8_clawREFORM_youtube-launch-automation.md"),
    9: TaskSpec(9, "reddit-medium-quora-chain", "09 Community Content", "opencode", HUNTER_ALPHA_MODEL, "9_clawREFORM_reddit-medium-quora-chain.md"),
    10: TaskSpec(10, "content-creator", "10 Content Creator", "opencode", HUNTER_ALPHA_MODEL, "10_clawREFORM_content-creator.md"),
    11: TaskSpec(11, "content-distributor", "11 Distribution", "opencode", HUNTER_ALPHA_MODEL, "11_clawREFORM_content-distributor.md"),
    12: TaskSpec(12, "email-list-super-sherlock", "12 Email Sherlock", "opencode", HUNTER_ALPHA_MODEL, "12_clawREFORM_email-list-super-sherlock.md"),
    13: TaskSpec(13, "launch-control-room", "13 Control Room", "opencode", HUNTER_ALPHA_MODEL, "13_clawREFORM_launch-control-room.md"),
    14: TaskSpec(14, "design-system-translation", "14 Design Translation", "opencode", HUNTER_ALPHA_MODEL, "14_clawREFORM_design-system-translation.md"),
}

GROUPS: dict[str, list[int]] = {
    "immediate": [1, 2, 4, 5, 10, 13, 14],
    "content": [7, 8, 9, 12],
    "followup": [3, 11],
    "go-live": [6],
    "all": [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14],
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--name", default="launch-alpha", help="Run name for .swarm state.")
    parser.add_argument(
        "--group",
        choices=sorted(GROUPS),
        default="immediate",
        help="Predefined task group to prepare.",
    )
    parser.add_argument(
        "--tasks",
        help="Comma-separated task IDs. Overrides --group if provided.",
    )
    parser.add_argument(
        "--worktree-root",
        default=".worktrees",
        help="Directory under the repo root that will hold linked worktrees.",
    )
    parser.add_argument(
        "--launch",
        action="store_true",
        help="Start per-task tmux sessions and open visible kitty windows attached to them.",
    )
    parser.add_argument(
        "--open-windows-only",
        action="store_true",
        help="Open the generated kitty session and attach to existing tmux task sessions without restarting them.",
    )
    parser.add_argument(
        "--isolate-cli-state",
        action="store_true",
        help="Use per-task HOME/XDG directories instead of your normal local CLI auth/config.",
    )
    return parser.parse_args()


def repo_root() -> pathlib.Path:
    return pathlib.Path(__file__).resolve().parents[2]


def require_binary(name: str) -> str:
    resolved = shutil.which(name)
    if not resolved:
        raise SystemExit(f"Required binary not found in PATH: {name}")
    return resolved


def resolve_tasks(args: argparse.Namespace) -> list[TaskSpec]:
    task_ids = GROUPS[args.group]
    if args.tasks:
        task_ids = [int(part.strip()) for part in args.tasks.split(",") if part.strip()]
    unknown = [task_id for task_id in task_ids if task_id not in TASKS]
    if unknown:
        raise SystemExit(f"Unknown task IDs: {unknown}")
    return [TASKS[task_id] for task_id in task_ids]


def run(cmd: list[str], cwd: pathlib.Path) -> None:
    subprocess.run(cmd, cwd=cwd, check=True)


def branch_exists(workspace: pathlib.Path, branch: str) -> bool:
    result = subprocess.run(
        ["git", "show-ref", "--verify", "--quiet", f"refs/heads/{branch}"],
        cwd=workspace,
    )
    return result.returncode == 0


def ensure_worktree(workspace: pathlib.Path, worktree_root: pathlib.Path, task: TaskSpec) -> pathlib.Path:
    worktree_path = worktree_root / task.worktree_dir
    if worktree_path.exists():
        return worktree_path

    cmd = ["git", "worktree", "add", str(worktree_path)]
    if branch_exists(workspace, task.branch):
        cmd.append(task.branch)
    else:
        cmd.extend(["-b", task.branch, "HEAD"])
    run(cmd, workspace)
    return worktree_path


def copy_missing_tree(src: pathlib.Path, dst: pathlib.Path) -> None:
    if not dst.exists():
        shutil.copytree(src, dst)
        return

    for path in src.rglob("*"):
        target = dst / path.relative_to(src)
        if path.is_dir():
            target.mkdir(parents=True, exist_ok=True)
            continue
        if not target.exists():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)


def parse_dconf_profiles(output: str) -> list[dict[str, str]]:
    profiles: list[dict[str, str]] = []
    current: dict[str, str] | None = None
    for raw_line in output.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("[") and line.endswith("]"):
            if current:
                profiles.append(current)
            current = {"section": line[1:-1]}
            continue
        if current is None or "=" not in line:
            continue
        key, value = line.split("=", 1)
        current[key] = value
    if current:
        profiles.append(current)
    return profiles


def parse_dconf_string(raw: str | None) -> str | None:
    if raw is None:
        return None
    return ast.literal_eval(raw)


def dconf_color_to_hex(value: str | None) -> str | None:
    if not value:
        return None
    if value.startswith("#"):
        return value.lower()
    match = RGB_TRIPLE.fullmatch(value)
    if not match:
        return None
    return "#" + "".join(f"{int(channel):02x}" for channel in match.groups())


def gnome_terminal_profile(name: str) -> dict[str, str] | None:
    result = subprocess.run(
        ["dconf", "dump", "/org/gnome/terminal/legacy/profiles:/"],
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return None
    for profile in parse_dconf_profiles(result.stdout):
        if parse_dconf_string(profile.get("visible-name")) == name:
            return profile
    return None


def write_kitty_profile_config(run_root: pathlib.Path, profile_name: str = KITTY_PROFILE_NAME) -> pathlib.Path | None:
    profile = gnome_terminal_profile(profile_name)
    if not profile:
        return None

    config_lines = [
        "# Generated by launch_live_windows.py from GNOME Terminal profile",
        "allow_remote_control yes",
    ]

    background = dconf_color_to_hex(parse_dconf_string(profile.get("background-color")))
    if background:
        config_lines.append(f"background {background}")

    transparency = profile.get("background-transparency-percent")
    if profile.get("use-transparent-background") == "true" and transparency is not None:
        try:
            opacity = max(0.05, min(1.0, 1.0 - (int(transparency) / 100.0)))
        except ValueError:
            opacity = None
        if opacity is not None:
            config_lines.append(f"background_opacity {opacity:.2f}")

    config_path = run_root / f"kitty-{profile_name}.conf"
    config_path.write_text("\n".join(config_lines) + "\n", encoding="utf-8")
    return config_path


def sync_bootstrap_docs(workspace: pathlib.Path, worktree: pathlib.Path) -> None:
    src_launch = workspace / "docs" / "launch-tasks"
    dst_launch = worktree / "docs" / "launch-tasks"
    copy_missing_tree(src_launch, dst_launch)

    src_design = workspace / "docs" / "design" / "launch-metallic-baseline.md"
    dst_design = worktree / "docs" / "design" / "launch-metallic-baseline.md"
    if not dst_design.exists():
        dst_design.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src_design, dst_design)


def local_env_exports(
    run_root: pathlib.Path,
    cli_name: str,
    session_dir: pathlib.Path,
    isolate_cli_state: bool,
) -> dict[str, str]:
    session_dir.mkdir(parents=True, exist_ok=True)
    env = {
        "SWARM_SESSION_DIR": str(session_dir),
    }
    if cli_name == "pi":
        env["PI_OFFLINE"] = "1"

    if isolate_cli_state:
        home_dir = run_root / "homes" / cli_name
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
        ):
            directory.mkdir(parents=True, exist_ok=True)

        env.update(
            {
                "HOME": str(home_dir),
                "XDG_CONFIG_HOME": str(home_dir / ".config"),
                "XDG_DATA_HOME": str(home_dir / ".local" / "share"),
                "XDG_STATE_HOME": str(home_dir / ".local" / "state"),
                "XDG_CACHE_HOME": str(home_dir / ".cache"),
                "PI_CODING_AGENT_DIR": str(home_dir / ".pi" / "agent"),
                "CODEX_HOME": str(home_dir / ".codex"),
                "OPENCODE_CONFIG_HOME": str(home_dir / ".config" / "opencode"),
                "OPENCODE_DATA_HOME": str(home_dir / ".local" / "share" / "opencode"),
                "GEMINI_CLI_HOME": str(home_dir / ".gemini"),
                "CLAUDE_CONFIG_DIR": str(home_dir / ".claude"),
            }
        )
    forwarded = [
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "GEMINI_API_KEY",
        "GOOGLE_API_KEY",
        "OPENROUTER_API_KEY",
        "OPENCODE_API_KEY",
    ]
    for key in forwarded:
        if key in os.environ:
            env[key] = os.environ[key]
    return env


def create_prompt_file(task: TaskSpec, worktree: pathlib.Path, run_root: pathlib.Path) -> pathlib.Path:
    prompt_dir = run_root / "prompts"
    prompt_dir.mkdir(parents=True, exist_ok=True)
    prompt_file = prompt_dir / f"{task.task_id:02d}-{task.slug}.md"
    if prompt_file.exists():
        return prompt_file

    commander = "docs/launch-tasks/0_clawREFORM_launch-commander.md"
    baseline = "docs/design/launch-metallic-baseline.md"
    task_doc = f"docs/launch-tasks/{task.doc_name}"
    artifact_dir = f"output/launch/{task.artifact_slug}/"
    body = (
        f"{WORKER_PROMPT}\n\n"
        f"Assigned task: {task.title}\n"
        f"Primary docs to read first:\n"
        f"- {commander}\n"
        f"- {task_doc}\n"
        f"- {baseline}\n\n"
        f"Working directory: {worktree}\n"
        f"Artifact directory: {artifact_dir}\n"
        "Leave a concise handoff in the artifact directory when done.\n"
        "Capture screenshots for every meaningful proof step.\n"
    )
    prompt_file.write_text(body, encoding="utf-8")
    return prompt_file


def initial_prompt(task: TaskSpec) -> str:
    return (
        f"Start launch task {task.task_id} for clawREFORM now. "
        f"Read docs/launch-tasks/0_clawREFORM_launch-commander.md, "
        f"docs/launch-tasks/{task.doc_name}, and docs/design/launch-metallic-baseline.md, "
        f"then execute the prompt chain. Write all outputs to output/launch/{task.artifact_slug}/. "
        "Begin by stating the first concrete action, then do the work."
    )


def base_command(task: TaskSpec, worktree: pathlib.Path, prompt_file: pathlib.Path, session_dir: pathlib.Path) -> list[str]:
    cli = task.cli
    prompt = initial_prompt(task)
    if cli == "pi":
        return [
            require_binary("pi"),
            "--session-dir",
            str(session_dir),
            "--model",
            task.model,
            "--tools",
            "read,bash,edit,write,grep,find,ls",
            "--append-system-prompt",
            str(prompt_file),
            prompt,
        ]
    if cli == "gemini":
        return [require_binary("gemini"), "--model", task.model, "--prompt", prompt]
    if cli == "opencode":
        return [
            require_binary("opencode"),
            str(worktree),
            "--model",
            task.model,
            "--prompt",
            prompt,
        ]
    if cli == "codex":
        return [
            require_binary("codex"),
            "--full-auto",
            "-C",
            str(worktree),
            "--model",
            task.model,
            "-c",
            "shell_environment_policy.inherit=all",
            "-c",
            'model_reasoning_effort="high"',
            prompt,
        ]
    if cli == "claude":
        return [
            require_binary("claude"),
            "--permission-mode",
            "auto",
            "--add-dir",
            str(worktree),
            "--model",
            task.model,
            "--append-system-prompt",
            str(prompt_file),
            prompt,
        ]
    raise SystemExit(f"Unsupported CLI: {cli}")


def render_agent_shell_command(command: list[str], env: dict[str, str]) -> str:
    exports = " ".join(f"{key}={shlex.quote(value)}" for key, value in env.items())
    quoted = " ".join(shlex.quote(part) for part in command)
    return f"env {exports} {quoted}"


def tmux_session_name(run_name: str, task: TaskSpec) -> str:
    return f"{run_name}-{task.task_id:02d}-{task.slug}"


def write_tmux_scripts(
    task: TaskSpec,
    worktree: pathlib.Path,
    run_root: pathlib.Path,
    log_file: pathlib.Path,
    artifact_dir: pathlib.Path,
    agent_shell_command: str,
    tmux_session: str,
) -> tuple[pathlib.Path, pathlib.Path, pathlib.Path]:
    launcher_dir = run_root / "launchers"
    launcher_dir.mkdir(parents=True, exist_ok=True)
    status_dir = run_root / "status"
    status_dir.mkdir(parents=True, exist_ok=True)

    starter_script = launcher_dir / f"{task.task_id:02d}-{task.slug}-start.sh"
    window_script = launcher_dir / f"{task.task_id:02d}-{task.slug}-attach.sh"
    status_file = status_dir / f"{task.task_id:02d}-{task.slug}.status"

    start_body = "\n".join(
        [
            "#!/usr/bin/env bash",
            "set -uo pipefail",
            "",
            f"cd {shlex.quote(str(worktree))} || exit 1",
            f"mkdir -p {shlex.quote(str(log_file.parent))} {shlex.quote(str(artifact_dir))} {shlex.quote(str(status_file.parent))}",
            f"printf 'phase=%s\\n' 'running' > {shlex.quote(str(status_file))}",
            f"printf 'started_at=%s\\n' \"$(date -Is)\" >> {shlex.quote(str(status_file))}",
            f"printf 'runner_pid=%s\\n' \"$$\" >> {shlex.quote(str(status_file))}",
            f"printf 'task_id=%s\\n' {shlex.quote(str(task.task_id))} >> {shlex.quote(str(status_file))}",
            f"printf 'title=%s\\n' {shlex.quote(task.title)} >> {shlex.quote(str(status_file))}",
            f"printf 'worktree=%s\\n' {shlex.quote(str(worktree))} >> {shlex.quote(str(status_file))}",
            f"printf 'log_file=%s\\n' {shlex.quote(str(log_file))} >> {shlex.quote(str(status_file))}",
            f"printf 'artifact_dir=%s\\n' {shlex.quote(str(artifact_dir))} >> {shlex.quote(str(status_file))}",
            f"printf 'tmux_session=%s\\n' {shlex.quote(tmux_session)} >> {shlex.quote(str(status_file))}",
            "echo",
            f"echo '[launch] {task.title}'",
            f"echo '[launch] tmux session: {tmux_session}'",
            f"echo '[launch] log file: {log_file}'",
            f"echo '[launch] artifact dir: {artifact_dir}'",
            "echo",
            agent_shell_command,
            "status=$?",
            f"printf 'phase=%s\\n' 'finished' >> {shlex.quote(str(status_file))}",
            f"printf 'ended_at=%s\\n' \"$(date -Is)\" >> {shlex.quote(str(status_file))}",
            f"printf 'exit_code=%s\\n' \"$status\" >> {shlex.quote(str(status_file))}",
            "echo",
            f"echo '[task ended] {task.title} (exit '$status')'",
            f"echo 'log: {log_file}'",
            f"echo 'tmux session: {tmux_session}'",
            "exec bash -il",
        ]
    )
    starter_script.write_text(start_body + "\n", encoding="utf-8")
    starter_script.chmod(0o755)

    attach_body = "\n".join(
        [
            "#!/usr/bin/env bash",
            "set -uo pipefail",
            "",
            f"if ! tmux has-session -t {shlex.quote(tmux_session)} 2>/dev/null; then",
            f"  echo 'tmux session not running: {tmux_session}'",
            f"  echo 'start it with: {sys.executable} {pathlib.Path(__file__).resolve()} --name {run_root.name} --tasks {task.task_id} --launch'",
            "  exec bash -il",
            "fi",
            f"tmux attach-session -t {shlex.quote(tmux_session)}",
            "status=$?",
            "echo",
            f"echo '[window detached] {task.title} (status '$status')'",
            "exec bash -il",
        ]
    )
    window_script.write_text(attach_body + "\n", encoding="utf-8")
    window_script.chmod(0o755)
    return starter_script, window_script, status_file


def ensure_tmux_session(item: dict[str, str]) -> bool:
    tmux_binary = require_binary("tmux")
    tmux_session = item["tmux_session"]
    has_session = subprocess.run(
        [tmux_binary, "has-session", "-t", tmux_session],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    if has_session.returncode == 0:
        return False

    subprocess.run(
        [
            tmux_binary,
            "new-session",
            "-d",
            "-s",
            tmux_session,
            "-c",
            item["worktree"],
            f"bash -lc {shlex.quote(item['starter_script'])}",
        ],
        check=True,
    )
    subprocess.run(
        [
            tmux_binary,
            "pipe-pane",
            "-o",
            "-t",
            f"{tmux_session}:0.0",
            f"cat >> {shlex.quote(item['log_file'])}",
        ],
        check=True,
    )
    return True


def sync_launch_inputs(
    workspace: pathlib.Path,
    worktree: pathlib.Path,
    task: TaskSpec,
    run_name: str,
    isolate_cli_state: bool,
) -> dict[str, str]:
    sync_bootstrap_docs(workspace, worktree)

    artifact_root = worktree / "output" / "launch" / task.artifact_slug
    (artifact_root / "screenshots").mkdir(parents=True, exist_ok=True)

    run_root = worktree / ".swarm" / run_name
    prompt_file = create_prompt_file(task, worktree, run_root)
    session_dir = run_root / "sessions" / task.cli
    session_dir.mkdir(parents=True, exist_ok=True)
    log_file = run_root / "logs" / f"{task.task_id:02d}-{task.slug}.log"
    env = local_env_exports(run_root, task.cli, session_dir, isolate_cli_state)
    command = base_command(task, worktree, prompt_file, session_dir)
    agent_shell_command = render_agent_shell_command(command, env)
    tmux_session = tmux_session_name(run_name, task)
    starter_script, window_script, status_file = write_tmux_scripts(
        task=task,
        worktree=worktree,
        run_root=run_root,
        log_file=log_file,
        artifact_dir=artifact_root,
        agent_shell_command=agent_shell_command,
        tmux_session=tmux_session,
    )

    return {
        "task_id": str(task.task_id),
        "title": task.title,
        "branch": task.branch,
        "worktree": str(worktree),
        "artifact_dir": str(artifact_root),
        "prompt_file": str(prompt_file),
        "log_file": str(log_file),
        "status_file": str(status_file),
        "starter_script": str(starter_script),
        "window_script": str(window_script),
        "tmux_session": tmux_session,
        "cli_state_mode": "isolated" if isolate_cli_state else "shared-host",
        "runtime": "kitty-tmux",
        "agent_shell_command": agent_shell_command,
        "agent_command": " ".join(shlex.quote(part) for part in command),
    }


def build_kitty_session(run_root: pathlib.Path, selected: list[dict[str, str]]) -> pathlib.Path:
    session_file = run_root / "kitty-live.session"
    lines: list[str] = ["# Generated by launch_live_windows.py"]
    for index, item in enumerate(selected):
        if index > 0:
            lines.append(f"new_os_window {item['title']}")
        lines.append(f"cd {item['worktree']}")
        lines.append(f"title {item['title']}")
        lines.append(f"launch bash -lc {shlex.quote(item['window_script'])}")
        lines.append("")
    session_file.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return session_file


def write_manifest(run_root: pathlib.Path, selected: list[dict[str, str]], session_file: pathlib.Path) -> pathlib.Path:
    manifest = {
        "run_name": run_root.name,
        "session_file": str(session_file),
        "tasks": selected,
    }
    manifest_path = run_root / "visible-launch-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest_path


def main() -> int:
    args = parse_args()
    workspace = repo_root()
    worktree_root = workspace / args.worktree_root
    worktree_root.mkdir(parents=True, exist_ok=True)

    selected_tasks = resolve_tasks(args)
    run_root = workspace / ".swarm" / args.name
    run_root.mkdir(parents=True, exist_ok=True)

    selected: list[dict[str, str]] = []
    for task in selected_tasks:
        worktree = ensure_worktree(workspace, worktree_root, task)
        data = sync_launch_inputs(workspace, worktree, task, args.name, args.isolate_cli_state)
        selected.append(data)

    kitty_config = write_kitty_profile_config(run_root)
    session_file = build_kitty_session(run_root, selected)
    manifest_path = write_manifest(run_root, selected, session_file)

    print(f"Prepared visible launch manifest: {manifest_path}")
    print(f"Kitty session file: {session_file}")
    if kitty_config:
        print(f"Kitty profile config: {kitty_config}")
    for item in selected:
        print(f"[task {item['task_id']}] {item['title']}")
        print(f"  branch: {item['branch']}")
        print(f"  worktree: {item['worktree']}")
        print(f"  tmux: {item['tmux_session']}")
        print(f"  cli state: {item['cli_state_mode']}")
        print(f"  window: {item['window_script']}")
        print(f"  status: {item['status_file']}")
        print(f"  log: {item['log_file']}")

    if args.launch:
        created_sessions = 0
        for item in selected:
            if ensure_tmux_session(item):
                created_sessions += 1
        print(f"\nPrepared tmux task sessions: {created_sessions} created, {len(selected) - created_sessions} reused.")

    if args.launch or args.open_windows_only:
        kitty_command = [require_binary("kitty"), "--detach"]
        if kitty_config:
            kitty_command.extend(["--config", str(kitty_config)])
        kitty_command.extend(["--session", str(session_file)])
        subprocess.run(kitty_command, check=True)
        print("\nVisible kitty windows launched and attached to tmux task sessions.")
    else:
        print("\nPreparation complete.")
        print("Launch later with:")
        print(
            "  "
            + " ".join(
                shlex.quote(part)
                for part in [
                    sys.executable,
                    str(pathlib.Path(__file__).resolve()),
                    "--name",
                    args.name,
                    "--tasks",
                    ",".join(str(task.task_id) for task in selected_tasks),
                    "--launch",
                ]
            )
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
