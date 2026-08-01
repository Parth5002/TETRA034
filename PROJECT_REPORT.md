# NexusEd AI (CurricuAlign AI) — Final Project Report

**Hackathon project** · Bridging university syllabi and 2026 industry skill gaps  
**Status:** Demo-ready for mentor evaluation · Live E2E verified  
**Last updated:** Aug 1, 2026 (pre-evaluation polish)

---

## 1. Problem

Universities still teach classical CS (DSA, SQL, basic AI). Industry in 2026 expects RAG pipelines, vector databases, agentic workflows, Neo4j Cypher, MLOps, and fine-tuning.

Faculty lack a fast way to see **where the curriculum falls short** and **what to add next**.

## 2. Solution

**NexusEd AI** lets a dean/professor paste a syllabus **or upload a PDF** and instantly get:

1. An interactive **force-graph** of academic modules vs industry skills (labeled, auto-centered)
2. Color-coded **gaps** (red = severe, green = covered, blue = academic)
3. An **AI recommendation** with concrete syllabus updates
4. A **loading overlay** during analysis so the demo feels polished

---

## 3. Architecture

```
Professor / Dean
      │  paste text OR upload PDF
      ▼
React (Vite :5173)  ──axios multipart──►  FastAPI (:8000)
                                              │
                               ┌──────────────┼──────────────┐
                               ▼              ▼              ▼
                          ChromaDB      Gemini Flash    Neo4j AuraDB
                       (local vectors)  (structured     (Course↔Skill
                        30 skills)       JSON graph)     knowledge graph)
                               │              │              │
                               └──────────────┴──────────────┘
                                              ▼
                                     AnalysisResponse
                                nodes · links · ai_recommendation
                                              ▼
                               Force-graph (Blue / Red / Green)
                               + labels + zoom-to-fit
                               + AI recommendation card
```

### Pipeline (5 steps)

| Step | Action | System |
|------|--------|--------|
| 1. Ingest | Paste text and/or upload PDF | React → `POST /api/analyze` (multipart) |
| 2. Retrieve | Semantic match vs 2026 skills | ChromaDB |
| 3. Analyze | Gap graph + curriculum rewrite | Gemini 3.5 Flash (up to ~150k chars syllabus) |
| 4. Map | Persist Course ↔ Skill edges | Neo4j AuraDB (auto-reconnect) |
| 5. Visualize | Force-graph + AI card + loading UX | React UI |

---

## 4. Technology — What & Why

| Layer | Technology | Why we use it |
|-------|------------|---------------|
| Frontend | React 18 + Vite | Fast UI, hot reload, port 5173 |
| Styling | Tailwind CSS v3 | Clean shadcn-like slate aesthetics |
| Visualization | `react-force-graph-2d` | Interactive skill-gap graph with canvas labels |
| Icons / HTTP | lucide-react + axios | Icons + multipart API calls to `:8000` |
| Backend | FastAPI + Uvicorn | Async APIs; Swagger at `/docs` |
| Contracts | Pydantic v2 | Locks JSON so the graph never breaks |
| LLM | Google Gemini 3.5 Flash | Free-tier, fast, structured JSON; large syllabus context |
| Vectors | ChromaDB (local) | Semantic search without paid cloud |
| Graph DB | Neo4j AuraDB Free | Explainable COVERS / MISSING_SKILL edges |
| PDF ingest | `pypdf` | Extract syllabus text from uploaded PDFs |
| Resilience | `fallback_data.py` | Zero-crash demos — never HTTP 500 |

---

## 5. API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Liveness probe |
| `GET` | `/api/mock-analyze` | Demo Mode / fallback payload |
| `POST` | `/api/analyze` | Live analysis (text and/or PDF file) |
| `POST` | `/api/analyze/json` | JSON-body variant |

### Response contract (`AnalysisResponse`)

```json
{
  "nodes": [
    { "id": "course_1", "name": "Data Structures", "group": 1, "type": "academic_module", "val": 20 },
    { "id": "skill_1", "name": "Vector DBs", "group": 2, "type": "industry_skill", "val": 15, "gap_score": 0.85 }
  ],
  "links": [
    { "source": "course_1", "target": "skill_1", "relationship": "MISSING_SKILL", "strength": 0.85 }
  ],
  "ai_recommendation": {
    "summary": "…",
    "actionable_update": "…"
  },
  "is_mock": false
}
```

**Graph colors**

- **Blue** — Academic module (`group = 1`)
- **Red** — Severe skill gap (`gap_score ≥ 0.5`)
- **Green** — Covered skill (`gap_score < 0.5`)

---

## 6. Repository structure

