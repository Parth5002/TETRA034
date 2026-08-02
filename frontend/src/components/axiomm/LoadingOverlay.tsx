export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/45 backdrop-blur-xl">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <span className="scan-ring absolute inset-0" />
        <span className="scan-ring absolute inset-0" style={{ animationDelay: "0.8s" }} />
        <span className="scan-ring absolute inset-0" style={{ animationDelay: "1.6s" }} />
        <span
          className="absolute inset-8 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent, var(--cyan), transparent 70%)",
            animation: "orbit-spin 1.4s linear infinite",
            mask: "radial-gradient(circle, transparent 58%, black 60%)",
            WebkitMask: "radial-gradient(circle, transparent 58%, black 60%)",
          }}
        />
        <span className="gradient-action h-5 w-5 animate-pulse rounded-full shadow-[0_0_24px_var(--cyan)]" />
      </div>
      <p className="mt-6 font-display text-base font-bold tracking-tight">
        Synthesizing Curriculum Intelligence…
      </p>
      <p className="mt-1.5 font-mono text-xs tracking-wider text-muted-foreground">
        mapping modules → 2026 skill ontology
      </p>
    </div>
  );
}
