# 02_System_Design: NexusEd AI (CurricuAlign AI)

## 1. High-Level Architecture
The system follows a decoupled architecture, separating the heavy AI processing from the lightweight interactive frontend:

- **Frontend UI Layer:** React 18 (Vite, port 5173) + Tailwind CSS v3 (shadcn/ui aesthetics) + `react-force-graph-2d` for interactive skill-gap visualization, with canvas node labels, zoom-to-fit, and a loading overlay during analysis.
- **API & Routing Layer:** Python FastAPI + Uvicorn with strict Pydantic v2 schemas (`AnalysisResponse`, `Node`, `Link`) and CORS enabled for the React app.
- **Ingest Layer:** Multipart syllabus input — paste text and/or upload PDF (`pypdf` extracts text server-side).
- **Semantic Analysis Layer:** Local persistent ChromaDB (`./chroma_db`, collection `industry_skills_2026`) with 30 seeded 2026 industry skills for semantic gap retrieval.
- **Intelligence Layer:** Google Gemini 3.5 Flash (`google-genai` SDK) with structured JSON schema output; syllabus context window up to ~150k characters. Falls back across model candidates if a model ID is unavailable.
- **Knowledge Graph Layer:** Neo4j AuraDB mapping Course ↔ Skill ontology (`COVERS` / `MISSING_SKILL`), with auto-reconnect and SSL-relaxed (`neo4j+ssc`) support for local demo environments.

## 2. Component Interaction
1. **Ingest:** Dean/professor pastes syllabus text or drops a PDF in the React sidebar (Demo Mode uses `/api/mock-analyze`).
2. **Retrieve:** FastAPI queries ChromaDB for industry skills semantically similar to course topics.
3. **Analyze:** Gemini Flash compares syllabus vs vector matches and returns a structured `AnalysisResponse` JSON.
4. **Map:** Neo4j upserts academic modules, skills, and `RELATES` edges (best-effort; never blocks the HTTP response).
5. **Visualize:** React force-graph renders Blue (academic) / Red (gap ≥ 0.5) / Green (covered &lt; 0.5) nodes with labels; `AIResultCard` shows summary + actionable updates.

## 3. Data Flow & Zero-Crash Integrity
The API is governed by a strict **Zero-Crash Policy**. All Gemini, ChromaDB, and Neo4j calls are wrapped in `try/except`. Rate limits, network failures, or SSL issues degrade to `services/fallback_data.py` (`is_mock=true`) instead of an unhandled HTTP 500 — so live mentor demos never blank the UI.

## 4. API Surface
| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/health` | Liveness probe |
| `GET` | `/api/mock-analyze` | Instant fallback for Demo Mode |
| `POST` | `/api/analyze` | Multipart text and/or PDF → full pipeline |
| `POST` | `/api/analyze/json` | JSON-body variant |

## 5. Repository Layout
- `backend/` — FastAPI app, services (Gemini, Chroma, Neo4j, fallback), seed script
- `frontend/` — React Vite app (Header, SidebarInput, AIResultCard, GraphVisualizer)
- Secrets stay in `backend/.env` (never committed); only `.env.example` is public
