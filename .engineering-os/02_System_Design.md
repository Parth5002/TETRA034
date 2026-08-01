# 02_System_Design: NexusEd AI (CurricuAlign AI)

## 1. High-Level Architecture
The system follows a decoupled architecture, separating the heavy AI processing from the lightweight interactive frontend:
- **Frontend UI Layer:** React (Vite) + Tailwind CSS + shadcn/ui aesthetics, utilizing `react-force-graph-2d` for interactive WebGL rendering of skill gaps.
- **API & Routing Layer:** Python-based FastAPI with strict Pydantic v2 schemas for data validation and contract enforcement.
- **Semantic Analysis Layer:** Local ChromaDB acting as the vector search engine to identify semantic gaps between syllabus embeddings and live job market requirements.
- **Intelligence Layer:** Google Gemini 2.5 Flash LLM, functioning as the Syllabus Augmenter to generate structured, actionable JSON updates.
- **Knowledge Graph Layer:** Neo4j AuraDB (Cloud) mapping the core ontology between academic modules and industry skills.

## 2. Component Interaction
1. **Ingest:** Deans/Professors upload the existing syllabus text via the React frontend.
2. **Retrieve:** FastAPI queries the local ChromaDB vector store to fetch missing 2026 industry skills.
3. **Analyze:** Gemini 2.5 Flash processes the syllabus against the missing skills and outputs a structured `AnalysisResponse` JSON.
4. **Map:** Neo4j AuraDB executes Cypher queries to link academic nodes to missing industry skill nodes.
5. **Visualize:** The frontend receives the JSON contract and renders the interactive force-graph alongside actionable AI recommendations.

## 3. Data Flow & Zero-Crash Integrity
To ensure maximum stability during live demonstrations, the API is governed by a strict Zero-Crash Policy. All AI (Gemini) and Database (Neo4j) transactions are wrapped in `try/except` blocks. If rate limits are hit or network latency occurs, the system instantly defaults to `fallback_data.py`, returning a rich, perfectly formatted static JSON payload to ensure the frontend UI never encounters an unhandled HTTP 500 error.