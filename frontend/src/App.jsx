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
      console.error("Request failed:", err);
      if (!err.response) {
        setError(
          "Network error: Cannot connect to FastAPI backend. Ensure it is running on port 8000."
        );
      } else {
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "An error occurred during analysis."
        );
      }
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
      console.error("Request failed:", err);
      if (!err.response) {
        setError(
          "Network error: Cannot connect to FastAPI backend. Ensure it is running on port 8000."
        );
      } else {
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "An error occurred during analysis."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      <Header demoMode={demoMode} onDemoModeChange={setDemoMode} />

      <div className="flex flex-1 min-h-0">
        <aside className="w-[400px] h-full overflow-y-auto border-r border-slate-200/80 bg-white/80 backdrop-blur-xl flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] scroll-smooth relative">
          <div className="p-5 flex flex-col gap-5 min-h-min pb-12">
            <SidebarInput
              onAnalyze={handleAnalyze}
              onLoadMacro={handleLoadMacro}
              isLoading={isLoading}
            />

            {error && (
              <div className="rounded-lg border-l-4 border-l-red-500 bg-white p-3 shadow-sm flex items-start gap-2 relative">
                <span className="text-red-500 font-bold mt-0.5">!</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Analysis Error
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            )}

            {isMock && aiData && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Showing mock/fallback data (is_mock=true). Toggle Demo Mode off
                and ensure Gemini is configured for live analysis.
              </div>
            )}

            {aiData && <AIResultCard aiData={aiData} graphData={graphData} />}
          </div>
        </aside>

        <main className="flex-1 h-full relative bg-slate-50 bg-dot-grid min-w-0 shadow-[inset_4px_0_24px_rgba(0,0,0,0.02)]">
          <GraphVisualizer graphData={graphData} />

          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md transition-all duration-500">
              <div className="flex flex-col items-center gap-4 bg-white/90 px-8 py-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200/60 backdrop-blur-xl animate-in-card">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 bg-indigo-600/10 rounded-full animate-pulse"></div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800 tracking-wide">
                    Synthesizing Curriculum
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1 animate-pulse">
                    Running semantic gap analysis...
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
