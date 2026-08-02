import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { forceCollide } from "d3-force-3d";
import { Expand, GitBranch } from "lucide-react";

function nodeLabel(node) {
  const gap =
    typeof node.gap_score === "number"
      ? `<br/>Gap score: ${node.gap_score.toFixed(2)}`
      : "";
  return `<div><strong>${node.name}</strong><br/>Type: ${node.type}${gap}</div>`;
}

function linkEndpointId(endpoint) {
  if (endpoint == null) return null;
  return typeof endpoint === "object" ? endpoint.id : endpoint;
}

function nodesAreLinked(links, aId, bId) {
  return (links || []).some((link) => {
    const source = linkEndpointId(link.source);
    const target = linkEndpointId(link.target);
    return (
      (source === aId && target === bId) || (source === bId && target === aId)
    );
  });
}

export default function GraphVisualizer({ graphData }) {
  const containerRef = useRef(null);
  const fgRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [filter, setFilter] = useState("ALL");
  const [hoverNode, setHoverNode] = useState(null);
  const hoverNodeRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const update = () => {
      setDims({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const graphPayload = useMemo(() => {
    if (!graphData?.nodes?.length) return null;

    let nodes = graphData.nodes.map((n) => ({ ...n }));
    if (filter === "GAPS_ONLY") {
      nodes = nodes.filter(
        (n) =>
          n.type === "academic_module" ||
          (n.type === "industry_skill" &&
            typeof n.gap_score === "number" &&
            n.gap_score >= 0.5)
      );
    }

    const allowedIds = new Set(nodes.map((n) => n.id));
    const links = (graphData.links ?? [])
      .map((l) => ({
        ...l,
        source: linkEndpointId(l.source),
        target: linkEndpointId(l.target),
      }))
      .filter((l) => allowedIds.has(l.source) && allowedIds.has(l.target));

    return { nodes, links };
  }, [graphData, filter]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !graphPayload) return;

    const charge = fg.d3Force("charge");
    if (charge && typeof charge.strength === "function") {
      charge.strength(-400);
    }

    const linkForce = fg.d3Force("link");
    if (linkForce && typeof linkForce.distance === "function") {
      linkForce.distance(90);
    }

    fg.d3Force(
      "collide",
      forceCollide((node) => Math.max(10, (node.val || 12) * 0.8) + 14).iterations(2)
    );

    if (typeof fg.d3ReheatSimulation === "function") {
      fg.d3ReheatSimulation();
    }
  }, [graphPayload]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      {!graphPayload ? (
        <div className="h-full w-full flex items-center justify-center p-8">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <GitBranch className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              Upload syllabus to map skills
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Paste a syllabus or drop a PDF on the left and run analysis.
              Academic modules appear in blue; severe skill gaps in red; covered
              skills in green.
            </p>
            <div className="mt-5 flex items-center justify-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                Academic
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Severe gap
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Covered
              </span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute top-3 left-3 z-10 rounded-lg bg-white/70 backdrop-blur-md border border-white/40 shadow-xl px-2 py-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("GAPS_ONLY")}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === "GAPS_ONLY"
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              Gaps only
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={() => fgRef.current?.zoomToFit(400, 60)}
              className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Recenter Graph"
            >
              <Expand className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="absolute top-3 right-3 z-10 rounded-lg bg-white/70 backdrop-blur-md border border-white/40 shadow-xl px-3 py-2 text-xs text-slate-600 flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Academic module
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Severe gap (≥ 0.5)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Covered (&lt; 0.5)
            </span>
          </div>

          {dims.width > 0 && dims.height > 0 && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphPayload}
              width={dims.width}
              height={dims.height}
              backgroundColor="rgba(0,0,0,0)"
              nodeId="id"
              nodeLabel={nodeLabel}
              nodeVal={(node) => node.val || 12}
              onNodeHover={(node) => {
                const id = node ? node.id : null;
                hoverNodeRef.current = id;
                setHoverNode(id);
                if (fgRef.current?.refresh) {
                  fgRef.current.refresh();
                }
              }}
              nodeCanvasObjectMode={() => "replace"}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const activeHover = hoverNodeRef.current;
                const isAcademic =
                  node.group === 1 || node.type === "academic_module";
                const gap =
                  typeof node.gap_score === "number" ? node.gap_score : 0;
                const color = isAcademic
                  ? "#3b82f6"
                  : gap >= 0.5
                    ? "#ef4444"
                    : "#10b981";

                const isDimmed =
                  activeHover != null &&
                  node.id !== activeHover &&
                  !nodesAreLinked(graphPayload.links, node.id, activeHover);

                ctx.save();
                ctx.globalAlpha = isDimmed ? 0.05 : 1.0;

                const size = Math.max(10, (node.val || 12) * 0.8);

                // Draw outer glow for severe gaps
                if (color === "#ef4444" && !isDimmed) {
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI, false);
                  ctx.fillStyle = "rgba(239, 68, 68, 0.2)";
                  ctx.fill();
                }

                // Draw main node
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.shadowBlur = !isDimmed && color === "#ef4444" ? 20 : 5;
                ctx.shadowColor = color;
                ctx.fill();

                // Draw premium white stroke around node
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();

                // Reset shadow for crisp text
                ctx.shadowBlur = 0;

                if (!isDimmed) {
                  const fontSize = Math.max(5, 16 / globalScale);
                  ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "top";

                  // Crisp text halo
                  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
                  ctx.lineWidth = 4;
                  ctx.strokeText(node.name, node.x, node.y + size + 4);

                  // Main text
                  ctx.fillStyle = "#1e293b";
                  ctx.fillText(node.name, node.x, node.y + size + 4);
                }

                ctx.globalAlpha = 1.0;
                ctx.restore();
              }}
              nodePointerAreaPaint={(node, color, ctx) => {
                const size = Math.max(10, (node.val || 12) * 0.8);
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();
              }}
              linkColor={(link) => {
                const source = linkEndpointId(link.source);
                const target = linkEndpointId(link.target);
                const isActive =
                  hoverNode != null &&
                  (source === hoverNode || target === hoverNode);

                if (hoverNode != null && !isActive) {
                  return "rgba(200, 200, 200, 0.2)";
                }

                return link.relationship === "MISSING_SKILL"
                  ? "rgba(239, 68, 68, 0.4)"
                  : "rgba(16, 185, 129, 0.4)";
              }}
              linkWidth={(link) => {
                const source = linkEndpointId(link.source);
                const target = linkEndpointId(link.target);
                const isActive =
                  hoverNode != null &&
                  (source === hoverNode || target === hoverNode);
                const base = Math.max(1, (link.strength || 0.5) * 3);
                return hoverNode != null && isActive ? base + 1.5 : base;
              }}
              linkDirectionalParticles={2}
              linkDirectionalParticleWidth={(link) =>
                link.relationship === "MISSING_SKILL" ? 3 : 2
              }
              linkDirectionalParticleColor={(link) =>
                link.relationship === "MISSING_SKILL"
                  ? "rgba(239, 68, 68, 0.8)"
                  : "rgba(16, 185, 129, 0.8)"
              }
              linkDirectionalParticleSpeed={0.005}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              cooldownTicks={120}
              d3AlphaDecay={0.022}
              onEngineStop={() => fgRef.current?.zoomToFit(400, 60)}
            />
          )}
        </>
      )}
    </div>
  );
}
