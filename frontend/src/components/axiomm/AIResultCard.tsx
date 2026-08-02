import { BookOpen, Clock, Gauge, Layers, ShieldAlert } from "lucide-react";
import type { AIData } from "@/lib/axiomm-data";

function scoreTone(score: number) {
  if (score < 40) return { key: "severe", label: "Critical drift" };
  if (score < 70) return { key: "warn", label: "Partial alignment" };
  return { key: "covered", label: "Industry aligned" };
}

function Metric({
  icon,
  label,
  value,
  critical = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  critical?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-3 ${
        critical
          ? "animate-alert-glow border-severe/40 bg-severe/[0.07]"
          : "border-border/70 bg-background/50"
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${
          critical ? "text-severe" : "text-muted-foreground"
        }`}
      >
        {icon}
        {label}
      </div>
      <div
        className={`mt-1.5 font-display text-2xl font-bold tracking-tight tabular-nums ${
          critical ? "text-severe" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export function AIResultCard({ data }: { data: AIData }) {
  const tone = scoreTone(data.alignment_score);

  return (
    <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-xl">
      <div className="gradient-action h-1 w-full" />

      <div className="p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="eyebrow">Intelligence brief</p>
            <h3 className="mt-1 font-display text-lg font-bold leading-snug tracking-tight">
              {data.headline}
            </h3>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground">
              <Clock className="h-3 w-3" /> {data.horizon}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground">
              <Gauge className="h-3 w-3" /> {data.confidence}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Metric icon={<BookOpen className="h-3 w-3" />} label="Courses" value={data.courses} />
          <Metric icon={<Layers className="h-3 w-3" />} label="Skills" value={data.skills} />
          <Metric
            icon={<ShieldAlert className="h-3 w-3" />}
            label="Alerts"
            value={data.alerts}
            critical
          />
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Alignment score</span>
            <span
              className="font-display text-sm font-bold tabular-nums"
              style={{ color: `var(--${tone.key})` }}
            >
              {data.alignment_score}%
            </span>
          </div>
          <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="relative h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${data.alignment_score}%`,
                background: `linear-gradient(90deg, color-mix(in oklab, var(--${tone.key}) 65%, black 8%), var(--${tone.key}))`,
                boxShadow: `0 0 14px color-mix(in oklab, var(--${tone.key}) 70%, transparent)`,
              }}
            >
              <span
                className="absolute inset-x-0 top-0 h-1/2 rounded-full"
                style={{ background: "linear-gradient(180deg, oklch(1 0 0 / 45%), transparent)" }}
              />
            </div>
          </div>
          <p
            className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--${tone.key})` }}
          >
            {tone.label}
          </p>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{data.summary}</p>

        <div className="mt-5 space-y-2.5">
          <p className="eyebrow">Actionable updates</p>
          {data.recommendations.map((rec) => {
            const color =
              rec.severity === "high" ? "severe" : rec.severity === "medium" ? "warn" : "covered";
            return (
              <div
                key={rec.title}
                className="lift rounded-lg border border-border/60 bg-background/60 p-3.5"
                style={{ borderLeft: `3px solid var(--${color})` }}
              >
                <p className="text-sm font-semibold tracking-tight">{rec.title}</p>
                <p className="mt-1.5 rounded-md bg-foreground/[0.04] p-2.5 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
                  <span style={{ color: `var(--${color})` }}>❯ </span>
                  {rec.action}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
