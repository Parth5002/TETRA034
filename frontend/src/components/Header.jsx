import { Network } from "lucide-react";

export default function Header({ demoMode, onDemoModeChange }) {
  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white px-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
          <Network className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 leading-tight">
            NexusEd AI
          </h1>
          <p className="text-[11px] text-slate-500 leading-tight">
            CurricuAlign — Syllabus × Industry Skill Gaps
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className="text-xs font-medium text-slate-600">Demo Mode</span>
        <button
          type="button"
          role="switch"
          aria-checked={demoMode}
          onClick={() => onDemoModeChange(!demoMode)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            demoMode ? "bg-slate-900" : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              demoMode ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </label>
    </header>
  );
}
