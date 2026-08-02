import { useRef, useState } from "react";
import { FileUp, Network, Sparkles, TriangleAlert, X } from "lucide-react";

export function SidebarInput({
  syllabus,
  onSyllabusChange,
  onAnalyze,
  onLoadInstitutional,
  isLoading,
  isMock,
  error,
  onClearError,
}: {
  syllabus: string;
  onSyllabusChange: (v: string) => void;
  onAnalyze: (file: File | null) => void;
  onLoadInstitutional: () => void;
  isLoading: boolean;
  isMock: boolean;
  error?: string | null;
  onClearError?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (file: File | null | undefined) => {
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

    // For text files, also paste into the textarea for visibility.
    if (isText && !isPdf) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? "");
        if (text.trim()) onSyllabusChange(text.slice(0, 150000));
      };
      reader.readAsText(file);
    }
  };

  const canAnalyze =
    !isLoading && (Boolean(syllabus.trim()) || Boolean(selectedFile));

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl border border-glass-border bg-glass p-5 shadow-[var(--shadow-glass)] backdrop-blur-xl">
        <h2 className="font-display text-base font-bold tracking-tight">
          Syllabus ingestion
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Drop a PDF or paste course modules. Axiomm maps them against 2026
          industry skills via FastAPI + Gemini + ChromaDB + Neo4j.
        </p>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isLoading) inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isLoading) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (isLoading) return;
            acceptFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => {
            if (!isLoading) inputRef.current?.click();
          }}
          className={`relative mt-4 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all duration-300 ${
            isDragging
              ? "scale-[1.03] border-cyan bg-cyan/5 shadow-[0_0_28px_-6px_var(--cyan)]"
              : "border-border hover:border-cyan/60 hover:bg-cyan/[0.03]"
          } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
        >
          {isDragging && (
            <span
              className="animate-magnetic pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 50%, var(--cyan), transparent 70%)",
                opacity: 0.35,
              }}
            />
          )}
          <div className="relative">
            <span
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 ${
                isDragging ? "scale-110" : ""
              } gradient-action text-primary-foreground shadow-[0_10px_24px_-12px_var(--primary)]`}
            >
              <FileUp className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold tracking-tight">
              Drag & drop syllabus PDF
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse · PDF / TXT / MD · max 5MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain"
            className="hidden"
            disabled={isLoading}
            onChange={(e) => {
              acceptFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {fileError && (
          <p className="mt-2 text-xs font-medium text-severe">{fileError}</p>
        )}

        {selectedFile && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-covered/30 bg-covered/10 px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold">{selectedFile.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Ready · {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              type="button"
              aria-label="Remove file"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setFileError(null);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <label htmlFor="syllabus" className="eyebrow">
          Syllabus text
        </label>
        <textarea
          id="syllabus"
          value={syllabus}
          onChange={(e) => onSyllabusChange(e.target.value)}
          disabled={isLoading}
          spellCheck={false}
          className="h-56 w-full resize-none rounded-xl border border-glass-border bg-glass p-4 font-mono text-[13px] leading-relaxed text-foreground shadow-[var(--shadow-glass)] outline-none backdrop-blur-xl transition-all placeholder:text-muted-foreground/70 focus:border-cyan/60 focus:ring-2 focus:ring-cyan/40 disabled:opacity-60"
          placeholder="CS301 Data Structures & Algorithms…"
        />
      </section>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onAnalyze(selectedFile)}
          disabled={!canAnalyze}
          className="animate-shimmer animate-ambient-glow gradient-action relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl font-display text-sm font-bold tracking-tight text-primary-foreground transition-transform duration-200 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-70"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Analyzing…" : "Analyze skill gaps"}
        </button>

        <button
          type="button"
          onClick={onLoadInstitutional}
          disabled={isLoading}
          className="lift flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-glass-border bg-glass text-sm font-semibold tracking-tight text-foreground backdrop-blur-xl hover:border-cyan/50 disabled:opacity-60"
        >
          <Network className="h-4 w-4 text-cyan" />
          Load Full Institutional Graph
        </button>
      </div>

      {error && (
        <div className="relative flex gap-2.5 overflow-hidden rounded-xl border border-severe/40 bg-severe/10 p-3.5 text-xs leading-relaxed">
          <div className="absolute bottom-0 left-0 top-0 w-1 bg-severe" />
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-severe" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">Analysis Error</p>
            <p className="mt-0.5 text-muted-foreground">{error}</p>
          </div>
          {onClearError && (
            <button
              type="button"
              onClick={onClearError}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {isMock && (
        <div className="flex gap-2.5 rounded-xl border border-warn/40 bg-warn/10 p-3.5 text-xs leading-relaxed text-foreground/80">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
          <p>
            Showing mock/fallback data (
            <span className="font-mono">is_mock=true</span>). Toggle Demo Mode
            off and ensure Gemini is configured for live analysis.
          </p>
        </div>
      )}
    </div>
  );
}
