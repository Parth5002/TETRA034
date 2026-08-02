---
name: axiomm-os
description: Master skill for building Axiomm. Enforces Python/FastAPI backend, React/Vite frontend, and zero-crash AI integration policies.
---

# Axiomm Engineering OS & AI Guidelines

## 1. Project Context
- **Name:** Axiomm
- **Goal:** Analyze university syllabi against 2026 industry skill gaps using Graph and Vector databases.
- **Architecture:** Strictly decoupled. `frontend` (React) and `backend` (FastAPI).

## 2. Backend Rules (Python/FastAPI)
- **Tech Stack:** Python 3.11+, FastAPI, Pydantic v2.
- **AI & DB:** Google Gemini 2.5 Flash (`google-genai`), Neo4j AuraDB (`neo4j`), ChromaDB (`chromadb` local persistent).
- **The Zero-Crash Policy (CRITICAL):** The server MUST NEVER return an unhandled 500 error. All database calls (Neo4j/Chroma) and AI calls (Gemini) MUST be wrapped in `try/except` blocks. If any external service fails or rate-limits, the endpoint MUST gracefully return static data from `services/fallback_data.py`.
- **API Contracts:** Always adhere to the Pydantic schemas (`AnalysisResponse`, `Node`, `Link`).

## 3. Frontend Rules (React/Vite)
- **Tech Stack:** React 18, Vite (port 5173), `axios`, `react-force-graph-2d`, `lucide-react`.
- **Styling:** Strictly use Tailwind CSS v3 utility classes. DO NOT write custom CSS. Mimic `shadcn/ui` aesthetics (clean, rounded corners, slate/zinc color palettes).
- **Visualization:** Use `react-force-graph-2d` to render the skill gaps. Adhere strictly to the color coding: Blue for Academic Nodes, Red for Severe Gaps (gap_score >= 0.5), Green for Covered Skills (gap_score < 0.5).

## 4. General Execution Rules
- **No Placeholders:** Generate all files completely with zero placeholder comments (e.g., NEVER write `// insert logic here`).
- **Imports:** Ensure all React imports and Python imports are correctly structured and resolved.
