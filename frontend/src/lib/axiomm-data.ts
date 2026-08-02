export type GraphNode = {
  id: string;
  label: string;
  kind: "module" | "skill";
  gap_score: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
};

export type GraphLink = { source: string; target: string };

export type GraphData = { nodes: GraphNode[]; links: GraphLink[] };

export type AIData = {
  is_mock: boolean;
  courses: number;
  skills: number;
  alerts: number;
  alignment_score: number;
  horizon: string;
  confidence: string;
  headline: string;
  summary: string;
  recommendations: { title: string; action: string; severity: "high" | "medium" | "low" }[];
};

export type AnalysisResponse = { graphData: GraphData; aiData: AIData };

const n = (
  id: string,
  label: string,
  kind: GraphNode["kind"],
  gap_score: number,
): GraphNode => ({ id, label, kind, gap_score });

export const MOCK_ANALYSIS: AnalysisResponse = {
  graphData: {
    nodes: [
      n("m1", "Artificial Intelligence Fundamentals", "module", 0),
      n("s1", "Agentic Workflows", "skill", 0.86),
      n("s2", "Fine-Tuning LLMs", "skill", 0.74),
      n("s3", "Quantum Computing Basics", "skill", 0.61),
      n("s4", "LangChain / LlamaIndex", "skill", 0.69),
      n("s5", "Prompt Engineering & Evaluation", "skill", 0.31),
      n("s6", "RAG Pipeline Architectures", "skill", 0.78),

      n("m2", "Data Structures & Algorithms", "module", 0),
      n("s7", "Graph Traversal vs Cypher", "skill", 0.55),
      n("m3", "Database Management Systems", "module", 0),
      n("s8", "Vector Databases (ChromaDB)", "skill", 0.81),
      n("s9", "Neo4j Cypher Querying", "skill", 0.72),

      n("m4", "Software Engineering", "module", 0),
      n("s10", "MLOps & Model Observability", "skill", 0.88),
      n("s11", "Docker / Kubernetes", "skill", 0.28),
    ],
    links: [
      { source: "m1", target: "s1" },
      { source: "m1", target: "s2" },
      { source: "m1", target: "s3" },
      { source: "m1", target: "s4" },
      { source: "m1", target: "s5" },
      { source: "m1", target: "s6" },
      { source: "s1", target: "s2" },
      { source: "s6", target: "s8" },
      { source: "m2", target: "s7" },
      { source: "m2", target: "s8" },
      { source: "m3", target: "s8" },
      { source: "m3", target: "s9" },
      { source: "m4", target: "s10" },
      { source: "m4", target: "s11" },
      { source: "s10", target: "s11" },
    ],
  },
  aiData: {
    is_mock: true,
    courses: 4,
    skills: 11,
    alerts: 8,
    alignment_score: 42,
    horizon: "24h",
    confidence: "High",
    headline: "AI curriculum recommendation",
    summary:
      "The curriculum covers classical foundations well, but eight 2026 industry skills are severely under-served. Agentic systems, retrieval infrastructure and MLOps observability represent the highest-risk gaps for graduate employability.",
    recommendations: [
      {
        title: "Insert an agentic systems studio into CS301",
        action:
          "Add a 3-week module: tool-calling, planner/executor loops, eval harnesses. Assess with a graded autonomous agent build.",
        severity: "high",
      },
      {
        title: "Extend CS302 with vector + graph storage",
        action:
          "Replace one relational lab with ChromaDB embeddings retrieval and a Neo4j Cypher traversal comparison.",
        severity: "high",
      },
      {
        title: "Bolt observability onto the SE capstone",
        action:
          "Require model drift dashboards and CI-gated evals before capstone sign-off.",
        severity: "medium",
      },
    ],
  },
};

export const SAMPLE_SYLLABUS = `CS301 Data Structures & Algorithms
- Arrays, linked lists, trees, graphs
- Sorting and searching (BFS/DFS)
- Complexity analysis

CS302 Database Management Systems
- Relational algebra, normalization
- SQL, transactions, indexing

CS410 Artificial Intelligence Fundamentals
- Search, logic, classical ML
- Neural network basics

CS450 Software Engineering
- Agile process, testing, CI/CD
- System design and deployment`;

export function severityColor(score: number) {
  if (score >= 0.5) return "severe";
  if (score > 0) return "warn";
  return "module";
}
