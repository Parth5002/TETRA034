import { useEffect, useMemo, useRef, useState } from "react";
import { Crosshair, Maximize2 } from "lucide-react";
import type { GraphData, GraphNode } from "@/lib/axiomm-data";

type SimNode = GraphNode & { x: number; y: number; vx: number; vy: number };
type SimLink = { source: SimNode; target: SimNode };

const COLORS = {
  module: "#3b82f6",
  severe: "#ef4444",
  covered: "#22c55e",
};

function nodeColor(n: GraphNode) {
  if (n.kind === "module") return COLORS.module;
  return n.gap_score >= 0.5 ? COLORS.severe : COLORS.covered;
}

export function GraphVisualizer({ data }: { data: GraphData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const hoverRef = useRef<string | null>(null);
  const viewRef = useRef({ x: 0, y: 0, k: 1 });
  const dragRef = useRef<{ node: SimNode | null; panning: boolean; lx: number; ly: number }>({
    node: null,
    panning: false,
    lx: 0,
    ly: 0,
  });
  const [filter, setFilter] = useState<"all" | "gaps">("all");
  const [recenterTick, setRecenterTick] = useState(0);

  const filtered = useMemo(() => {
    if (filter === "all") return data;
    const keep = new Set(
      data.nodes.filter((n) => n.kind === "module" || n.gap_score >= 0.5).map((n) => n.id),
    );
    return {
      nodes: data.nodes.filter((n) => keep.has(n.id)),
      links: data.links.filter((l) => keep.has(l.source) && keep.has(l.target)),
    };
  }, [data, filter]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = wrap.clientWidth;
    let height = wrap.clientHeight;

    const nodes: SimNode[] = filtered.nodes.map((n, i) => {
      const angle =
        filtered.nodes.length > 0
          ? (i / filtered.nodes.length) * Math.PI * 2
          : 0;
      return {
        ...n,
        x: Math.cos(angle) * 180 + (Math.random() - 0.5) * 40,
        y: Math.sin(angle) * 180 + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
      };
    });
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const links: SimLink[] = filtered.links
      .map((l) => ({ source: byId.get(l.source)!, target: byId.get(l.target)! }))
      .filter((l) => l.source && l.target);

    const neighbors = new Map<string, Set<string>>();
    nodes.forEach((n) => neighbors.set(n.id, new Set([n.id])));
    links.forEach((l) => {
      neighbors.get(l.source.id)!.add(l.target.id);
      neighbors.get(l.target.id)!.add(l.source.id);
    });

    viewRef.current = { x: 0, y: 0, k: 1 };

    const dpr = () => Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      width = wrap.clientWidth;
      height = wrap.clientHeight;
      canvas.width = width * dpr();
      canvas.height = height * dpr();
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // ---- force simulation ----
    let alpha = 1;
    const step = () => {
      alpha = Math.max(alpha * 0.995, 0.02);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!;
          const b = nodes[j]!;
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d2 = dx * dx + dy * dy || 0.01;
          const rep = (26000 * alpha) / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * rep;
          const fy = (dy / d) * rep;
          a.vx -= fx;
          a.vy -= fy;
          b.vx += fx;
          b.vy += fy;
        }
      }
      links.forEach(({ source, target }) => {
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const f = ((d - 150) * 0.045 * alpha) / d;
        source.vx += dx * f;
        source.vy += dy * f;
        target.vx -= dx * f;
        target.vy -= dy * f;
      });
      nodes.forEach((n) => {
        n.vx -= n.x * 0.004 * alpha;
        n.vy -= n.y * 0.004 * alpha;
        if (dragRef.current.node === n) return;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
      });
    };

    // ---- rendering ----
    let t = 0;
    const draw = () => {
      t += 0.006;
      const view = viewRef.current;
      ctx.setTransform(dpr(), 0, 0, dpr(), 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2 + view.x, height / 2 + view.y);
      ctx.scale(view.k, view.k);

      const hover = hoverRef.current;
      const near = hover ? neighbors.get(hover) : null;
      const dim = (id: string) => (near && !near.has(id) ? 0.05 : 1);

      // links + particles
      links.forEach(({ source, target }) => {
        const active = !near || (near.has(source.id) && near.has(target.id));
        ctx.globalAlpha = active ? 0.55 : 0.05;
        const severe = Math.max(source.gap_score, target.gap_score) >= 0.5;
        ctx.strokeStyle = severe ? "rgba(239,68,68,0.55)" : "rgba(100,116,139,0.45)";
        ctx.lineWidth = 1.1;
        ctx.setLineDash(severe ? [5, 5] : []);
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // directional particles
        for (let p = 0; p < 2; p++) {
          const prog = (t * 1.6 + p * 0.5) % 1;
          const px = source.x + (target.x - source.x) * prog;
          const py = source.y + (target.y - source.y) * prog;
          ctx.globalAlpha = active ? 0.95 : 0.05;
          ctx.fillStyle = severe ? "#ef4444" : "#38bdf8";
          ctx.shadowBlur = 10;
          ctx.shadowColor = severe ? "#ef4444" : "#38bdf8";
          ctx.beginPath();
          ctx.arc(px, py, 2.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // nodes
      nodes.forEach((n) => {
        const severe = n.kind === "skill" && n.gap_score >= 0.5;
        const color = nodeColor(n);
        const r = n.kind === "module" ? 7.5 : severe ? 6.5 : 5.5;
        ctx.globalAlpha = dim(n.id);

        if (severe) {
          const pulse = 0.6 + 0.4 * Math.sin(t * 6 + n.x * 0.02);
          ctx.shadowBlur = 25 * pulse;
          ctx.shadowColor = "rgba(239,68,68,0.95)";
          ctx.fillStyle = "rgba(239,68,68,0.16)";
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 6 * pulse, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.stroke();

        // label
        ctx.font = `${severe ? 600 : 500} ${13 / Math.max(view.k, 0.75)}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(255,255,255,0.92)";
        ctx.strokeText(n.label, n.x, n.y + r + 6);
        ctx.fillStyle = severe ? "#7f1d1d" : "#0f172a";
        ctx.fillText(n.label, n.x, n.y + r + 6);
      });

      ctx.globalAlpha = 1;
      ctx.restore();
    };

    const loop = () => {
      step();
      draw();
      frameRef.current = requestAnimationFrame(loop);
    };
    loop();

    // ---- interaction ----
    const toWorld = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const view = viewRef.current;
      return {
        x: (e.clientX - rect.left - width / 2 - view.x) / view.k,
        y: (e.clientY - rect.top - height / 2 - view.y) / view.k,
      };
    };
    const pick = (e: MouseEvent) => {
      const { x, y } = toWorld(e);
      return nodes.find((n) => (n.x - x) ** 2 + (n.y - y) ** 2 < 14 ** 2) ?? null;
    };
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (d.node) {
        const { x, y } = toWorld(e);
        d.node.x = x;
        d.node.y = y;
        d.node.vx = 0;
        d.node.vy = 0;
        alpha = Math.max(alpha, 0.3);
        return;
      }
      if (d.panning) {
        viewRef.current.x += e.clientX - d.lx;
        viewRef.current.y += e.clientY - d.ly;
        d.lx = e.clientX;
        d.ly = e.clientY;
        return;
      }
      const hit = pick(e);
      hoverRef.current = hit?.id ?? null;
      canvas.style.cursor = hit ? "pointer" : "grab";
    };
    const onDown = (e: MouseEvent) => {
      const hit = pick(e);
      dragRef.current = { node: hit, panning: !hit, lx: e.clientX, ly: e.clientY };
    };
    const onUp = () => {
      dragRef.current = { node: null, panning: false, lx: 0, ly: 0 };
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const k = viewRef.current.k * (e.deltaY < 0 ? 1.1 : 0.9);
      viewRef.current.k = Math.min(3, Math.max(0.35, k));
    };
    const onLeave = () => {
      hoverRef.current = null;
      onUp();
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [filtered, recenterTick]);

  return (
    <div ref={wrapRef} className="dot-grid relative h-full w-full overflow-hidden">
      <div className="halo-wash pointer-events-none absolute inset-0" />
      <canvas ref={canvasRef} className="relative h-full w-full" />

      <div className="absolute left-4 top-20 z-20 flex items-center gap-1 rounded-full border border-glass-border bg-glass p-1 shadow-[var(--shadow-lift)] backdrop-blur-xl">
        {(["all", "gaps"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-tight transition-colors ${
              filter === f
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All" : "Gaps only"}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          onClick={() => setRecenterTick((v) => v + 1)}
          title="Recenter graph"
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Crosshair className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapRef.current?.requestFullscreen?.()}
          title="Fullscreen"
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute right-4 top-20 z-20 space-y-1.5 rounded-xl border border-glass-border bg-glass px-3.5 py-2.5 text-xs shadow-[var(--shadow-lift)] backdrop-blur-xl">
        {[
          { c: COLORS.module, l: "Academic module" },
          { c: COLORS.severe, l: "Severe gap (≥ 0.5)" },
          { c: COLORS.covered, l: "Covered (< 0.5)" },
        ].map((i) => (
          <div key={i.l} className="flex items-center gap-2 font-medium text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: i.c, boxShadow: `0 0 8px ${i.c}` }}
            />
            {i.l}
          </div>
        ))}
      </div>
    </div>
  );
}
