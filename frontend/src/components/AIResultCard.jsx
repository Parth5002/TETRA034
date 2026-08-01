import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function AIResultCard({ aiData }) {
  if (!aiData) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">
          AI curriculum recommendation
        </h2>
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
      </div>
    </div>
  );
}
