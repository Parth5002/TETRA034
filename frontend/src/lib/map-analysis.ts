import type { AIData, AnalysisResponse, GraphData } from "@/lib/axiomm-data";
import type { BackendAnalysisResponse } from "@/lib/api";

/**
 * Map FastAPI AnalysisResponse → Axiomm dashboard graph + AI card shapes.
 */
export function mapBackendAnalysis(
  payload: BackendAnalysisResponse,
): AnalysisResponse {
  const nodes = payload.nodes ?? [];
  const links = payload.links ?? [];

  const graphData: GraphData = {
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.name,
      kind: n.type === "academic_module" || n.group === 1 ? "module" : "skill",
      gap_score: typeof n.gap_score === "number" ? n.gap_score : 0,
    })),
    links: links.map((l) => ({
      source: typeof l.source === "string" ? l.source : String(l.source),
      target: typeof l.target === "string" ? l.target : String(l.target),
    })),
  };

  const modules = graphData.nodes.filter((n) => n.kind === "module");
  const skills = graphData.nodes.filter((n) => n.kind === "skill");
  const alerts = skills.filter((n) => n.gap_score >= 0.5).length;
  const covered = skills.length - alerts;
  const alignment_score =
    skills.length > 0 ? Math.round((covered / skills.length) * 100) : 0;

  const rec = payload.ai_recommendation;
  const hours = typeof rec?.estimated_hours === "number" ? rec.estimated_hours : 0;
  const difficulty = rec?.difficulty || "Medium";
  const severity: "high" | "medium" | "low" =
    difficulty === "High" ? "high" : difficulty === "Low" ? "low" : "medium";

  const aiData: AIData = {
    is_mock: Boolean(payload.is_mock),
    courses: modules.length,
    skills: skills.length,
    alerts,
    alignment_score,
    horizon: `${hours}h`,
    confidence: difficulty,
    headline: "AI curriculum recommendation",
    summary: rec?.summary || "No summary returned from analysis.",
    recommendations: [
      {
        title: "Execution Plan",
        action:
          rec?.actionable_update ||
          "No actionable curriculum update was returned.",
        severity,
      },
    ],
  };

  return { graphData, aiData };
}
