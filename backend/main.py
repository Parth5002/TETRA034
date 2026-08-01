"""
NexusEd AI (CurricuAlign AI) — FastAPI application entrypoint.

Zero-crash policy: every endpoint catches failures and returns fallback
AnalysisResponse data instead of unhandled HTTP 500 errors.
"""

from __future__ import annotations

import io
import logging
import re
from typing import List, Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pypdf import PdfReader

from config import get_settings
from schemas import AnalysisRequest, AnalysisResponse
from seed_data import run_seed
from services.chroma_service import get_chroma_service
from services.fallback_data import get_fallback_response
from services.gemini_service import get_gemini_service
from services.neo4j_service import get_neo4j_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("nexused")

app = FastAPI(
    title="NexusEd AI API",
    description=(
        "CurricuAlign AI — bridges university syllabi and 2026 industry skill gaps "
        "using Gemini 2.5 Flash, ChromaDB, and Neo4j AuraDB."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_seed() -> None:
    """Initialize ChromaDB (and Neo4j if available) on application boot."""
    try:
        status = run_seed()
        logger.info("Startup seed finished: %s", status)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Startup seed failed (non-fatal): %s", exc)


def _extract_topics(syllabus_text: str) -> List[str]:
    """Derive coarse topic phrases from syllabus text for vector search."""
    lines = [ln.strip() for ln in syllabus_text.splitlines() if ln.strip()]
    topics: List[str] = []
    for line in lines:
        cleaned = re.sub(r"^[\d\.\)\-]+\s*", "", line)
        if 3 < len(cleaned) < 120:
            topics.append(cleaned)
        if len(topics) >= 12:
            break
    if not topics:
        topics = [syllabus_text[:500]]
    return topics


async def _read_upload_text(file: Optional[UploadFile]) -> str:
    """Extract text from an uploaded syllabus file (PDF or plain text)."""
    if file is None:
        return ""
    try:
        raw = await file.read()
        filename = (file.filename or "").lower()
        if filename.endswith(".pdf"):
            reader = PdfReader(io.BytesIO(raw))
            pages: List[str] = []
            for page in reader.pages:
                extracted = page.extract_text() or ""
                if extracted.strip():
                    pages.append(extracted)
            text = "\n".join(pages).strip()
            if not text:
                logger.warning("PDF upload produced empty text: %s", file.filename)
            return text
        return raw.decode("utf-8", errors="ignore")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to read upload: %s", exc)
        return ""


def _safe_fallback(reason: str) -> AnalysisResponse:
    """Log reason and return the validated static fallback payload."""
    logger.warning("Returning fallback analysis: %s", reason)
    return get_fallback_response()


@app.get("/health")
async def health() -> dict:
    """Liveness probe for demos and load balancers."""
    return {"status": "ok", "timestamp": "2026-07-31"}


@app.get("/api/mock-analyze", response_model=AnalysisResponse)
async def mock_analyze() -> AnalysisResponse:
    """Instantly return fallback analysis for Demo Mode / UI wiring."""
    try:
        return get_fallback_response()
    except Exception as exc:  # noqa: BLE001
        logger.error("mock-analyze unexpected error: %s", exc)
        return AnalysisResponse(
            nodes=[],
            links=[],
            ai_recommendation={
                "summary": "Demo payload unavailable.",
                "actionable_update": "Retry /api/mock-analyze.",
            },
            is_mock=True,
        )


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze(
    syllabus_text: Optional[str] = Form(default=None),
    file: Optional[UploadFile] = File(default=None),
) -> AnalysisResponse:
    """
    Analyze a syllabus for industry skill gaps.

    Accepts multipart form fields: optional `syllabus_text` and/or uploaded `file`.
    Pipeline: ChromaDB → Gemini 2.5 Flash → Neo4j upsert → AnalysisResponse.
    Never raises an unhandled 500 — falls back to static demo data.
    """
    try:
        settings = get_settings()
        if settings.demo_mode:
            return _safe_fallback("DEMO_MODE enabled")

        file_text = await _read_upload_text(file)
        text = (syllabus_text or "").strip() or file_text.strip()
        if not text:
            return _safe_fallback("No syllabus text or file provided")

        # 1) Semantic retrieval against 2026 industry skills
        chroma = get_chroma_service()
        topics = _extract_topics(text)
        vector_matches = chroma.query_missing_skills(topics)

        # 2) Gemini structured gap analysis
        gemini = get_gemini_service()
        result = gemini.analyze_syllabus_gap(text, vector_matches)

        # 3) Best-effort Neo4j persistence (never blocks response)
        try:
            neo4j = get_neo4j_service()
            neo4j.upsert_syllabus_and_skills(result.nodes, result.links)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Neo4j persistence skipped: %s", exc)

        return result
    except Exception as exc:  # noqa: BLE001 — absolute last resort
        return _safe_fallback(f"analyze endpoint caught: {exc}")


@app.post("/api/analyze/json", response_model=AnalysisResponse)
async def analyze_json(body: AnalysisRequest) -> AnalysisResponse:
    """
    JSON-body variant of /api/analyze for clients that prefer application/json.
    """
    try:
        settings = get_settings()
        if settings.demo_mode:
            return _safe_fallback("DEMO_MODE enabled")

        text = (body.syllabus_text or "").strip()
        if not text:
            return _safe_fallback("syllabus_text is empty")

        chroma = get_chroma_service()
        topics = _extract_topics(text)
        vector_matches = chroma.query_missing_skills(topics)

        gemini = get_gemini_service()
        result = gemini.analyze_syllabus_gap(text, vector_matches)

        try:
            neo4j = get_neo4j_service()
            neo4j.upsert_syllabus_and_skills(result.nodes, result.links)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Neo4j persistence skipped: %s", exc)

        return result
    except Exception as exc:  # noqa: BLE001
        return _safe_fallback(f"analyze/json endpoint caught: {exc}")


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request, exc: Exception) -> JSONResponse:
    """Global safety net — convert any stray exception into fallback JSON."""
    logger.error("Unhandled exception converted to fallback: %s", exc)
    payload = get_fallback_response()
    return JSONResponse(status_code=200, content=payload.model_dump())
