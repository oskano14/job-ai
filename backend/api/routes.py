from __future__ import annotations

import os
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from ..services.coach_ai import chat_with_alex, generate_audit_markdown, suggest_jobs_keyword_from_cv
from ..services.parser import extract_text
from ..services.scraper import get_google_jobs


router = APIRouter()
PROJECT_ROOT = Path(__file__).resolve().parents[2]
UPLOADS_DIR = PROJECT_ROOT / "uploads"


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)) -> dict[str, object]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nom de fichier manquant.")

    suffix = Path(file.filename).suffix.lower()
    if suffix != ".pdf":
        raise HTTPException(status_code=415, detail="Format accepté: PDF.")

    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    saved_path = UPLOADS_DIR / f"{uuid4().hex}{suffix}"

    try:
        content = await file.read()
        saved_path.write_bytes(content)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Impossible de sauvegarder le fichier: {exc}") from exc

    try:
        text = extract_text(saved_path)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Erreur extraction: {exc}") from exc

    max_cv_chars = int(os.environ.get("ALEX_CHAT_CV_MAX_CHARS", "24000"))
    cv_context = " ".join(text.split())[:max_cv_chars]

    try:
        audit_markdown = await generate_audit_markdown(text)
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Erreur IA: {exc}") from exc

    jobs_keyword = ""
    try:
        jobs_keyword = await suggest_jobs_keyword_from_cv(cv_context)
    except Exception:
        jobs_keyword = ""

    return {
        "filename": file.filename,
        "saved_as": saved_path.name,
        "extracted_text_chars": len(text),
        "cv_context": cv_context,
        "cv_context_chars": len(cv_context),
        "audit_markdown": audit_markdown,
        "jobs_keyword": jobs_keyword,
    }


class ChatHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=10_000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10_000)
    history: list[ChatHistoryItem] = Field(default_factory=list)
    cv_context: str = Field(min_length=1, max_length=200_000)
    audit_context: str | None = Field(default=None, max_length=200_000)


@router.post("/chat")
async def chat(payload: ChatRequest) -> dict[str, str]:
    try:
        reply_markdown = await chat_with_alex(
            payload.message,
            [m.model_dump() for m in payload.history],
            payload.cv_context,
            payload.audit_context,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Erreur IA: {exc}") from exc

    return {"reply_markdown": reply_markdown}


class StartScrapingRequest(BaseModel):
    keyword: str = Field(min_length=1, max_length=200)


@router.post("/start-scraping")
async def start_scraping(payload: StartScrapingRequest) -> dict[str, object]:
    keyword = payload.keyword.strip()
    try:
        jobs = await get_google_jobs(keyword)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Erreur SerpApi: {exc}") from exc

    return {"keyword": keyword, "jobs": jobs}
