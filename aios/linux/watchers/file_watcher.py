#!/usr/bin/env python3
"""AIOS Linux File Watcher — polls directories and notifies backend of file changes."""
import os
import sys
import time
import logging
import requests
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("aios-watcher")

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
USER_ID = os.getenv("AIOS_USER_ID", "")
WATCH_DIRS = [d.strip() for d in os.getenv("WATCH_DIRECTORIES", "").split(",") if d.strip()]
POLL_INTERVAL = int(os.getenv("WATCHER_POLL_INTERVAL", "10"))

IGNORED_EXTENSIONS = {".pyc", ".pyo", ".swp", ".tmp", ".log"}
IGNORED_DIRS = {".git", "__pycache__", "node_modules", ".venv", "venv"}

seen_files: dict = {}


def should_ignore(path: Path) -> bool:
    return path.suffix in IGNORED_EXTENSIONS or any(p in IGNORED_DIRS for p in path.parts)


def notify_backend(filepath: str, event_type: str):
    if not USER_ID:
        return
    try:
        requests.post(
            f"{BACKEND_URL}/api/events/",
            json={
                "user_id": USER_ID,
                "event_type": event_type,
                "source": "linux_watcher",
                "actor": "system",
                "summary": f"File {event_type}: {filepath}",
                "content": {"filepath": filepath},
            },
            timeout=5,
        )
    except Exception as e:
        log.warning(f"Backend notify failed: {e}")


def scan_directories():
    global seen_files
    current: dict = {}
    for watch_dir in WATCH_DIRS:
        base = Path(watch_dir).expanduser()
        if not base.exists():
            continue
        for path in base.rglob("*"):
            if not path.is_file() or should_ignore(path):
                continue
            try:
                mtime = path.stat().st_mtime
                sp = str(path)
                current[sp] = mtime
                if sp not in seen_files:
                    log.info(f"New file detected: {sp}")
                    notify_backend(sp, "file_created")
                elif seen_files[sp] != mtime:
                    log.info(f"File modified: {sp}")
                    notify_backend(sp, "file_modified")
            except PermissionError:
                pass
    seen_files = current


def main():
    if not WATCH_DIRS:
        log.error("No WATCH_DIRECTORIES configured in .env")
        sys.exit(1)
    log.info(f"AIOS file watcher started. Watching: {WATCH_DIRS}")
    while True:
        scan_directories()
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
