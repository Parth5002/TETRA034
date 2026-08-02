import { useRef, useState } from "react";
import { FileUp, Loader2, Network, Sparkles, X } from "lucide-react";

const SAMPLE_SYLLABUS = `CS301 Data Structures & Algorithms
- Arrays, linked lists, trees, graphs
- Sorting and searching (BFS/DFS)
- Complexity analysis

CS302 Database Management Systems
- Relational model and SQL
- Normalization and transactions
- Indexing basics

CS401 Artificial Intelligence Fundamentals
- Search algorithms
- Introduction to machine learning
- Knowledge representation`;

export default function SidebarInput({ onAnalyze, onLoadMacro, isLoading }) {
  const [text, setText] = useState(SAMPLE_SYLLABUS);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const acceptFile = (file) => {
    setFileError(null);
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError("File exceeds 5MB limit.");
      return;
    }

    const name = (file.name || "").toLowerCase();
    const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
    const isText =
      name.endsWith(".txt") ||
      name.endsWith(".md") ||
      file.type.startsWith("text/");

    if (!isPdf && !isText) {
      setFileError("Only PDF or Text files are supported.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;
    setFileError(null);
    const file = e.dataTransfer?.files?.[0];
    acceptFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (isLoading) return;
    if (!trimmed && !selectedFile) return;
    onAnalyze(trimmed, selectedFile);
  };

  const canSubmit = !isLoading && (Boolean(text.trim()) || Boolean(selectedFile));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-in">
      <div className="rounded-2xl glass-panel shadow-[0_12px_32px_rgba(15,23,42,0.06)] overflow-hidden">
        <div className="p-4 border-b border-slate-200/50">
          <label className="block text-sm font-bold text-slate-900 tracking-tight">
            Syllabus ingestion
          </label>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
            Drop a PDF or paste course modules. Axiomm maps them against 2026
            industry skills.
          </p>
        </div>

        <div className="p-4">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!isLoading) fileInputRef.current?.click();
              }
            }}
            onClick={() => {
              if (!isLoading) fileInputRef.current?.click();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLoading) setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isLoading) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-all duration-300 cursor-pointer magnetic-drop-zone ${
              isDragging
                ? "border-cyan-500 bg-gradient-to-b from-cyan-50 to-blue-50 scale-105 shadow-[0_16px_40px_rgba(6,182,212,0.2)] border-cyan-400"
                : "border-cyan-200 bg-gradient-to-b from-white to-sky-50/60 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/15 hover:-translate-y-1"
            } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.1),transparent_60%)]" />
            <div className="relative">
              <div
                className={`mx-auto mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all duration-300 ${
                  isDragging ? "scale-110 icon-float" : "group-hover:scale-105"
                }`}
              >
                <FileUp className="h-6 w-6" />
              </div>
              <p className="text-base font-extrabold text-slate-900 tracking-tight">
                Drag & drop syllabus PDF
              </p>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                or click to browse · PDF / TXT / MD · max 5MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain"
              className="hidden"
              disabled={isLoading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                acceptFile(file);
                e.target.value = "";
              }}
            />
          </div>

          {fileError && (
            <p className="mt-3 text-xs text-red-600 font-bold animate-fade-in">
              {fileError}
            </p>
          )}

          {selectedFile && (
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-200/60 bg-gradient-to-r from-emerald-50 to-teal-50 px-3.5 py-3 animate-fade-in shadow-[0_4px_12px_rgba(16,185,129,0.08)]">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  Ready · {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setFileError(null);
                }}
                disabled={isLoading}
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-300/60 bg-white/80 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-50 transition-all duration-200"
                aria-label="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="syllabus"
          className="block text-sm font-bold text-slate-900 mb-2 tracking-tight"
        >
          Syllabus text
        </label>
        <textarea
          id="syllabus"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="Paste university syllabus modules here…"
          className="w-full rounded-xl border border-slate-200/70 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent disabled:opacity-60 resize-y min-h-[120px] transition-all duration-300 hover:shadow-md glass-panel"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="animate-shimmer group w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 px-5 py-4 text-sm font-bold text-white shadow-[0_12px_32px_rgba(37,99,235,0.35)] hover:shadow-[0_16px_40px_rgba(6,182,212,0.45)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 button-glow"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing gaps…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            Analyze skill gaps
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onLoadMacro}
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border-2 border-cyan-200/80 bg-gradient-to-r from-cyan-50 to-blue-50 px-5 py-3.5 text-sm font-bold text-cyan-900 shadow-sm hover:border-cyan-400 hover:from-cyan-100 hover:to-blue-100 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/15 transition-all duration-300 disabled:opacity-50"
      >
        <Network className="h-4 w-4" />
        Load Full Institutional Graph
      </button>
    </form>
  );
}
