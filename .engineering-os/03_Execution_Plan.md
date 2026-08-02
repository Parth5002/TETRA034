# 03_Execution_Plan: Axiomm (TETRA034)

**Product:** Axiomm — Curriculum Intelligence Engine  
**Status:** Jury-ready MVP + V2 polish shipped on `main`

| Phase | Objective | Team Lead | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project init & repo structure (`backend/` · `frontend/`) | Parth Gohil | **Completed** |
| **Phase 2** | FastAPI skeleton, Pydantic schemas, zero-crash fallbacks | Parth Gohil | **Completed** |
| **Phase 3** | Neo4j AuraDB + ChromaDB seed (30 skills) | Nisarg / Parth | **Completed** |
| **Phase 4** | Gemini structured JSON analysis (3.5 Flash + candidates) | Nisarg / Parth | **Completed** |
| **Phase 5** | React force-graph + sidebar ingest + PDF pipeline | Tisha / Parth | **Completed** |
| **Phase 6** | E2E testing & zero-crash validation | Team | **Completed** |
| **Phase 7** | V2: macro-graph, report export, gap filters, hours/difficulty | Team | **Completed** |
| **Phase 8** | Enterprise UI: Axiomm brand, analytics dashboard, particle/force graph polish | Team | **Completed** |
| **Phase 9** | TanStack Start frontend swap + FastAPI wiring + jury screenshots | Team | **Completed** |

## Completed Deliverables

### Backend
- **ChromaDB seed:** 30 real 2026 industry skills on FastAPI startup (`seed_data.py`).
- **Neo4j AuraDB:** Course/Skill upserts, reconnect on stale sockets, SSL-relaxed (`neo4j+ssc`) for local demos.
- **Gemini live path:** Structured `AnalysisResponse` with `is_mock=false`; ~150k syllabus window; model candidate cascade.
- **Macro graph API:** `GET /api/macro-graph` returns institutional Neo4j topology.
- **Zero-crash:** `fallback_data.py` + global exception handler → no unhandled HTTP 500s.

### Frontend (Axiomm dashboard)
- **Brand:** Animated skill-graph logo, cyan–teal gradient wordmark, Live status pill.
- **Ingest:** Premium PDF dropzone, syllabus textarea (`rows={5}`), shimmer Analyze CTA, Load Institutional Graph.
- **Analytics card:** Curriculum alignment score bar, Courses / Skills / Alerts widgets, Execution Plan, `Axiomm_Report.md` download.
- **Graph:** Larger nodes, collision physics, All / Gaps-only / Recenter, hover focus dimming, directional link particles, glass controls.
- **Layout:** Fixed 400px scrollable sidebar (`pb-12`), ambient cyan dot-grid canvas, dismissible error toast, synthesizing overlay.
- **Demo Mode:** Instant mock path for offline / rate-limit demos.

### Docs
- README badges + architecture synced to Axiomm.
- `.engineering-os` design + plan updated to shipped system.
- `SKILL.md` renamed to `axiomm-os` guidelines.

## Verification Checklist (Mentor / Jury Demo)
| Check | Expected |
| :--- | :--- |
| `GET /health` | `200` · `status: ok` |
| Demo Mode on → Analyze | Instant mock graph (`is_mock=true`) |
| Demo Mode off → Analyze | Live Gemini + Neo4j upsert (`is_mock=false`) |
| Load Full Institutional Graph | Macro Neo4j graph renders |
| Graph colors | Blue academic · Red gap ≥ 0.5 · Green covered |
| Link particles | Red particles on gaps · green on covered |
| Alignment card | Score % + Courses / Skills / Alerts populated |
| Download Report | Saves `Axiomm_Report.md` |
| PDF upload | Text extracted; analysis runs |
| Loading overlay | “Synthesizing Curriculum” / semantic gap copy |
| Sidebar scroll | Full card visible at 1080p / 100% zoom |

## Optional / Future (Post-jury)
- PWA packaging for offline install
- Export graph as PNG / SVG
- Multi-syllabus batch compare dashboard
- Auth + multi-tenant dean workspaces

## Local Run
```powershell
# Backend
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
# → http://localhost:5173
```

## Repo
https://github.com/Parth5002/TETRA034
