import { useRef, useState } from "react";
import { FileUp, Loader2, Sparkles, X } from "lucide-react";

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

export default function SidebarInput({ onAnalyze, isLoading }) {
  const [text, setText] = useState(SAMPLE_SYLLABUS);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const acceptFile = (file) => {
    if (!file) return;
    const name = (file.name || "").toLowerCase();
    const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
    const isText =
      name.endsWith(".txt") ||
      name.endsWith(".md") ||
      file.type.startsWith("text/");
    if (!isPdf && !isText) {
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isLoading) return;
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-1.5">
          Syllabus PDF
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Drag & drop a PDF, or paste text below. NexusEd maps it against 2026
          industry skills.
        </p>

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
          className={`rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-slate-900 bg-slate-100"
              : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/80"
          } ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <FileUp className="mx-auto h-6 w-6 text-slate-500 mb-2" />
          <p className="text-sm font-medium text-slate-800">
            Drag & Drop PDF
          </p>
          <p className="text-xs text-slate-500 mt-1">
            or click to browse (.pdf / .txt)
          </p>
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

        {selectedFile && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              disabled={isLoading}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              aria-label="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="syllabus"
          className="block text-sm font-medium text-slate-900 mb-1.5"
        >
          Syllabus text
        </label>
        <textarea
          id="syllabus"
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="Paste university syllabus modules here…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:opacity-60 resize-y min-h-[200px]"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing gaps…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Analyze skill gaps
          </>
        )}
      </button>
    </form>
  );
}
