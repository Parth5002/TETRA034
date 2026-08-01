"""ChromaDB persistent vector store for 2026 industry skill embeddings."""

from __future__ import annotations

import logging
from typing import Any, List, Optional

import chromadb

from config import get_settings

logger = logging.getLogger(__name__)

# Canonical 2026 industry skills used for seeding and fallbacks.
INDUSTRY_SKILLS_2026: List[dict[str, str]] = [
    {
        "id": "skill_agentic",
        "name": "Agentic Workflows",
        "description": (
            "Designing multi-agent systems that plan, tool-call, and collaborate "
            "autonomously across enterprise workflows."
        ),
    },
    {
        "id": "skill_vector_db",
        "name": "Vector Databases",
        "description": (
            "Building and operating embedding stores such as ChromaDB, Pinecone, "
            "and Weaviate for semantic retrieval."
        ),
    },
    {
        "id": "skill_langchain",
        "name": "LangChain / LlamaIndex",
        "description": (
            "Orchestrating LLM apps with chains, agents, indexers, and retrieval "
            "pipelines using LangChain and LlamaIndex."
        ),
    },
    {
        "id": "skill_neo4j",
        "name": "Neo4j Cypher",
        "description": (
            "Modeling knowledge graphs and writing Cypher queries for pattern "
            "matching, traversals, and recommendations."
        ),
    },
    {
        "id": "skill_docker_k8s",
        "name": "Docker / Kubernetes",
        "description": (
            "Containerizing AI services and deploying them on Kubernetes with "
            "scaling, probes, and GitOps practices."
        ),
    },
    {
        "id": "skill_finetune",
        "name": "Fine-Tuning LLMs",
        "description": (
            "Parameter-efficient fine-tuning (LoRA/QLoRA), dataset curation, and "
            "evaluation of domain-adapted language models."
        ),
    },
    {
        "id": "skill_quantum",
        "name": "Quantum Computing Basics",
        "description": (
            "Foundations of qubits, superposition, entanglement, and introductory "
            "quantum algorithms relevant to CS curricula."
        ),
    },
    {
        "id": "skill_rag",
        "name": "RAG Pipeline Architectures",
        "description": (
            "End-to-end retrieval-augmented generation: chunking, hybrid search, "
            "reranking, grounding, and citation."
        ),
    },
    {
        "id": "skill_mlops",
        "name": "MLOps & Model Observability",
        "description": (
            "CI/CD for models, drift detection, tracing, prompt/version registries, "
            "and production monitoring for AI systems."
        ),
    },
    {
        "id": "skill_prompt",
        "name": "Prompt Engineering & Evaluation",
        "description": (
            "Systematic prompt design, few-shot strategies, and automated eval "
            "harnesses for LLM quality and safety."
        ),
    },
    {
        "id": "skill_onnx_npu",
        "name": "ONNX & Edge NPU Inference",
        "description": (
            "Exporting models to ONNX and running local inference on NPUs such as "
            "AMD Ryzen AI for privacy-preserving AI."
        ),
    },
    {
        "id": "skill_fastapi",
        "name": "FastAPI Production APIs",
        "description": (
            "Building typed, async Python APIs with FastAPI, Pydantic v2, and "
            "zero-downtime deployment patterns."
        ),
    },
    {
        "id": "skill_react_viz",
        "name": "Interactive Data Visualization",
        "description": (
            "Force-directed graphs, dashboards, and real-time visual analytics "
            "with React and WebGL libraries."
        ),
    },
    {
        "id": "skill_security_llm",
        "name": "LLM Security & Red Teaming",
        "description": (
            "Prompt injection defense, jailbreak testing, output filtering, and "
            "secure handling of model secrets."
        ),
    },
    {
        "id": "skill_ipfs",
        "name": "IPFS & Decentralized Storage",
        "description": (
            "Content-addressed storage, pinning strategies, and integrating IPFS "
            "with web3 application backends."
        ),
    },
    {
        "id": "skill_solidity",
        "name": "Smart Contract Engineering",
        "description": (
            "Writing gas-efficient Solidity contracts, auditing patterns, and "
            "connecting dApps to university use-cases."
        ),
    },
    {
        "id": "skill_streaming",
        "name": "Real-Time Stream Processing",
        "description": (
            "Kafka/Flink-style pipelines for event-driven analytics and online "
            "feature computation."
        ),
    },
    {
        "id": "skill_feature_store",
        "name": "Feature Stores",
        "description": (
            "Designing offline/online feature stores for consistent ML training "
            "and low-latency serving."
        ),
    },
    {
        "id": "skill_eval_llm",
        "name": "LLM Evaluation Frameworks",
        "description": (
            "Using RAGAS, DeepEval, and custom rubrics to score retrieval quality, "
            "faithfulness, and toxicity."
        ),
    },
    {
        "id": "skill_multimodal",
        "name": "Multimodal AI Systems",
        "description": (
            "Combining text, vision, and audio models for document understanding "
            "and campus assistant experiences."
        ),
    },
    {
        "id": "skill_graphql",
        "name": "GraphQL API Design",
        "description": (
            "Schema-first GraphQL APIs, federation, and efficient data loading "
            "for modern frontends."
        ),
    },
    {
        "id": "skill_typescript",
        "name": "TypeScript Full-Stack Patterns",
        "description": (
            "Strict TypeScript across React/Vite frontends and shared DTO "
            "contracts with backend services."
        ),
    },
    {
        "id": "skill_supabase",
        "name": "Supabase Auth & Postgres RLS",
        "description": (
            "Auth, realtime, and row-level security patterns using Supabase for "
            "campus applications."
        ),
    },
    {
        "id": "skill_observability",
        "name": "Distributed Tracing & OTel",
        "description": (
            "OpenTelemetry instrumentation, span correlation, and SLO-driven "
            "operations for microservices."
        ),
    },
    {
        "id": "skill_data_eng",
        "name": "Modern Data Engineering",
        "description": (
            "dbt, lakehouse architectures, and ELT pipelines for academic and "
            "industry analytics workloads."
        ),
    },
    {
        "id": "skill_rust_sys",
        "name": "Systems Programming with Rust",
        "description": (
            "Memory-safe systems code, WASM targets, and performance-critical "
            "components for AI tooling."
        ),
    },
    {
        "id": "skill_cicd",
        "name": "GitHub Actions CI/CD",
        "description": (
            "Automated test, lint, and deploy pipelines with branch protections "
            "and artifact caching."
        ),
    },
    {
        "id": "skill_a2a",
        "name": "Agent-to-Agent Protocols",
        "description": (
            "Interoperable agent messaging, tool registries, and multi-vendor "
            "agent orchestration standards emerging in 2026."
        ),
    },
    {
        "id": "skill_synthetic",
        "name": "Synthetic Data Generation",
        "description": (
            "Generating privacy-safe synthetic datasets for training, testing, "
            "and curriculum labs."
        ),
    },
    {
        "id": "skill_edge_ai",
        "name": "Edge AI Deployment",
        "description": (
            "Quantization, pruning, and on-device inference for campus IoT and "
            "offline learning assistants."
        ),
    },
]


