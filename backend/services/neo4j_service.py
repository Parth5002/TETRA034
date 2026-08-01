"""Neo4j AuraDB service with graceful degradation on connection failure."""

from __future__ import annotations

import logging
from typing import Any, List, Optional

from neo4j import GraphDatabase, Driver
from neo4j.exceptions import Neo4jError, ServiceUnavailable

from config import get_settings
from schemas import Link, Node

logger = logging.getLogger(__name__)


class Neo4jService:
    """Manages Neo4j driver lifecycle, schema constraints, and upserts."""

    def __init__(self) -> None:
        self._driver: Optional[Driver] = None
        self._available: bool = False
        self._active_uri: Optional[str] = None
        self._connect()

    def _connect(self) -> None:
        """Attempt to open a Neo4j driver; never raise on failure."""
        settings = get_settings()
        if not settings.neo4j_uri or not settings.neo4j_password:
            logger.warning("Neo4j credentials missing — graph persistence disabled.")
            self._available = False
            return

        uri_candidates = [settings.neo4j_uri]
        # Windows AV/proxy often breaks Aura TLS verification; +ssc keeps encryption
        # but trusts the intercepted certificate chain (hackathon/dev workaround).
        if settings.neo4j_uri.startswith("neo4j+s://"):
            uri_candidates.append(
                settings.neo4j_uri.replace("neo4j+s://", "neo4j+ssc://", 1)
            )
        elif settings.neo4j_uri.startswith("bolt+s://"):
            uri_candidates.append(
                settings.neo4j_uri.replace("bolt+s://", "bolt+ssc://", 1)
            )

        if self._active_uri:
            uri_candidates = [self._active_uri] + [
                u for u in uri_candidates if u != self._active_uri
            ]

        last_error: Optional[Exception] = None
        for uri in uri_candidates:
            try:
                driver = GraphDatabase.driver(
                    uri,
                    auth=(settings.neo4j_username, settings.neo4j_password),
                    max_connection_lifetime=300,
                    connection_acquisition_timeout=30,
                )
                driver.verify_connectivity()
                self._driver = driver
                self._available = True
                self._active_uri = uri
                if "+ssc" in uri:
                    logger.warning(
                        "Neo4j connected via SSL-relaxed URI (%s).",
                        uri.split("://", 1)[0],
                    )
                else:
                    logger.info("Neo4j AuraDB connection established.")
                return
            except Exception as exc:  # noqa: BLE001 — zero-crash policy
                last_error = exc
                try:
                    if "driver" in locals() and driver is not None:
                        driver.close()
                except Exception:  # noqa: BLE001
                    pass

        logger.warning(
            "Neo4j unreachable (%s). Continuing without graph DB.",
            last_error,
        )
        self._driver = None
        self._available = False

    def _reconnect(self) -> bool:
        """Close a defunct driver and open a fresh connection."""
        logger.info("Attempting Neo4j reconnect after defunct connection…")
        self.close()
        self._connect()
        return self.is_available

    @property
    def is_available(self) -> bool:
        """Whether the Neo4j driver is connected and usable."""
        return self._available and self._driver is not None

    def close(self) -> None:
        """Close the driver if open."""
        if self._driver is not None:
            try:
                self._driver.close()
            except Exception as exc:  # noqa: BLE001
                logger.warning("Error closing Neo4j driver: %s", exc)
            finally:
                self._driver = None
                self._available = False

    def init_schema(self) -> bool:
        """Create uniqueness constraints on :Course(id) and :Skill(id)."""
        if not self.is_available or self._driver is None:
            logger.warning("Skipping Neo4j schema init — driver unavailable.")
            return False

        statements = [
            (
                "CREATE CONSTRAINT course_id_unique IF NOT EXISTS "
                "FOR (c:Course) REQUIRE c.id IS UNIQUE"
            ),
            (
                "CREATE CONSTRAINT skill_id_unique IF NOT EXISTS "
                "FOR (s:Skill) REQUIRE s.id IS UNIQUE"
            ),
        ]
        try:
            with self._driver.session() as session:
                for cypher in statements:
                    session.run(cypher)
            logger.info("Neo4j schema constraints ensured.")
            return True
        except (Neo4jError, ServiceUnavailable, Exception) as exc:  # noqa: BLE001
            logger.warning("Neo4j schema init failed: %s", exc)
            return False

    def upsert_syllabus_and_skills(
        self,
        nodes: List[Node],
        links: List[Link],
    ) -> bool:
        """Upsert academic modules, skills, and relationships into Neo4j."""
        if not self.is_available or self._driver is None:
            if not self._reconnect():
                logger.warning("Skipping Neo4j upsert — driver unavailable.")
                return False

        try:
            return self._run_upsert(nodes, links)
        except (Neo4jError, ServiceUnavailable, Exception) as exc:  # noqa: BLE001
            logger.warning(
                "Neo4j upsert failed (%s) — retrying after reconnect.",
                exc,
            )
            if not self._reconnect():
                return False
            try:
                return self._run_upsert(nodes, links)
            except (Neo4jError, ServiceUnavailable, Exception) as retry_exc:  # noqa: BLE001
                logger.warning("Neo4j upsert failed after reconnect: %s", retry_exc)
                return False

    def _run_upsert(self, nodes: List[Node], links: List[Link]) -> bool:
        """Execute Cypher upserts on the current driver session."""
        if self._driver is None:
            return False

        with self._driver.session() as session:
            for node in nodes:
                payload = node.model_dump()
                if node.type == "academic_module":
                    session.run(
                        """
                        MERGE (c:Course {id: $id})
                        SET c.name = $name,
                            c.group = $group,
                            c.type = $type,
                            c.val = $val
                        """,
                        payload,
                    )
                else:
                    session.run(
                        """
                        MERGE (s:Skill {id: $id})
                        SET s.name = $name,
                            s.group = $group,
                            s.type = $type,
                            s.val = $val,
                            s.gap_score = $gap_score
                        """,
                        payload,
                    )

            for link in links:
                session.run(
                    """
                    MATCH (a {id: $source})
                    MATCH (b {id: $target})
                    MERGE (a)-[r:RELATES {relationship: $relationship}]->(b)
                    SET r.strength = $strength
                    """,
                    {
                        "source": link.source,
                        "target": link.target,
                        "relationship": link.relationship,
                        "strength": link.strength,
                    },
                )
        logger.info(
            "Upserted %d nodes and %d links into Neo4j.",
            len(nodes),
            len(links),
        )
        return True

    def seed_demo_graph(
        self,
        nodes: List[dict[str, Any]],
        links: List[dict[str, Any]],
    ) -> bool:
        """Seed demo nodes/links if Neo4j is available."""
        try:
            parsed_nodes = [Node.model_validate(n) for n in nodes]
            parsed_links = [Link.model_validate(l) for l in links]
            self.init_schema()
            return self.upsert_syllabus_and_skills(parsed_nodes, parsed_links)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Neo4j demo seed failed: %s", exc)
            return False

    def get_macro_graph(self, limit: int = 200) -> dict[str, Any]:
        """
        Fetch the global institutional Course→Skill graph from Neo4j.

        Returns {"nodes": [...], "links": [...]} with deduplicated node IDs.
        Returns empty arrays if Neo4j is unavailable or the query fails.
        """
        empty: dict[str, Any] = {"nodes": [], "links": []}
        if not self.is_available or self._driver is None:
            if not self._reconnect():
                logger.warning("Macro graph unavailable — Neo4j offline.")
                return empty

        try:
            with self._driver.session() as session:
                result = session.run(
                    """
                    MATCH (c:Course)-[r:RELATES]->(s:Skill)
                    RETURN c, r, s
                    LIMIT $limit
                    """,
                    {"limit": limit},
                )
                nodes_by_id: dict[str, dict[str, Any]] = {}
                links: List[dict[str, Any]] = []

                for record in result:
                    course = record["c"]
                    skill = record["s"]
                    rel = record["r"]

                    course_id = course.get("id")
                    skill_id = skill.get("id")
                    if not course_id or not skill_id:
                        continue

                    if course_id not in nodes_by_id:
                        nodes_by_id[course_id] = {
                            "id": course_id,
                            "name": course.get("name") or course_id,
                            "group": int(course.get("group") or 1),
                            "type": "academic_module",
                            "val": int(course.get("val") or 18),
                            "gap_score": None,
                        }

                    if skill_id not in nodes_by_id:
                        gap = skill.get("gap_score")
                        nodes_by_id[skill_id] = {
                            "id": skill_id,
                            "name": skill.get("name") or skill_id,
                            "group": int(skill.get("group") or 2),
                            "type": "industry_skill",
                            "val": int(skill.get("val") or 14),
                            "gap_score": float(gap) if gap is not None else None,
                        }

                    relationship = rel.get("relationship") or "MISSING_SKILL"
                    if relationship not in ("COVERS", "MISSING_SKILL"):
                        relationship = "MISSING_SKILL"
                    strength = rel.get("strength")
                    links.append(
                        {
                            "source": course_id,
                            "target": skill_id,
                            "relationship": relationship,
                            "strength": float(strength) if strength is not None else 0.5,
                        }
                    )

            logger.info(
                "Macro graph fetched: %d nodes, %d links.",
                len(nodes_by_id),
                len(links),
            )
            return {"nodes": list(nodes_by_id.values()), "links": links}
        except (Neo4jError, ServiceUnavailable, Exception) as exc:  # noqa: BLE001
            logger.warning("Macro graph query failed: %s", exc)
            return empty


_neo4j_service: Optional[Neo4jService] = None


def get_neo4j_service() -> Neo4jService:
    """Return a process-wide Neo4jService singleton."""
    global _neo4j_service
    if _neo4j_service is None:
        _neo4j_service = Neo4jService()
    return _neo4j_service
