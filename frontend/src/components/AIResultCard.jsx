import { AlertTriangle, CheckCircle2, Clock, Download, Gauge } from "lucide-react";

export default function AIResultCard({ aiData }) {
  if (!aiData) return null;

  const hours =
    typeof aiData.estimated_hours === "number" ? aiData.estimated_hours : 0;
  const difficulty = aiData.difficulty || "Medium";

  const handleDownloadReport = () => {
    const markdown = `# NexusEd AI Curriculum Report

## Summary
${aiData.summary || ""}

## Actionable Update
${aiData.actionable_update || ""}

## Effort Estimate
- **Estimated hours:** ${hours}
- **Difficulty:** ${difficulty}
`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "NexusEd_Report.md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">
          AI curriculum recommendation
        </h2>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            <Clock className="h-3 w-3 text-slate-500" />
            {hours}h
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            <Gauge className="h-3 w-3 text-slate-500" />
            {difficulty}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2.5">
          <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-700 leading-relaxed">
            {aiData.summary}
          </p>
        </div>

        <div className="rounded-md bg-green-50 text-green-800 border-l-4 border-green-500 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Actionable update
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {aiData.actionable_update}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>
    </div>
  );
}