class ChromaService:
    """Persistent ChromaDB client for industry skill semantic search."""

    def __init__(self) -> None:
        self._client: Any = None
        self._collection: Any = None
        self._available: bool = False
        self._initialize()

    def _initialize(self) -> None:
        """Create persistent client and collection; never raise."""
        settings = get_settings()
        try:
            self._client = chromadb.PersistentClient(path=settings.chroma_path)
            self._collection = self._client.get_or_create_collection(
                name=settings.chroma_collection,
                metadata={"hnsw:space": "cosine", "purpose": "industry_skills_2026"},
            )
            self._available = True
            logger.info(
                "ChromaDB ready at %s (collection=%s, count=%s).",
                settings.chroma_path,
                settings.chroma_collection,
                self._collection.count(),
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("ChromaDB init failed: %s", exc)
            self._client = None
            self._collection = None
            self._available = False

    @property
    def is_available(self) -> bool:
        """Whether ChromaDB is initialized and queryable."""
        return self._available and self._collection is not None

    def seed_industry_skills(self, skills: Optional[List[dict[str, str]]] = None) -> int:
        """Upsert industry skills into the collection. Returns documents written."""
        if not self.is_available or self._collection is None:
            logger.warning("Skipping Chroma seed — collection unavailable.")
            return 0

        skill_list = skills or INDUSTRY_SKILLS_2026
        try:
            ids = [s["id"] for s in skill_list]
            documents = [
                f"{s['name']}: {s['description']}" for s in skill_list
            ]
            metadatas = [{"name": s["name"], "skill_id": s["id"]} for s in skill_list]
            self._collection.upsert(ids=ids, documents=documents, metadatas=metadatas)
            logger.info("Seeded %d industry skills into ChromaDB.", len(skill_list))
            return len(skill_list)
        except Exception as exc:  # noqa: BLE001
            logger.warning("ChromaDB seed failed: %s", exc)
            return 0

    def query_missing_skills(
        self,
        course_topics: List[str],
        n_results: int = 8,
    ) -> List[dict[str, Any]]:
        """
        Query ChromaDB for skills semantically related to course topics.

        Returns a list of dicts with id, name, document, and distance.
        On failure, returns a static subset of INDUSTRY_SKILLS_2026.
        """
        if not course_topics:
            course_topics = ["computer science curriculum industry skills 2026"]

        if not self.is_available or self._collection is None:
            logger.warning("ChromaDB unavailable — returning static skill matches.")
            return self._static_matches(n_results)

        try:
            query_text = " | ".join(course_topics)
            result = self._collection.query(
                query_texts=[query_text],
                n_results=min(n_results, max(self._collection.count(), 1)),
            )
            matches: List[dict[str, Any]] = []
            ids = (result.get("ids") or [[]])[0]
            docs = (result.get("documents") or [[]])[0]
            metas = (result.get("metadatas") or [[]])[0]
            dists = (result.get("distances") or [[]])[0]

            for idx, skill_id in enumerate(ids):
                meta = metas[idx] if idx < len(metas) else {}
                matches.append(
                    {
                        "id": skill_id,
                        "name": (meta or {}).get("name", skill_id),
                        "document": docs[idx] if idx < len(docs) else "",
                        "distance": dists[idx] if idx < len(dists) else 1.0,
                    }
                )
            return matches
        except Exception as exc:  # noqa: BLE001
            logger.warning("ChromaDB query failed: %s", exc)
            return self._static_matches(n_results)

    @staticmethod
    def _static_matches(n_results: int) -> List[dict[str, Any]]:
        """Fallback matches when ChromaDB cannot be queried."""
        return [
            {
                "id": s["id"],
                "name": s["name"],
                "document": f"{s['name']}: {s['description']}",
                "distance": 0.35 + (i * 0.02),
            }
            for i, s in enumerate(INDUSTRY_SKILLS_2026[:n_results])
        ]


_chroma_service: Optional[ChromaService] = None


def get_chroma_service() -> ChromaService:
    """Return a process-wide ChromaService singleton."""
    global _chroma_service
    if _chroma_service is None:
        _chroma_service = ChromaService()
    return _chroma_service
