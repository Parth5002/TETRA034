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
    <div className="h-screen w-full bg-dot-grid flex flex-col overflow-hidden">
      <div className="pt-2.5 px-3 z-30">
        <Header demoMode={demoMode} onDemoModeChange={setDemoMode} />
      </div>

      <div className="flex flex-1 min-h-0 p-3 gap-3">
        <aside className="w-[400px] h-full overflow-y-auto rounded-2xl glass-panel flex flex-col shrink-0 z-10 shadow-[0_12px_40px_rgba(15,23,42,0.08)] scroll-smooth relative backdrop-blur-xl">
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

        <main className="flex-1 h-full relative min-w-0 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(240, 249, 255, 0.4) 0%, rgba(245, 243, 255, 0.4) 100%)' }}>
          <GraphVisualizer graphData={graphData} />

          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center glass-panel-dark transition-all duration-500">
              <div className="flex flex-col items-center gap-5 glass-panel rounded-3xl px-10 py-10 shadow-[0_24px_64px_rgba(0,0,0,0.3)] border border-white/20 animate-in-card">
                <div className="relative w-20 h-20">
                  {/* Outer pulsing ring */}
                  <div className="absolute -inset-3 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-300 animate-spin opacity-60" />
                  {/* Middle scanning ring */}
                  <div className="absolute -inset-1.5 rounded-full border-[2.5px] border-blue-500/30" style={{ animation: 'scanningRing 2.4s ease-out infinite' }} />
                  {/* Inner circle */}
                  <div className="absolute inset-0 rounded-full border-[3px] border-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-gradient-to-br from-blue-500/20 to-teal-500/10" />
                  {/* Core glow */}
                  <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/30 to-blue-400/20 rounded-full blur-xl animate-pulse" />
                  {/* Central dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white shadow-lg" />
                </div>
                <div className="text-center">
                  <p className="text-base font-extrabold text-white tracking-tight">
                    Synthesizing Curriculum Intelligence
                  </p>
                  <p className="text-sm font-medium text-slate-200 mt-2 animate-pulse">
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
