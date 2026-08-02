# Axiomm Frontend Agent Notes

- Keep the FastAPI contract intact: `AnalysisResponse` with `nodes`, `links`, `ai_recommendation`, `is_mock`.
- Prefer `src/lib/api.ts` + `src/lib/map-analysis.ts` for backend integration.
- Do not commit secrets (`.env`). Use `.env.example` only.
