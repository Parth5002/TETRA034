import { AlertTriangle, CheckCircle2, Clock, Download, Gauge } from "lucide-react";

export default function AIResultCard({ aiData, graphData }) {
  if (!aiData) return null;

  const hours =
    typeof aiData.estimated_hours === "number" ? aiData.estimated_hours : 0;
  const difficulty = aiData.difficulty || "Medium";

  const nodes = graphData?.nodes || [];
  const skills = nodes.filter(
    (n) => n.group === 2 || n.type === "industry_skill"
  );
  const academic = nodes.length - skills.length;
  const severeGaps = skills.filter(
    (n) => (typeof n.gap_score === "number" ? n.gap_score : 0) >= 0.5
  ).length;
  const covered = skills.length - severeGaps;
  const alignmentScore =
    skills.length > 0 ? Math.round((covered / skills.length) * 100) : 0;

  const handleDownloadReport = () => {
    const markdown = `# Axiomm Curriculum Report

## Summary
${aiData.summary || ""}

## Actionable Update
${aiData.actionable_update || ""}

## Effort Estimate
- **Estimated hours:** ${hours}
- **Difficulty:** ${difficulty}

## Analytics
- **Alignment score:** ${alignmentScore}%
- **Courses:** ${academic}
- **Skills mapped:** ${skills.length}
- **Critical gaps:** ${severeGaps}
`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Axiomm_Report.md";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in-card rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
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

      <div className="px-4 pt-4 pb-1">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Curriculum Alignment Score
            </span>
            <span className="text-sm font-bold text-slate-900">
              {alignmentScore}%
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${
                alignmentScore >= 70
                  ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                  : alignmentScore >= 40
                    ? "bg-amber-400"
                    : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
              }`}
              style={{ width: `${alignmentScore}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-blue-700 drop-shadow-sm">
              {academic}
            </div>
            <div className="text-[10px] font-bold text-blue-600/80 uppercase tracking-wider mt-0.5">
              Courses
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-slate-800 drop-shadow-sm">
              {skills.length}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Skills
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 p-3 text-center shadow-sm">
            <div className="text-2xl font-black text-red-600 drop-shadow-sm">
              {severeGaps}
            </div>
            <div className="text-[10px] font-bold text-red-600/80 uppercase tracking-wider mt-0.5">
              Alerts
            </div>
          </div>
        </div>
      </div>
      <div className="h-px w-full bg-slate-100 my-2" />

      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
            {aiData.summary}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-emerald-50/50 border border-emerald-100/50 p-4">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Execution Plan
            </span>
          </div>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-slate-700 font-medium">
            {aiData.actionable_update}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300"
        >
          <Download className="h-4 w-4" />
          Download Report
        </button>
      </div>
    </div>
  );
}
