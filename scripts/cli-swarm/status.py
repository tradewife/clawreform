#!/usr/bin/env python3
"""Summarize swarm session state from the generated manifest and logs."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", help="Path to .swarm/<name>/manifest.json")
    return parser.parse_args()


def tail_text(path: Path, limit: int = 8) -> list[str]:
    if not path.exists():
        return ["<no log yet>"]
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    return lines[-limit:] if lines else ["<empty log>"]


def main() -> int:
    args = parse_args()
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    print(f"swarm: {manifest['name']}")
    print(f"workspace: {manifest['workspace']}")
    print(f"sandboxed: {manifest.get('sandboxed')}")
    print(f"control tasks: {manifest['control']['tasks']}")
    print()
    for session in manifest["sessions"]:
        print(f"[{session['role']}] {session['name']} :: {session['tool']} :: {session['model']}")
        print(f"log: {session['log_file']}")
        for line in tail_text(Path(session["log_file"])):
            print(f"  {line}")
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
