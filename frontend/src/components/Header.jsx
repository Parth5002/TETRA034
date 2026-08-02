export default function Header({ demoMode, onDemoModeChange }) {
  return (
    <header className="h-15 shrink-0 border-b border-cyan-100/80 bg-gradient-to-r from-white via-sky-50/50 to-teal-50/40 backdrop-blur-xl px-5 flex items-center justify-between z-20 shadow-[0_1px_0_rgba(14,165,233,0.08)]">
      <div className="flex items-center gap-3.5 animate-fade-in">
        {/* Animated brand mark — curriculum graph metaphor */}
        <div className="brand-mark group relative h-11 w-11 shrink-0">
          <div className="brand-mark-glow absolute -inset-1 rounded-2xl opacity-70 blur-md" />
          <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 p-[1.5px] shadow-lg shadow-cyan-500/30">
            <div className="relative h-full w-full rounded-[14px] bg-slate-950 overflow-hidden flex items-center justify-center">
              <svg
                viewBox="0 0 40 40"
                className="h-7 w-7 relative z-10"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="axiommStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
                {/* Orbit ring */}
                <circle
                  cx="20"
                  cy="20"
                  r="11"
                  fill="none"
                  stroke="url(#axiommStroke)"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                  className="brand-orbit"
                  opacity="0.7"
                />
                {/* Graph links */}
                <line x1="20" y1="12" x2="28" y2="24" stroke="#67e8f9" strokeWidth="1.3" opacity="0.85" />
                <line x1="20" y1="12" x2="12" y2="24" stroke="#2dd4bf" strokeWidth="1.3" opacity="0.85" />
                <line x1="12" y1="24" x2="28" y2="24" stroke="#38bdf8" strokeWidth="1.2" opacity="0.7" />
                {/* Nodes */}
                <circle cx="20" cy="12" r="2.6" fill="#38bdf8" className="brand-node brand-node-a" />
                <circle cx="28" cy="24" r="2.4" fill="#f87171" className="brand-node brand-node-b" />
                <circle cx="12" cy="24" r="2.4" fill="#34d399" className="brand-node brand-node-c" />
              </svg>
              <div className="brand-shine pointer-events-none absolute inset-0" />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="brand-wordmark text-[17px] font-extrabold tracking-tight leading-none">
              Axiomm
            </h1>
            <span className="live-pill inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="text-[11px] font-semibold leading-tight mt-1 bg-gradient-to-r from-cyan-700 to-blue-600 bg-clip-text text-transparent">
            Curriculum Intelligence Engine
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 animate-fade-in">
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-cyan-100 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 shadow-sm">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-cyan-500" />
          Graph engine ready
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none rounded-full border border-cyan-100 bg-white/90 px-3 py-1.5 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/10 transition-all duration-300">
          <span className="text-xs font-semibold text-slate-600">Demo Mode</span>
          <button
            type="button"
            role="switch"
            aria-checked={demoMode}
            onClick={() => onDemoModeChange(!demoMode)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-300 ${
              demoMode
                ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${
                demoMode ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>
    </header>
  );
}
