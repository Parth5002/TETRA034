# 🎓 NexusEd AI — Dynamic Syllabus & Industry Skill-Gap Synchronizer

[![TETRA ID](https://img.shields.io/badge/TETRA%20ID-TETRA034-blue.svg?style=for-the-badge)](https://github.com/Parth5002/TETRA034)
[![Hackathon](https://img.shields.io/badge/Event-TetraTHON%202026-orange.svg?style=for-the-badge)](https://nuv.ac.in)
[![Track](https://img.shields.io/badge/Track-EdTech-green.svg?style=for-the-badge)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688.svg?style=for-the-badge)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20WebGL-61DAFB.svg?style=for-the-badge)]()
[![AI Engine](https://img.shields.io/badge/AI Engine-Google%20Gemini%203.5%20Flash-4285F4.svg?style=for-the-badge)]()

> **Official Indo-French AI Hackathon Submission**  
> **Organizers:** Navrachana University (Vadodara) & ISEN Méditerranée (France)  
> **Powered by:** India AI Mission | **Incubation Partner:** Navrachana Innovation Foundation (NIF)

---

## 📌 Executive Summary

Higher education computer science curricula lag **3 to 5 years** behind market demands. Academic institutions lack automated, data-driven tools to audit syllabus content against real-time industry requirements. As a result, students graduate with high grades but face severe skill gaps in modern paradigms such as **RAG architectures, vector databases, agentic workflows, Neo4j graph querying, and MLOps observability**.

**NexusEd AI (CurricuAlign AI)** solves this problem. It acts as an automated curriculum auditor for university deans and department chairs, instantly ingesting syllabus documents (PDF/Text), querying vector stores of live 2026 industry skill embeddings, generating structured gap graphs via Google Gemini 3.5 Flash, storing persistent skill ontologies in Neo4j AuraDB, and rendering an interactive WebGL force-graph with concrete, actionable curriculum updates.

---

## 🌟 Key Differentiators & Why NexusEd AI Leads

1. **Dual DB Hybrid Architecture (Vector + Knowledge Graph):** Combines **ChromaDB** (for high-speed semantic retrieval against pre-seeded 2026 skill embeddings) with **Neo4j AuraDB** (for persistent, explainable graph relationship modeling between academic modules and industry skills).
2. **Zero-Crash Resiliency Protocol:** Built with an enterprise-grade fail-safe architecture. Every external service call (Gemini, Neo4j, ChromaDB) is guarded with multi-tier error catching and instant fallback handlers (`fallback_data.py`), guaranteeing **zero HTTP 500 errors** during live evaluation pitches.
3. **Native PDF & Text Parsing Pipeline:** Integrates `pypdf` server-side streaming to extract structured text directly from raw university syllabus PDFs or pasted course outlines.
4. **Interactive WebGL Visualizer:** Uses canvas-optimized 2D force-graph rendering with custom node labels, distance scaling, and auto-centering physics to deliver instant "Aha!" visual clarity for judges.

---

## 🏗️ System Architecture


```
┌─────────────────────────────────────────┐
│     University Dean / Department Chair  │
└────────────────────┬────────────────────┘
│ Upload PDF / Paste Text
▼
┌─────────────────────────────────────────┐
│      React 18 + Vite Frontend UI        │
│    (Tailwind CSS + WebGL Force Graph)   │
└────────────────────┬────────────────────┘
│ Multipart Axios Request (:8000)
▼
┌─────────────────────────────────────────┐
│      FastAPI Engine (Python 3.11)       │
│       Strict Pydantic v2 Schemas        │
└─────────┬──────────┬──────────┬─────────┘
│          │          │
┌─────────────────────┘          │          └─────────────────────┐
▼                                ▼                                ▼
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────────┐
│  ChromaDB (Vector)   │        │ Google Gemini Flash  │        │ Neo4j AuraDB (Graph) │
│ Semantic Search vs.  │        │ Structured JSON Gap  │        │ Persistent Course ↔  │
│ 30 2026 Industry     │        │ Analysis & Actionable│        │ Skill Ontology       │
│ Skill Embeddings     │        │ Curriculum Rewrites  │        │ Cypher Relationships │
└──────────┬───────────┘        └──────────┬───────────┘        └──────────┬───────────┘
│                               │                               │
└───────────────────────────────┼───────────────────────────────┘
▼
┌─────────────────────────────────────────┐
│           AnalysisResponse JSON         │
│ (Blue: Academic | Red: Gap | Green: Cover)│
└─────────────────────────────────────────┘
```

---

## 📊 The Interactive Graph Contract

The visualization engine renders real-time skill alignment using clear visual semantics:

| Node Type | Color Code | Description / Logic |
| :--- | :--- | :--- |
| **Academic Module** | 🔵 **Blue (`#3b82f6`)** | Existing university course subjects (e.g., DSA, DBMS, Software Engineering). |
| **Severe Skill Gap** | 🔴 **Red (`#ef4444`)** | Critical 2026 industry skills missing or under-taught (`gap_score ≥ 0.5`). |
| **Covered Skill** | 🟢 **Green (`#10b981`)** | Industry skills adequately addressed in the current syllabus (`gap_score < 0.5`). |

---

## 🛠️ Complete Tech Stack

| Layer | Technology | Function & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + Vite** | High-performance client SPA running on port 5173. |
| **UI Aesthetics** | **Tailwind CSS v3** | Clean, accessible slate/zinc design mimicking `shadcn/ui`. |
| **Visualization** | **`react-force-graph-2d`** | WebGL canvas-based force-directed graph rendering with text-halo overlays. |
| **Icons & Transport** | **`lucide-react` + `axios`** | UI system icons & typed multipart HTTP client communicating with backend. |
| **Backend Engine** | **FastAPI + Uvicorn** | Asynchronous Python API engine with OpenAPI auto-documentation (`/docs`). |
| **Data Schemas** | **Pydantic v2** | Strict contract enforcement for `Node`, `Link`, and `AIRecommendation` models. |
| **AI LLM Brain** | **Google Gemini 3.5 Flash** | High-context structured JSON generation using native `google-genai` SDK. |
| **Vector Engine** | **ChromaDB** | Local persistent vector store initialized with 30 canonical 2026 tech skill embeddings. |
| **Knowledge Graph** | **Neo4j AuraDB (Cloud)** | Enterprise graph database executing Cypher upserts for Course-Skill topologies. |
| **Document Ingestion**| **`pypdf`** | Server-side binary PDF extraction for instant multi-page syllabus ingestion. |

---

## ⚡ Zero-Crash Resiliency Protocol

In hackathon environments, live demos frequently fail due to API rate limits or network drops. NexusEd AI implements a strict **Zero-Crash Policy**:

1. **Multi-Model Fallback Chain:** If `gemini-3.5-flash` encounters quota limits, the backend automatically cascades through candidate models (`gemini-3.6-flash`, `gemini-3.1-flash-lite`, `gemini-2.5-flash`).
2. **Deterministic Fallback Payload (`fallback_data.py`):** If all external AI or database connections drop, the API gracefully catches the exception and returns a pre-validated, rich mock analysis payload with `is_mock: true`. The frontend never renders an HTTP 500 error or blank canvas.
3. **SSL Interception Relaxation (`+ssc`):** Automatically detects local proxy/antivirus TLS interception for Neo4j connections and switches to SSL-relaxed URIs gracefully.

---

## 🚀 Quickstart & Installation Guide

### Prerequisites
* **Python 3.11+**
* **Node.js 18+ & npm**
* **Google Gemini API Key** (Free tier via Google AI Studio)

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

```
Edit your .env file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password
DEMO_MODE=False

```
Run the server:
```bash
uvicorn main:app --reload --port 8000

```
> API will be live at http://localhost:8000 (Swagger docs at http://localhost:8000/docs).
> 
### 2. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev

```
> UI will be live at http://localhost:5173.
> 
## 📡 API Reference
| Endpoint | Method | Input | Description |
|---|---|---|---|
| /health | GET | None | Liveness probe returning server status and timestamp. |
| /api/mock-analyze | GET | None | Instant fallback payload for Demo Mode testing. |
| /api/analyze | POST | multipart/form-data (syllabus_text, file) | Primary analysis pipeline (ChromaDB → Gemini → Neo4j). |
| /api/analyze/json | POST | application/json (syllabus_text) | JSON body variant for REST clients. |
## 👥 Team TETRA034
 * **Parth Gohil** — *Backend Architecture, Gemini Prompt Engineering & Neo4j Integration*
 * **Nisarg** — *Frontend Engineering, WebGL Graph Visualizations & UX Design*
## 📜 License & Acknowledgments
Built under **TetraTHON 2026** (Indo-French AI Hackathon) hosted at **Navrachana University, Vadodara** in collaboration with **ISEN Méditerranée, France**, powered by the **India AI Mission** and supported by **Navrachana Innovation Foundation (NIF)**.
*All rights reserved by Team TETRA034.*
```

---

### Instructions for Git Commit:
Have Parth run these commands in terminal right now:
```bash
git add README.md
git commit -m "TETRA034: Complete production README documentation"
git push origin main

```