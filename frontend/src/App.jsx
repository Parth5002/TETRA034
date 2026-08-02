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
        <aside className="w-[400px] h-full overflow-y-auto border-r border-cyan-100/80 bg-gradient-to-b from-white via-sky-50/30 to-teal-50/20 backdrop-blur-xl flex flex-col shrink-0 z-10 shadow-[4px_0_24px_rgba(14,165,233,0.05)] scroll-smooth relative">
          <div className="p-5 flex flex-col gap-5 min-h-min pb-12">
            <SidebarInput
              onAnalyze={handleAnalyze}
              onLoadMacro={handleLoadMacro}
              isLoading={isLoading}
            />

            {error && (
              <div className="animate-in-card rounded-xl border border-red-100 bg-white p-3.5 shadow-[0_8px_24px_rgba(239,68,68,0.08)] flex items-start gap-2.5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                <span className="text-red-500 font-black mt-0.5 ml-1">!</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    Analysis Error
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {error}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            {isMock && aiData && (
              <div className="animate-fade-in rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-3.5 py-2.5 text-xs text-amber-900 font-medium shadow-sm">
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
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/45 backdrop-blur-md transition-all duration-500">
              <div className="flex flex-col items-center gap-4 bg-white/95 px-9 py-7 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-200/70 backdrop-blur-xl animate-in-card">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 border-[3px] border-slate-100 rounded-full" />
                  <div className="absolute inset-0 border-[3px] border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-2 bg-slate-900/5 rounded-full animate-pulse" />
                  <div className="absolute -inset-2 rounded-full border border-blue-200/50 ring-expand" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-extrabold text-slate-900 tracking-wide">
                    Synthesizing Curriculum
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1.5 animate-pulse">
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
