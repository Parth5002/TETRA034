import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { GitBranch } from "lucide-react";

function nodeLabel(node) {
  const gap =
    typeof node.gap_score === "number"
      ? `<br/>Gap score: ${node.gap_score.toFixed(2)}`
      : "";
  return `<div><strong>${node.name}</strong><br/>Type: ${node.type}${gap}</div>`;
}

function linkEndpointId(endpoint) {
  return typeof endpoint === "object" ? endpoint.id : endpoint;
}

export default function GraphVisualizer({ graphData }) {
  const containerRef = useRef(null);
  const fgRef = useRef();
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [filter, setFilter] = useState("ALL");

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
      .filter(
        (l) => allowedIds.has(l.source) && allowedIds.has(l.target)
      );

    return { nodes, links };
  }, [graphData, filter]);

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
          <div className="absolute top-3 left-3 z-10 rounded-lg border border-slate-200 bg-white/95 backdrop-blur px-2 py-2 shadow-sm flex items-center gap-1.5">
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
          </div>

          <div className="absolute top-3 right-3 z-10 rounded-lg border border-slate-200 bg-white/95 backdrop-blur px-3 py-2 shadow-sm text-xs text-slate-600 flex flex-col gap-1.5">
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
              backgroundColor="#f8fafc"
              nodeId="id"
              nodeLabel={nodeLabel}
              nodeVal={(node) => node.val || 12}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const isAcademic =
                  node.group === 1 || node.type === "academic_module";
                const gap =
                  typeof node.gap_score === "number" ? node.gap_score : 0;
                const color = isAcademic
                  ? "#3b82f6"
                  : gap >= 0.5
                    ? "#ef4444"
                    : "#10b981";

                const size = Math.max(4, (node.val || 12) / 2);
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();

                const fontSize = Math.max(3.5, 12 / globalScale);
                ctx.font = `500 ${fontSize}px system-ui, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";

                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 3;
                ctx.strokeText(node.name, node.x, node.y + size + 2);

                ctx.fillStyle = "#334155";
                ctx.fillText(node.name, node.x, node.y + size + 2);
              }}
              nodePointerAreaPaint={(node, color, ctx) => {
                const size = Math.max(4, (node.val || 12) / 2);
                ctx.beginPath();
                ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();
              }}
              linkColor={(link) =>
                link.relationship === "MISSING_SKILL" ? "#fca5a5" : "#86efac"
              }
              linkWidth={(link) => Math.max(1, (link.strength || 0.5) * 3)}
              linkDirectionalArrowLength={4}
              linkDirectionalArrowRelPos={1}
              cooldownTicks={80}
              d3AlphaDecay={0.04}
              onEngineStop={() => fgRef.current?.zoomToFit(400, 60)}
            />
          )}
        </>
      )}
    </div>
  );
}
