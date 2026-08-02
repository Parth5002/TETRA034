# 02_System_Design: Axiomm (TETRA034)

**Product:** Axiomm — Curriculum Intelligence Engine  
**Hackathon:** TetraTHON 2026 · EdTech track · Indo-French AI Hackathon  
**Repo:** https://github.com/Parth5002/TETRA034

## 1. High-Level Architecture
Decoupled full-stack system: FastAPI handles AI/DB work; React renders an enterprise analytics dashboard with a WebGL skill-gap graph.

| Layer | Stack | Role |
| :--- | :--- | :--- |
| **Frontend UI** | React 19 · TanStack Start/Router · Vite (:5173) · Tailwind v4 · shadcn · custom force-graph canvas | Enterprise Axiomm dashboard wired to FastAPI |
| **API & Routing** | FastAPI · Uvicorn · Pydantic v2 · CORS `*` | Strict `AnalysisResponse` contract; zero unhandled 500s |
| **Ingest** | Multipart text + PDF (`pypdf`) | Paste modules and/or upload syllabus files (≤5MB) |
| **Vector store** | ChromaDB local (`./chroma_db`, `industry_skills_2026`) | 30 seeded 2026 industry skill embeddings |
| **Intelligence** | Google Gemini 3.5 Flash (`google-genai`) | Structured JSON gap analysis; multi-model candidate fallback |
| **Knowledge graph** | Neo4j AuraDB | Course ↔ Skill ontology (`COVERS` / `MISSING_SKILL`); `neo4j+ssc` SSL-relaxed for local demos |

## 2. Component Interaction
1. **Ingest:** Dean pastes syllabus text or drops a PDF in the sidebar. Demo Mode hits `GET /api/mock-analyze`. Macro view hits `GET /api/macro-graph`.
2. **Retrieve:** FastAPI queries ChromaDB for industry skills semantically close to syllabus topics.
3. **Analyze:** Gemini returns structured nodes, links, summary, actionable update, `estimated_hours`, and `difficulty`.
4. **Map:** Neo4j upserts Course/Skill nodes and relationships (best-effort; never blocks the HTTP response).
5. **Visualize:** Force-graph paints Blue academic / Red gap (≥ 0.5) / Green covered; particles travel along links; `AIResultCard` shows alignment score + execution plan.

## 3. Frontend Surface (Enterprise Dashboard)
| Component | Responsibility |
| :--- | :--- |
| `Header` | Animated Axiomm brand mark (orbiting skill-graph logo), Live pill, Demo Mode |
| `SidebarInput` | PDF dropzone, syllabus textarea, Analyze + Load Institutional Graph CTAs |
| `AIResultCard` | Alignment %, Courses / Skills / Alerts widgets, summary, Execution Plan, report download (`Axiomm_Report.md`) |
| `GraphVisualizer` | Anti-hairball physics (charge + collide), All / Gaps-only filters, recenter, hover dimming, directional particles, glass legend |
| `App` | Fixed 400px scrollable glass sidebar, cyan-teal ambient canvas, dismissible error toast, synthesizing overlay |

**Visual semantics**
- 🔵 Academic modules — `#3b82f6`
- 🔴 Severe gaps — `#ef4444` (`gap_score ≥ 0.5`) with glow
- 🟢 Covered skills — `#10b981` (`gap_score < 0.5`)

## 4. Data Flow & Zero-Crash Integrity
Every Gemini, ChromaDB, and Neo4j call is wrapped in `try/except`. Rate limits, network drops, or SSL interception degrade to `services/fallback_data.py` with `is_mock=true` — **never** an unhandled HTTP 500 during live evaluation.

## 5. API Surface
| Method | Path | Purpose |
| :--- | :--- | :--- |
| `GET` | `/health` | Liveness probe |
| `GET` | `/api/mock-analyze` | Instant Demo Mode payload |
| `GET` | `/api/macro-graph` | Full institutional Neo4j graph |
| `POST` | `/api/analyze` | Multipart text and/or PDF → full pipeline |
| `POST` | `/api/analyze/json` | JSON-body analysis variant |

## 6. Repository Layout
```
TETRA034/
├── backend/          # FastAPI, services (gemini, chroma, neo4j, fallback), seed_data
├── frontend/         # Vite React app (Axiomm dashboard)
├── .engineering-os/  # System design + execution plan
├── SKILL.md          # Agent guidelines (axiomm-os)
└── README.md         # Submission report
```
Secrets live only in `backend/.env` (never committed). Public template: `backend/.env.example`.
