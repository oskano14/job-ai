from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router as api_router


PROJECT_ROOT = Path(__file__).resolve().parents[1]
UPLOADS_DIR = PROJECT_ROOT / "uploads"
ENV_PATH = Path(__file__).resolve().parent / ".env"

try:
    from dotenv import load_dotenv  # type: ignore

    if ENV_PATH.exists():
        load_dotenv(ENV_PATH)
except Exception:
    pass


def create_app() -> FastAPI:
    app = FastAPI(title="ALEX (Coach IA) API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup() -> None:
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    app.include_router(api_router)
    return app


app = create_app()
