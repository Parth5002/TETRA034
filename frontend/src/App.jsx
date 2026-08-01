import { useState } from "react";
import Header from "./components/Header.jsx";
import SidebarInput from "./components/SidebarInput.jsx";
import AIResultCard from "./components/AIResultCard.jsx";
import GraphVisualizer from "./components/GraphVisualizer.jsx";
import { analyzeSyllabus, fetchMacroGraph, mockAnalyze } from "./api.js";

export default function App() {
  const [graphData, setGraphData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState(null);

  const applyResult = (result) => {
    setGraphData({
      nodes: result.nodes ?? [],
      links: result.links ?? [],
    });
    setAiData(result.ai_recommendation ?? null);
    setIsMock(Boolean(result.is_mock));
  };

  const handleAnalyze = async (syllabusText, file = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = demoMode
        ? await mockAnalyze()
        : await analyzeSyllabus(syllabusText, file);
      applyResult(result);
    } catch (err) {
      console.error("Analyze failed:", err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Analysis failed. Is the FastAPI server running on :8000?"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMacro = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchMacroGraph();
      applyResult(result);
    } catch (err) {
      console.error("Macro graph failed:", err);
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Macro graph failed. Is Neo4j / FastAPI running?"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      <Header demoMode={demoMode} onDemoModeChange={setDemoMode} />

      <div className="flex flex-1 min-h-0">
        <aside className="w-1/3 p-4 overflow-y-auto border-r border-slate-200 bg-white flex flex-col gap-4">
          <SidebarInput
            onAnalyze={handleAnalyze}
            onLoadMacro={handleLoadMacro}
            isLoading={isLoading}
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {isMock && aiData && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Showing mock/fallback data (is_mock=true). Toggle Demo Mode off and
              ensure Gemini is configured for live analysis.
            </div>
          )}

          {aiData && <AIResultCard aiData={aiData} />}
        </aside>

        <main className="w-2/3 h-full relative bg-slate-50">
          <GraphVisualizer graphData={graphData} />

          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/60 backdrop-blur-sm transition-all duration-300">
              <div className="flex flex-col items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-200">
                <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-slate-700 animate-pulse">
                  NexusEd AI is mapping semantic gaps...
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
