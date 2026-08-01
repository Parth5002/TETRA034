"""Google Gemini 2.5 Flash service with structured JSON output."""

from __future__ import annotations

import json
import logging
from typing import Any, List, Optional

from config import get_settings
from schemas import AnalysisResponse
from services.fallback_data import get_fallback_response

logger = logging.getLogger(__name__)

# Google GenAI rejects JSON-Schema union types like ["number","null"].
# Use nullable NUMBER instead so structured output validates cleanly.
ANALYSIS_JSON_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "nodes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "group": {"type": "integer"},
                    "type": {
                        "type": "string",
                        "enum": ["academic_module", "industry_skill"],
                    },
                    "val": {"type": "integer"},
                    "gap_score": {"type": "number", "nullable": True},
                },
                "required": ["id", "name", "group", "type", "val"],
            },
        },
        "links": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "source": {"type": "string"},
                    "target": {"type": "string"},
                    "relationship": {
                        "type": "string",
                        "enum": ["COVERS", "MISSING_SKILL"],
                    },
                    "strength": {"type": "number"},
                },
                "required": ["source", "target", "relationship", "strength"],
            },
        },
        "ai_recommendation": {
            "type": "object",
            "properties": {
                "summary": {"type": "string"},
                "actionable_update": {"type": "string"},
            },
            "required": ["summary", "actionable_update"],
        },
        "is_mock": {"type": "boolean"},
    },
    "required": ["nodes", "links", "ai_recommendation"],
}


# Candidate models for new free-tier keys (2.5 Flash is closed to many new accounts).
GEMINI_MODEL_CANDIDATES: tuple[str, ...] = (
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
    "gemini-2.5-flash",
)


class GeminiService:
    """Wraps Gemini Flash for syllabus-vs-industry gap analysis."""

    def __init__(self) -> None:
        self._client: Any = None
        self._available: bool = False
        self._initialize()

    def _initialize(self) -> None:
        """Create the google-genai client if an API key is configured."""
        settings = get_settings()
        key = (settings.gemini_api_key or "").strip()
        if not key or key.startswith("your_gemini"):
            logger.warning("GEMINI_API_KEY missing/placeholder — Gemini disabled.")
            self._available = False
            return

        try:
            from google import genai

            self._client = genai.Client(api_key=key)
            self._available = True
            logger.info("Gemini client initialized (preferred model=%s).", settings.gemini_model)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Gemini client init failed: %s", exc)
            self._client = None
            self._available = False

    @property
    def is_available(self) -> bool:
        """Whether the Gemini client is ready."""
        return self._available and self._client is not None

    def _model_candidates(self) -> List[str]:
        """Ordered model IDs to try (configured model first, then fallbacks)."""
        preferred = get_settings().gemini_model
        ordered: List[str] = []
        for name in (preferred, *GEMINI_MODEL_CANDIDATES):
            if name and name not in ordered:
                ordered.append(name)
        return ordered

    def analyze_syllabus_gap(
        self,
        syllabus_text: str,
        vector_matches: List[dict[str, Any]],
    ) -> AnalysisResponse:
        """
        Compare syllabus text against vector market skills via Gemini Flash.

        Always returns a valid AnalysisResponse. On any failure, returns
        fallback data with is_mock=True.
        """
        if not syllabus_text or not syllabus_text.strip():
            logger.warning("Empty syllabus — returning fallback analysis.")
            return get_fallback_response()

        if not self.is_available or self._client is None:
            logger.warning("Gemini unavailable — returning fallback analysis.")
            return get_fallback_response()

        skill_block = json.dumps(vector_matches, indent=2)
        prompt = (
            "You are NexusEd AI, a curriculum alignment expert for 2026 university "
            "programs. Compare the syllabus below against the industry skill "
            "matches retrieved from a vector database.\n\n"
            "Produce a structured analysis with:\n"
            "- Academic module nodes (group=1, type='academic_module', gap_score=null)\n"
            "- Industry skill nodes (group=2, type='industry_skill', gap_score 0.0-1.0 "
            "where higher means a more severe curriculum gap)\n"
            "- Links with relationship 'COVERS' (skill adequately taught) or "
            "'MISSING_SKILL' (gap), and strength 0.0-1.0\n"
            "- An ai_recommendation with a concise summary and concrete actionable "
            "curriculum updates\n"
            "- Set is_mock to false\n\n"
            "Use only node ids that appear in nodes for link source/target.\n"
            "Prefer realistic 2026 tech trends (RAG, agentic workflows, vector DBs, "
            "Neo4j Cypher, MLOps, fine-tuning, etc.).\n\n"
            f"=== SYLLABUS ===\n{syllabus_text[:12000]}\n\n"
            f"=== VECTOR MARKET SKILL MATCHES ===\n{skill_block}\n"
        )

        last_error: Optional[Exception] = None
        try:
            from google.genai import types

            for model_name in self._model_candidates():
                try:
                    response = self._client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            response_schema=ANALYSIS_JSON_SCHEMA,
                            temperature=0.3,
                        ),
                    )
                    raw_text = getattr(response, "text", None) or ""
                    if not raw_text.strip():
                        logger.warning(
                            "Gemini model %s returned empty content — trying next.",
                            model_name,
                        )
                        continue

                    payload = json.loads(raw_text)
                    payload["is_mock"] = False
                    result = AnalysisResponse.model_validate(payload)
                    logger.info("Gemini analysis succeeded with model=%s.", model_name)
                    return result
                except Exception as model_exc:  # noqa: BLE001
                    last_error = model_exc
                    logger.warning(
                        "Gemini model %s failed (%s) — trying next candidate.",
                        model_name,
                        model_exc,
                    )
                    continue
        except Exception as exc:  # noqa: BLE001
            last_error = exc

        logger.warning(
            "All Gemini models failed (%s) — using fallback.",
            last_error,
        )
        return get_fallback_response()


_gemini_service: Optional[GeminiService] = None


def get_gemini_service() -> GeminiService:
    """Return a process-wide GeminiService singleton."""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
