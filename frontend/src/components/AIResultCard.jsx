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
    <div className="animate-in-card rounded-2xl glass-panel overflow-hidden shadow-[0_16px_48px_rgba(15,23,42,0.1)]">
      <div className="relative px-5 py-4 border-b border-slate-200/50 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/40">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
            Intelligence brief
          </p>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            AI curriculum recommendation
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <Clock className="h-3.5 w-3.5 text-blue-500" />
            {hours}h
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <Gauge className="h-3.5 w-3.5 text-amber-500" />
            {difficulty}
          </span>
        </div>
      </div>

      <div className="px-5 pt-5 pb-2">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Curriculum Alignment Score
            </span>
            <span className="text-xl font-extrabold text-slate-900 tabular-nums">
              {alignmentScore}%
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1200 ease-out relative overflow-hidden font-bold ${
                alignmentScore >= 70
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_16px_rgba(16,185,129,0.8)]"
                  : alignmentScore >= 40
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_12px_rgba(251,146,60,0.6)]"
                    : "bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.8)]"
              }`}
              style={{ width: `${alignmentScore}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <div className="hover-lift animate-fade-in animate-stagger-1 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200/60 p-3.5 text-center shadow-sm hover:shadow-lg hover:shadow-blue-500/15">
            <div className="text-3xl font-extrabold text-blue-700 tabular-nums">
              {academic}
            </div>
            <div className="text-[10px] font-bold text-blue-700/70 uppercase tracking-wider mt-1">
              Courses
            </div>
          </div>
          <div className="hover-lift animate-fade-in animate-stagger-2 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 p-3.5 text-center shadow-sm hover:shadow-lg hover:shadow-slate-500/10">
            <div className="text-3xl font-extrabold text-slate-800 tabular-nums">
              {skills.length}
            </div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mt-1">
              Skills
            </div>
          </div>
          <div
            className={`hover-lift animate-fade-in animate-stagger-3 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/60 p-3.5 text-center shadow-sm ${
              severeGaps > 0 ? "critical-glow" : ""
            }`}
          >
            <div className="text-3xl font-extrabold text-red-600 tabular-nums">
              {severeGaps}
            </div>
            <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mt-1">
              Critical Gaps
            </div>
          </div>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200/50 to-transparent my-3" />

      <div className="p-5 flex flex-col gap-3.5">
        <div className="flex gap-3.5 bg-gradient-to-r from-amber-50/80 to-orange-50/80 p-4 rounded-xl border border-amber-200/60 animate-fade-in animate-stagger-2 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 flex-shrink-0" />
          <p className="text-[13px] text-slate-800 leading-relaxed font-medium">
            {aiData.summary}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/60 p-4.5 animate-fade-in animate-stagger-3 shadow-sm">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
          <div className="flex items-center gap-2.5 mb-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-700 flex-shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              Execution Plan
            </span>
          </div>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-slate-800 font-medium pl-1">
            {aiData.actionable_update}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="group inline-flex items-center justify-center gap-2.5 rounded-xl border border-cyan-300/60 bg-gradient-to-r from-white via-cyan-50 to-blue-50 px-4 py-3 text-sm font-bold text-cyan-900 hover:from-cyan-50 hover:via-blue-50 hover:to-teal-50 hover:border-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-teal-500 hover:text-white hover:-translate-y-1 shadow-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
        >
          <Download className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          Download Report
        </button>
      </div>
    </div>
  );
}
