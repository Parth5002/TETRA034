import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/axiomm/Header";
import { SidebarInput } from "@/components/axiomm/SidebarInput";
import { AIResultCard } from "@/components/axiomm/AIResultCard";
import { GraphVisualizer } from "@/components/axiomm/GraphVisualizer";
import { LoadingOverlay } from "@/components/axiomm/LoadingOverlay";
import { MOCK_ANALYSIS, SAMPLE_SYLLABUS } from "@/lib/axiomm-data";
import {
  analyzeSyllabus,
  fetchMacroGraph,
  mockAnalyze,
} from "@/lib/api";
import { mapBackendAnalysis } from "@/lib/map-analysis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Axiomm — Curriculum Intelligence Engine" },
      {
        name: "description",
        content:
          "Axiomm maps university syllabi against 2026 industry skills and surfaces severe curriculum gaps in an interactive knowledge graph.",
      },
      { property: "og:title", content: "Axiomm — Curriculum Intelligence Engine" },
      {
        property: "og:description",
        content:
          "Map syllabi to industry skills, detect severe gaps and generate actionable curriculum updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AxiommDashboard,
});

function AxiommDashboard() {
  const [demoMode, setDemoMode] = useState(false);
  const [syllabus, setSyllabus] = useState(SAMPLE_SYLLABUS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [aiData, setAiData] = useState(MOCK_ANALYSIS.aiData);
  const [hasResult, setHasResult] = useState(false);

  const applyBackend = (payload: Parameters<typeof mapBackendAnalysis>[0]) => {
    const mapped = mapBackendAnalysis(payload);
    setGraphData(mapped.graphData);
    setAiData(mapped.aiData);
    setHasResult(true);
  };

  const handleAnalyze = async (file: File | null) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = demoMode
        ? await mockAnalyze()
        : await analyzeSyllabus(syllabus, file);
      applyBackend(payload);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof TypeError
          ? "Network error: Cannot connect to FastAPI backend. Ensure it is running on port 8000."
          : err instanceof Error
            ? err.message
            : "An error occurred during analysis.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadInstitutional = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await fetchMacroGraph();
      applyBackend(payload);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof TypeError
          ? "Network error: Cannot connect to FastAPI backend. Ensure it is running on port 8000."
          : err instanceof Error
            ? err.message
            : "An error occurred loading the institutional graph.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      <Header demoMode={demoMode} onDemoModeChange={setDemoMode} />

      <aside className="z-20 flex h-full w-[400px] shrink-0 flex-col border-r border-glass-border bg-glass backdrop-blur-2xl max-lg:w-[340px] max-md:hidden">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-12 pt-24">
          <SidebarInput
            syllabus={syllabus}
            onSyllabusChange={setSyllabus}
            onAnalyze={handleAnalyze}
            onLoadInstitutional={handleLoadInstitutional}
            isLoading={isLoading}
            isMock={hasResult && aiData.is_mock}
            error={error}
            onClearError={() => setError(null)}
          />
          {hasResult && (
            <div className="mt-5">
              <AIResultCard data={aiData} />
            </div>
          )}
        </div>
      </aside>

      <main className="relative min-w-0 flex-1">
        <GraphVisualizer data={graphData} />
        {isLoading && <LoadingOverlay />}
      </main>
    </div>
  );
}
