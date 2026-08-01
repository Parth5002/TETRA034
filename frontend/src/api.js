import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 120000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Live syllabus gap analysis via multipart form (matches FastAPI /api/analyze).
 * @param {string} text
 * @param {File|null} [file]
 * @returns {Promise<object>} AnalysisResponse
 */
export async function analyzeSyllabus(text, file = null) {
  const form = new FormData();
  form.append("syllabus_text", text || "");
  if (file) {
    form.append("file", file);
  }
  const { data } = await api.post("/api/analyze", form);
  return data;
}

/**
 * Instant demo/fallback payload for Demo Mode wiring.
 * @returns {Promise<object>} AnalysisResponse
 */
export async function mockAnalyze() {
  const { data } = await api.get("/api/mock-analyze");
  return data;
}

/**
 * Fetch the global institutional Course↔Skill graph from Neo4j.
 * @returns {Promise<object>} AnalysisResponse
 */
export async function fetchMacroGraph() {
  const { data } = await api.get("/api/macro-graph");
  return data;
}

export default api;
