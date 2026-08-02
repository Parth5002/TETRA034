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
    <div className="animate-in-card rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] overflow-hidden">
      <div className="relative px-4 py-3.5 border-b border-slate-100 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-slate-900 via-blue-600 to-emerald-500" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Intelligence brief
          </p>
          <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
            AI curriculum recommendation
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">
            <Clock className="h-3 w-3 text-slate-500" />
            {hours}h
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">
            <Gauge className="h-3 w-3 text-slate-500" />
            {difficulty}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4 pb-1">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Curriculum Alignment Score
            </span>
            <span className="text-base font-extrabold text-slate-900 tabular-nums">
              {alignmentScore}%
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                alignmentScore >= 70
                  ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
                  : alignmentScore >= 40
                    ? "bg-amber-400"
                    : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              }`}
              style={{ width: `${alignmentScore}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="hover-lift animate-fade-in animate-stagger-1 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100/80 p-3 text-center">
            <div className="text-2xl font-extrabold text-blue-700 tabular-nums">
              {academic}
            </div>
            <div className="text-[10px] font-bold text-blue-600/80 uppercase tracking-wider mt-0.5">
              Courses
            </div>
          </div>
          <div className="hover-lift animate-fade-in animate-stagger-2 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-3 text-center">
            <div className="text-2xl font-extrabold text-slate-800 tabular-nums">
              {skills.length}
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              Skills
            </div>
          </div>
          <div
            className={`hover-lift animate-fade-in animate-stagger-3 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100 p-3 text-center ${
              severeGaps > 0 ? "alert-glow" : ""
            }`}
          >
            <div className="text-2xl font-extrabold text-red-600 tabular-nums">
              {severeGaps}
            </div>
            <div className="text-[10px] font-bold text-red-600/80 uppercase tracking-wider mt-0.5">
              Alerts
            </div>
          </div>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent my-2" />

      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-3 bg-amber-50/60 p-3.5 rounded-xl border border-amber-100/70 animate-fade-in animate-stagger-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
            {aiData.summary}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-emerald-50/60 border border-emerald-100/70 p-4 animate-fade-in animate-stagger-3">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Execution Plan
            </span>
          </div>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-slate-700 font-medium pl-0.5">
            {aiData.actionable_update}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="group inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-gradient-to-r from-white to-cyan-50 px-3 py-2.5 text-sm font-bold text-cyan-800 hover:border-transparent hover:from-blue-600 hover:to-teal-500 hover:text-white hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
        >
          <Download className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          Download Report
        </button>
      </div>
    </div>
  );
}
