"""Static fallback analysis payload for zero-crash demo stability."""

from schemas import AnalysisResponse

FALLBACK_ANALYSIS: dict = {
    "nodes": [
        {
            "id": "course_dsa",
            "name": "Data Structures & Algorithms",
            "group": 1,
            "type": "academic_module",
            "val": 22,
            "gap_score": None,
        },
        {
            "id": "course_dbms",
            "name": "Database Management Systems",
            "group": 1,
            "type": "academic_module",
            "val": 20,
            "gap_score": None,
        },
        {
            "id": "course_ai",
            "name": "Artificial Intelligence Fundamentals",
            "group": 1,
            "type": "academic_module",
            "val": 20,
            "gap_score": None,
        },
        {
            "id": "course_se",
            "name": "Software Engineering",
            "group": 1,
            "type": "academic_module",
            "val": 18,
            "gap_score": None,
        },
        {
            "id": "skill_vector_db",
            "name": "Vector Databases (ChromaDB)",
            "group": 2,
            "type": "industry_skill",
            "val": 16,
            "gap_score": 0.82,
        },
        {
            "id": "skill_cypher",
            "name": "Graph Traversal vs Cypher",
            "group": 2,
            "type": "industry_skill",
            "val": 15,
            "gap_score": 0.76,
        },
        {
            "id": "skill_rag",
            "name": "RAG Pipeline Architectures",
            "group": 2,
            "type": "industry_skill",
            "val": 17,
            "gap_score": 0.88,
        },
        {
            "id": "skill_agentic",
            "name": "Agentic Workflows",
            "group": 2,
            "type": "industry_skill",
            "val": 16,
            "gap_score": 0.91,
        },
        {
            "id": "skill_langchain",
            "name": "LangChain / LlamaIndex",
            "group": 2,
            "type": "industry_skill",
            "val": 15,
            "gap_score": 0.74,
        },
        {
            "id": "skill_docker",
            "name": "Docker / Kubernetes",
            "group": 2,
            "type": "industry_skill",
            "val": 14,
            "gap_score": 0.35,
        },
        {
            "id": "skill_finetune",
            "name": "Fine-Tuning LLMs",
            "group": 2,
            "type": "industry_skill",
            "val": 15,
            "gap_score": 0.79,
        },
        {
            "id": "skill_neo4j",
            "name": "Neo4j Cypher Querying",
            "group": 2,
            "type": "industry_skill",
            "val": 14,
            "gap_score": 0.68,
        },
        {
            "id": "skill_quantum",
            "name": "Quantum Computing Basics",
            "group": 2,
            "type": "industry_skill",
            "val": 13,
            "gap_score": 0.55,
        },
        {
            "id": "skill_mlops",
            "name": "MLOps & Model Observability",
            "group": 2,
            "type": "industry_skill",
            "val": 14,
            "gap_score": 0.62,
        },
        {
            "id": "skill_prompt",
            "name": "Prompt Engineering & Evaluation",
            "group": 2,
            "type": "industry_skill",
            "val": 14,
            "gap_score": 0.48,
        },
    ],
    "links": [
        {
            "source": "course_dsa",
            "target": "skill_cypher",
            "relationship": "MISSING_SKILL",
            "strength": 0.76,
        },
        {
            "source": "course_dsa",
            "target": "skill_vector_db",
            "relationship": "MISSING_SKILL",
            "strength": 0.70,
        },
        {
            "source": "course_dbms",
            "target": "skill_vector_db",
            "relationship": "MISSING_SKILL",
            "strength": 0.82,
        },
        {
            "source": "course_dbms",
            "target": "skill_neo4j",
            "relationship": "MISSING_SKILL",
            "strength": 0.68,
        },
        {
            "source": "course_ai",
            "target": "skill_rag",
            "relationship": "MISSING_SKILL",
            "strength": 0.88,
        },
        {
            "source": "course_ai",
            "target": "skill_agentic",
            "relationship": "MISSING_SKILL",
            "strength": 0.91,
        },
        {
            "source": "course_ai",
            "target": "skill_langchain",
            "relationship": "MISSING_SKILL",
            "strength": 0.74,
        },
        {
            "source": "course_ai",
            "target": "skill_finetune",
            "relationship": "MISSING_SKILL",
            "strength": 0.79,
        },
        {
            "source": "course_ai",
            "target": "skill_prompt",
            "relationship": "COVERS",
            "strength": 0.52,
        },
        {
            "source": "course_se",
            "target": "skill_docker",
            "relationship": "COVERS",
            "strength": 0.65,
        },
        {
            "source": "course_se",
            "target": "skill_mlops",
            "relationship": "MISSING_SKILL",
            "strength": 0.62,
        },
        {
            "source": "course_ai",
            "target": "skill_quantum",
            "relationship": "MISSING_SKILL",
            "strength": 0.55,
        },
    ],
    "ai_recommendation": {
        "summary": (
            "The 2026 curriculum covers classical DSA, relational DBMS, and AI "
            "fundamentals well, but lacks industry-critical capabilities around "
            "vector retrieval, graph query languages, RAG systems, and agentic "
            "orchestration that employers now expect from graduating engineers."
        ),
        "actionable_update": (
            "1) Add a 4-week module on Vector Databases (ChromaDB/Pinecone) with "
            "embedding similarity labs inside DBMS. "
            "2) Extend DSA with Neo4j Cypher labs contrasting BFS/DFS vs graph "
            "pattern matching. "
            "3) Redesign the AI elective into a RAG + Agentic Workflows studio "
            "using LangChain/LlamaIndex, evaluation harnesses, and fine-tuning "
            "mini-projects. "
            "4) Bundle Docker/K8s and basic MLOps observability into the Software "
            "Engineering capstone so graduates can ship and monitor LLM services."
        ),
        "estimated_hours": 24,
        "difficulty": "High",
    },
    "is_mock": True,
}


def get_fallback_response() -> AnalysisResponse:
    """Return a validated AnalysisResponse from the static fallback payload."""
    return AnalysisResponse.model_validate(FALLBACK_ANALYSIS)
