/** FastAPI backend client for Axiomm (TETRA034). */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export type BackendNode = {
  id: string;
  name: string;
  group: number;
  type: "academic_module" | "industry_skill";
  val?: number;
  gap_score?: number | null;
};

export type BackendLink = {
  source: string;
  target: string;
  relationship: "COVERS" | "MISSING_SKILL";
  strength: number;
};

export type BackendAIRecommendation = {
  summary: string;
  actionable_update: string;
  estimated_hours: number;
  difficulty: "Low" | "Medium" | "High";
};

export type BackendAnalysisResponse = {
  nodes: BackendNode[];
  links: BackendLink[];
  ai_recommendation: BackendAIRecommendation;
  is_mock: boolean;
};

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) {
      return body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join("; ");
    }
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}

/**
 * Live syllabus gap analysis via multipart form (POST /api/analyze).
 */
export async function analyzeSyllabus(
  text: string,
  file: File | null = null,
): Promise<BackendAnalysisResponse> {
  const form = new FormData();
  form.append("syllabus_text", text || "");
  if (file) form.append("file", file);

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Instant demo/fallback payload (GET /api/mock-analyze). */
export async function mockAnalyze(): Promise<BackendAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/mock-analyze`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** Institutional Course↔Skill graph from Neo4j (GET /api/macro-graph). */
export async function fetchMacroGraph(): Promise<BackendAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/macro-graph`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}
