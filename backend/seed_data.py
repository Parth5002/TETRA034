"""
Seed ChromaDB with 2026 industry skills and optionally populate Neo4j.

Runnable as:
    python seed_data.py
Also invoked automatically on FastAPI startup.
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

# Ensure backend root is on sys.path when executed as a script.
BACKEND_ROOT = Path(__file__).resolve().parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from services.chroma_service import INDUSTRY_SKILLS_2026, get_chroma_service
from services.fallback_data import FALLBACK_ANALYSIS
from services.neo4j_service import get_neo4j_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("seed_data")


def seed_chromadb() -> int:
    """Populate ChromaDB with the canonical 2026 industry skill set."""
    chroma = get_chroma_service()
    count = chroma.seed_industry_skills(INDUSTRY_SKILLS_2026)
    logger.info("ChromaDB seed complete — %d skills written.", count)
    return count


def seed_neo4j() -> bool:
    """Populate Neo4j with demo nodes/links from fallback analysis when available."""
    neo4j = get_neo4j_service()
    if not neo4j.is_available:
        logger.warning("Neo4j unavailable — skipping graph seed.")
        return False

    ok = neo4j.seed_demo_graph(
        nodes=FALLBACK_ANALYSIS["nodes"],
        links=FALLBACK_ANALYSIS["links"],
    )
    if ok:
        logger.info("Neo4j demo graph seeded successfully.")
    else:
        logger.warning("Neo4j demo graph seed did not complete.")
    return ok


def run_seed() -> dict:
    """
    Run full seed pipeline. Never raises — returns a status dict.

    Returns:
        dict with chromadb_count and neo4j_seeded flags.
    """
    result = {"chromadb_count": 0, "neo4j_seeded": False}
    try:
        result["chromadb_count"] = seed_chromadb()
    except Exception as exc:  # noqa: BLE001
        logger.warning("ChromaDB seed error (non-fatal): %s", exc)

    try:
        result["neo4j_seeded"] = seed_neo4j()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Neo4j seed error (non-fatal): %s", exc)

    return result


if __name__ == "__main__":
    status = run_seed()
    print(f"Seed finished: {status}")
