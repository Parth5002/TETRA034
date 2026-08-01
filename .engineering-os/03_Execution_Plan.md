# 03_Execution_Plan: Project Roadmap

| Phase | Objective | Team Lead | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project Init & PWA Architecture | Parth Gohil | Completed |
| **Phase 2** | FastAPI Backend Skeleton & Fallbacks | Parth Gohil | Completed |
| **Phase 3** | Neo4j AuraDB & ChromaDB Integration | Nisarg | In-Progress |
| **Phase 4** | Gemini 2.5 Prompt Engineering (JSON Output) | Nisarg | Pending |
| **Phase 5** | React Force Graph Integration | Tisha / Parth | Pending |
| **Phase 6** | E2E Testing & Zero-Crash Validation | Team | Pending |

## Pending Work Overview
- **Seed Data Generation:** We must run `seed_data.py` to populate ChromaDB with at least 30 real-world 2026 tech skills (e.g., Agentic Workflows, RAG Pipelines) before testing the Semantic Gap Analyzer.
- **Graph Visualization:** Tisha needs to map the backend `nodes` and `links` arrays to the `react-force-graph-2d` component, ensuring Red (Severe Gap) and Green (Covered) color coding is working perfectly.
- **Live AI Testing:** Transitioning from the mock API to the live Gemini 2.5 Flash endpoint to ensure the LLM strictly adheres to the Pydantic schema without hallucinating extra text.