import { Activity } from "lucide-react";

function AxiommMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      <defs>
        <linearGradient id="ax-core" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.2 262)" />
          <stop offset="60%" stopColor="oklch(0.7 0.15 213)" />
          <stop offset="100%" stopColor="oklch(0.74 0.13 175)" />
        </linearGradient>
        <linearGradient id="ax-plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.28 0.05 262)" />
          <stop offset="100%" stopColor="oklch(0.18 0.04 258)" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="14" fill="url(#ax-plate)" />
      <g className="animate-orbit" style={{ transformBox: "fill-box" }}>
        <ellipse
          cx="24"
          cy="24"
          rx="13"
          ry="6.5"
          fill="none"
          stroke="url(#ax-core)"
          strokeWidth="1.6"
          opacity="0.9"
          transform="rotate(-28 24 24)"
        />
      </g>
      <g className="animate-orbit-slow" style={{ transformBox: "fill-box" }}>
        <ellipse
          cx="24"
          cy="24"
          rx="13"
          ry="6.5"
          fill="none"
          stroke="url(#ax-core)"
          strokeWidth="1.2"
          opacity="0.55"
          transform="rotate(52 24 24)"
        />
      </g>
      <circle cx="24" cy="24" r="4.4" fill="url(#ax-core)" />
      <circle cx="36" cy="16" r="2.1" fill="oklch(0.78 0.14 200)" />
      <circle cx="12" cy="32" r="1.8" fill="oklch(0.74 0.13 175)" />
      <circle cx="34" cy="34" r="1.6" fill="oklch(0.66 0.19 262)" />
    </svg>
  );
}

export function Header({
  demoMode,
  onDemoModeChange,
}: {
  demoMode: boolean;
  onDemoModeChange: (v: boolean) => void;
}) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 px-4 pt-4">
      <div className="pointer-events-auto mx-auto flex max-w-[1800px] items-center gap-4 rounded-2xl border border-glass-border bg-glass px-4 py-2.5 shadow-[var(--shadow-lift)] backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <span className="shrink-0">
            <AxiommMark />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate font-display text-lg font-bold tracking-tight text-foreground">
                Axiomm
              </h1>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-covered/40 bg-covered/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-covered">
                <span className="h-1.5 w-1.5 rounded-full bg-covered shadow-[0_0_8px_var(--covered)]" />
                Live
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Curriculum Intelligence Engine
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground md:flex">
            <Activity className="h-3.5 w-3.5 text-cyan" />
            Graph engine ready
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={demoMode}
            onClick={() => onDemoModeChange(!demoMode)}
            className="flex items-center gap-2.5 rounded-full border border-border/70 bg-background/60 py-1.5 pl-3 pr-1.5 text-xs font-semibold tracking-tight transition-colors hover:border-cyan/50"
          >
            <span className="text-foreground">Demo Mode</span>
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                demoMode ? "bg-covered" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-card shadow transition-transform ${
                  demoMode ? "translate-x-[1.15rem]" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