```
TETRA034/
├── backend/
│   ├── main.py                 # FastAPI + PDF upload parsing
│   ├── config.py
│   ├── schemas.py
│   ├── seed_data.py
│   ├── requirements.txt        # includes pypdf
│   ├── .env.example
│   └── services/
│       ├── gemini_service.py   # structured JSON, 150k syllabus window
│       ├── chroma_service.py
│       ├── neo4j_service.py    # Aura + reconnect + SSL fallback
│       └── fallback_data.py
├── frontend/
│   └── src/
│       ├── App.jsx             # loading overlay on analyze
│       ├── api.js              # multipart text + file
│       └── components/
│           ├── Header.jsx
│           ├── SidebarInput.jsx    # drag & drop PDF + textarea
│           ├── AIResultCard.jsx
│           └── GraphVisualizer.jsx # labels, halo, zoomToFit
├── .engineering-os/
├── SKILL.md
└── PROJECT_REPORT.md
```

---

## 7. Pre-evaluation polish (latest)

| Enhancement | Detail |
|-------------|--------|
| PDF upload | Drag/drop or browse PDF; backend extracts text via `pypdf` |
| Large syllabi | Gemini prompt uses up to **150,000** characters (was 12,000) |
| Graph labels | Node names drawn on canvas with white halo for readability |
| Auto-fit | `zoomToFit` when physics settle |
| Loading UX | Blur overlay: “NexusEd AI is mapping semantic gaps...” |
| Neo4j resilience | Auto-reconnect on defunct Aura sockets; `neo4j+ssc` TLS workaround |

---

## 8. Zero-crash policy

Every Gemini / Chroma / Neo4j call is wrapped in `try/except`.

If AI rate-limits, Neo4j drops, or SSL fails → API returns rich mock data (`is_mock: true`) instead of crashing with HTTP 500.  
The React UI **never blanks** during a live pitch.

---

## 9. How to run (demo day)

### Backend

```powershell
cd backend
copy .env.example .env
# fill GEMINI_API_KEY + Neo4j credentials
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000  
- Swagger: http://localhost:8000/docs  

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

- UI: http://localhost:5173  

### Demo tips

1. Toggle **Demo Mode** for instant fallback graph (no Gemini needed)
2. Paste syllabus text **or** drop a PDF → **Analyze skill gaps**
3. Watch loading overlay → labeled force-graph + AI recommendation card
4. Confirm terminal: `Gemini analysis succeeded` + `Upserted … Neo4j`

---

## 10. Verified live evidence

| Check | Result |
|-------|--------|
| `/health` | 200 · `status: ok` |
| `/api/mock-analyze` | 200 · `is_mock: true` |
| `/api/analyze` | 200 · Gemini succeeded · `is_mock: false` |
| Neo4j | Upserted Course/Skill nodes after analyze |
| Frontend | Blue academic + red gap clusters + labels + AI card |
| PDF path | Multipart `file` accepted; text extracted server-side |

---

## 11. Security

**Do not commit:**

- `backend/.env` (API keys, Neo4j password)
- `venv/`, `node_modules/`, `chroma_db/`
- Neo4j credentials download files

Only `backend/.env.example` (placeholders) is safe for GitHub.

---

## 12. 30-second judge pitch

> Universities teach DSA and SQL; industry wants RAG, vector DBs, and agentic workflows. Paste a syllabus or drop a PDF — we retrieve similar 2026 skills from ChromaDB, let Gemini emit a typed gap graph, store it in Neo4j, and visualize COVERS vs MISSING_SKILL with labeled nodes — with a zero-crash fallback so the demo never dies.

---

## 13. Sample test inputs

**Input A — Classical CS (strong gaps)**  
CS301 DSA, CS302 DBMS (SQL), CS401 AI fundamentals  

**Input B — Modern but incomplete**  
LangChain + embeddings + Docker, missing Neo4j / K8s / RAG eval  

**Input C — PDF**  
Upload any university syllabus PDF via drag & drop  

---

## 14. Delivery status

| Phase | Objective | Status |
|-------|-----------|--------|
| 1 | Project init | Done |
| 2 | FastAPI + fallbacks | Done |
| 3 | Neo4j + ChromaDB | Done |
| 4 | Gemini structured JSON | Done (3.5 Flash) |
| 5 | React force-graph UI | Done |
| 6 | E2E + zero-crash | Done |
| Polish | PDF, labels, loading, large context | Done |

**Repo:** https://github.com/Parth5002/TETRA034  

---

**Bottom line:** NexusEd AI is a working full-stack curriculum alignment system — PDF/text ingest, semantic retrieval, generative analysis, knowledge graph persistence, and interactive visualization — built for live mentor evaluation with zero-crash resilience.
