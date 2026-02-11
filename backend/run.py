from __future__ import annotations

import os
import sys
from pathlib import Path

import uvicorn


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(project_root))

    host = os.environ.get("ALEX_HOST", "127.0.0.1")
    port = int(os.environ.get("ALEX_PORT", "8000"))
    reload = os.environ.get("ALEX_RELOAD", "1") not in {"0", "false", "False"}

    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=[str(project_root / "backend")],
        log_level=os.environ.get("ALEX_LOG_LEVEL", "info"),
        app_dir=str(project_root),
    )


if __name__ == "__main__":
    main()
