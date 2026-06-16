"use client";

import { Suspense, useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { useGraphUrlState } from "@/hooks/use-graph-url-state";
import {
  applyScenario,
  filterByNodeTypes,
  findNodeBySlug,
  getFullGraph,
  getScenarios,
  searchNodes,
  traceSubgraph,
  getUpstreamNodes,
  getDownstreamNodes,
} from "@/lib/graph/semiconductor-ecosystem";
import { toReactFlow } from "@/lib/visualizations/to-react-flow";
import type { DependencyNodeType, TraceDirection } from "@/types/dependency-graph";
import type { GraphEdgeDisplay, GraphNodeDisplay, GraphPayload } from "@/types/graph";
import type { ReactFlowVizConfig } from "@/types/visualization";

import { EcosystemGraph } from "@/components/visualizations/viz-registry";
import { VizContainer } from "@/components/visualizations/viz-container";

const LAYOUT_OPTIONS = {
  rankdir: "LR" as const,
  nodesep: 110,
  ranksep: 170,
  marginx: 40,
  marginy: 40,
};

const scenarios = getScenarios();

function buildConfig(payload: GraphPayload): ReactFlowVizConfig {
  return toReactFlow(payload.nodes, payload.edges, {
    layout: "dagre",
    layoutOptions: LAYOUT_OPTIONS,
    interaction: {
      panOnScroll: true,
      fitViewOnLoad: true,
      nodesDraggable: false,
      zoomOnScroll: true,
    },
  });
}

function Diagram({ diagramKey }: { diagramKey: string }) {
  if (diagramKey === "raw-materials") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Wafer input flow (simplified)
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-foreground">
          <Step label="Silicon sand" />
          <Arrow />
          <Step label="Purification" />
          <Arrow />
          <Step label="Silicon ingot" />
          <Arrow />
          <Step label="Wafer" />
        </div>
      </div>
    );
  }

  if (diagramKey === "equipment") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Factory tool stack (simplified)
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <MiniCard title="Lithography" subtitle="Print patterns" />
          <MiniCard title="Etch" subtitle="Remove material" />
          <MiniCard title="Deposition" subtitle="Add layers" />
          <MiniCard title="Metrology" subtitle="Measure defects" />
        </div>
      </div>
    );
  }

  if (diagramKey === "foundry") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Fab loop (simplified)
        </p>
        <div className="mt-2 text-xs text-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Pill>Pattern</Pill>
            <span className="text-muted-foreground">→</span>
            <Pill>Etch</Pill>
            <span className="text-muted-foreground">→</span>
            <Pill>Deposit</Pill>
            <span className="text-muted-foreground">→</span>
            <Pill>Inspect</Pill>
            <span className="text-muted-foreground">→</span>
            <Pill>Repeat × 1000+</Pill>
          </div>
        </div>
      </div>
    );
  }

  if (diagramKey === "design") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          From idea to tape-out
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-foreground">
          <Step label="Workload goals" />
          <Arrow />
          <Step label="Architecture (CPU/GPU/AI)" />
          <Arrow />
          <Step label="RTL + verification" />
          <Arrow />
          <Step label="Physical layout → masks" />
        </div>
      </div>
    );
  }

  if (diagramKey === "memory") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Memory hierarchy
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-foreground">
          <Step label="Registers" />
          <Arrow />
          <Step label="Cache" />
          <Arrow />
          <Step label="DRAM" />
          <Arrow />
          <Step label="Storage" />
        </div>
      </div>
    );
  }

  if (diagramKey === "packaging") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Multi-die package (simplified)
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <MiniCard title="GPU die" subtitle="Compute" />
          <MiniCard title="HBM stacks" subtitle="Bandwidth" />
          <MiniCard title="Interconnect" subtitle="Links" />
          <div className="col-span-3 flex items-center justify-center text-muted-foreground">
            <span className="px-2">↓</span>
          </div>
          <div className="col-span-3">
            <MiniCard title="Advanced package" subtitle="2.5D/3D integration" />
          </div>
        </div>
      </div>
    );
  }

  if (diagramKey === "end-systems") {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Chips become systems
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-foreground">
          <Step label="AI server (CPU + GPU + HBM + networking)" />
          <Arrow />
          <Step label="Data center (power + cooling + networking)" />
        </div>
      </div>
    );
  }

  return null;
}

function Step({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <span className="font-medium">{label}</span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-muted-foreground">
      ↓
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2 py-1 text-[11px] font-medium">
      {children}
    </span>
  );
}

function MiniCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <p className="text-xs font-semibold text-foreground">{title}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function getExamples(
  node: GraphNodeDisplay,
): { technologies: string[]; companies: string[] } | null {
  const examples = node.metadata?.examples;
  if (!examples || typeof examples !== "object") {
    return null;
  }
  const tech = (examples as Record<string, unknown>).technologies;
  const cos = (examples as Record<string, unknown>).companies;
  return {
    technologies: Array.isArray(tech) ? (tech as string[]) : [],
    companies: Array.isArray(cos) ? (cos as string[]) : [],
  };
}

function EcosystemToolbar({
  selectedTypes,
  onTypesChange,
  onSearchSelect,
  selectedNodeId,
  onTrace,
  onResetView,
  activeScenarioId,
  onScenarioSelect,
  className,
}: {
  selectedTypes: DependencyNodeType[];
  onTypesChange: (types: DependencyNodeType[]) => void;
  onSearchSelect: (node: GraphNodeDisplay) => void;
  selectedNodeId: string | null;
  onTrace: (direction: TraceDirection) => void;
  onResetView: () => void;
  activeScenarioId: string | null;
  onScenarioSelect: (scenarioId: string | null) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GraphNodeDisplay[]>([]);
  const [open, setOpen] = useState(false);

  const ALL_TYPES: DependencyNodeType[] = [
    "PROCESS",
    "TECHNOLOGY",
    "COMPANY",
    "PRODUCT",
    "END_MARKET",
  ];

  const typeSet = new Set(selectedTypes);
  const allTypesSelected = selectedTypes.length === 0;

  function toggleType(type: DependencyNodeType) {
    if (allTypesSelected) {
      onTypesChange([type]);
      return;
    }
    const next = new Set(typeSet);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    const values = [...next] as DependencyNodeType[];
    onTypesChange(values.length === ALL_TYPES.length ? [] : values);
  }

  const handleSelect = useCallback(
    (node: GraphNodeDisplay) => {
      setQuery(node.label);
      setOpen(false);
      onSearchSelect(node);
    },
    [onSearchSelect],
  );

  const highlightShortcuts = [
    { id: "hbm", label: "HBM" },
    { id: "euv", label: "EUV" },
    { id: "cowos", label: "CoWoS" },
    { id: "nm-3", label: "3nm" },
  ] as const;

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    const next = searchNodes(value);
    setResults(next);
    setOpen(Boolean(value.trim()) && next.length > 0);
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-lg border border-border bg-card p-4">
        <label htmlFor="ecosystem-search" className="sr-only">
          Search concepts
        </label>
        <input
          id="ecosystem-search"
          type="search"
          placeholder="Search stages, terms, companies…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setOpen(true)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {open ? (
          <div className="mt-2 rounded-md border border-border bg-card">
            {results.length > 0 ? (
              <ul className="max-h-64 overflow-y-auto py-1">
                {results.map((node) => (
                  <li key={node.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(node)}
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-foreground">
                          {node.label}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {node.subtitle ? `${node.subtitle} · ` : ""}
                          {node.category ?? node.type}
                        </span>
                      </span>
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: node.color ?? "var(--muted)" }}
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No results.
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Layers</h2>
          <button
            type="button"
            onClick={() => onTypesChange([])}
            className="text-xs font-medium text-primary hover:underline"
          >
            {allTypesSelected ? "All layers" : "Show all"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((type) => {
            const isChecked = allTypesSelected || typeSet.has(type);
            return (
              <label
                key={type}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition",
                  isChecked
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggleType(type)}
                />
                {type.replace("_", " ")}
              </label>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Quick highlights</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Jump to a bottleneck term and trace its path across the map.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {highlightShortcuts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const node = findNodeBySlug(item.id);
                if (node) {
                  onSearchSelect(node);
                  onTrace("both");
                }
              }}
              className="rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {selectedNodeId ? (
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Trace
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onTrace("upstream")}
              className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              ↑ Upstream
            </button>
            <button
              type="button"
              onClick={() => onTrace("downstream")}
              className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              ↓ Downstream
            </button>
            <button
              type="button"
              onClick={() => onTrace("both")}
              className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              ↔ Both
            </button>
            <button
              type="button"
              onClick={onResetView}
              className="rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Reset view
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-1 text-sm font-semibold text-foreground">
          Guided paths
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Curated highlights for common bottlenecks.
        </p>
        <div className="flex flex-col gap-2">
          {scenarios.map((scenario) => {
            const active = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onScenarioSelect(active ? null : scenario.id)}
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-xs transition",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className="block font-medium">{scenario.name}</span>
                <span className="mt-0.5 block text-[11px] leading-snug opacity-80">
                  {scenario.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailPanel({
  node,
  edges,
  allEdges,
  onClose,
  onHighlight,
  className,
}: {
  node: GraphNodeDisplay | null;
  edges: GraphEdgeDisplay[];
  allEdges: GraphEdgeDisplay[];
  onClose: () => void;
  onHighlight: (nodeId: string) => void;
  className?: string;
}) {
  if (!node) {
    return (
      <aside
        className={cn(
          "flex h-full flex-col justify-center rounded-lg border border-dashed border-border bg-card/50 p-6 text-center",
          className,
        )}
      >
        <p className="text-sm font-medium text-foreground">
          Explore the ecosystem
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Click a stage or term to see a diagram, a concise explanation, and the
          upstream/downstream connections.
        </p>
      </aside>
    );
  }

  const edgeSource = allEdges.length > 0 ? allEdges : edges;
  const upstream = getUpstreamNodes(node.id);
  const downstream = getDownstreamNodes(node.id);
  const examples = getExamples(node);
  const diagramKey =
    typeof node.metadata?.diagramKey === "string" ? (node.metadata.diagramKey as string) : "";

  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-lg border border-border bg-card",
        className,
      )}
      aria-label={`Details for ${node.label}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {node.category ?? node.type}
          </p>
          <h2 className="truncate text-lg font-semibold text-foreground">
            {node.label}
          </h2>
          {node.subtitle ? (
            <p className="text-sm text-muted-foreground">{node.subtitle}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {diagramKey ? <Diagram diagramKey={diagramKey} /> : null}

        <div className="rounded-lg border border-border bg-muted/10 p-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {node.description ?? "No description available."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onHighlight(node.id)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              Highlight connections
            </button>
          </div>
        </div>

        {examples ? (
          <div className="grid gap-3">
            {examples.technologies.length > 0 ? (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Example technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {examples.technologies.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {examples.companies.length > 0 ? (
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Example companies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {examples.companies.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-xs text-foreground"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <NeighborList title="Upstream" nodes={upstream} edgeSource={edgeSource} />
        <NeighborList title="Downstream" nodes={downstream} edgeSource={edgeSource} />
      </div>
    </aside>
  );
}

function NeighborList({
  title,
  nodes,
  edgeSource,
}: {
  title: string;
  nodes: GraphNodeDisplay[];
  edgeSource: GraphEdgeDisplay[];
}) {
  if (nodes.length === 0) {
    return null;
  }
  const idSet = new Set(nodes.map((n) => n.id));
  const visible = nodes
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 14);

  const linkCount = edgeSource.filter(
    (e) => idSet.has(e.source) || idSet.has(e.target),
  ).length;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span className="text-[11px] text-muted-foreground">
          {nodes.length} nodes · {linkCount} links
        </span>
      </div>
      <ul className="space-y-1">
        {visible.map((neighbor) => (
          <li
            key={neighbor.id}
            className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs"
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: neighbor.color ?? "var(--muted)" }}
            />
            <span className="truncate font-medium text-foreground">
              {neighbor.label}
            </span>
            {neighbor.subtitle ? (
              <span className="truncate text-[11px] text-muted-foreground">
                {neighbor.subtitle}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SemiconductorEcosystemPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Loading ecosystem map…
        </div>
      }
    >
      <SemiconductorEcosystemPageInner />
    </Suspense>
  );
}

function SemiconductorEcosystemPageInner() {
  const { state, setFocus } = useGraphUrlState();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<DependencyNodeType[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [traceMode, setTraceMode] = useState<TraceDirection | null>(null);

  const basePayload = useMemo(() => {
    if (activeScenarioId) {
      const { nodes, edges } = applyScenario(activeScenarioId);
      return { nodes, edges };
    }
    return getFullGraph();
  }, [activeScenarioId]);

  const filteredPayload = useMemo(() => {
    let payload: GraphPayload = basePayload;

    if (traceMode && selectedNodeId) {
      payload = traceSubgraph(selectedNodeId, traceMode, 4);
    } else if (state.focus) {
      const focusNode = findNodeBySlug(state.focus);
      if (focusNode) {
        payload = traceSubgraph(focusNode.id, "both", 2);
      }
    }

    if (selectedTypes.length > 0) {
      payload = filterByNodeTypes(payload, selectedTypes);
    }

    return payload;
  }, [basePayload, traceMode, selectedNodeId, state.focus, selectedTypes]);

  const config = useMemo(() => buildConfig(filteredPayload), [filteredPayload]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) {
      return null;
    }
    return (
      filteredPayload.nodes.find((node) => node.id === selectedNodeId) ??
      basePayload.nodes.find((node) => node.id === selectedNodeId) ??
      null
    );
  }, [filteredPayload.nodes, basePayload.nodes, selectedNodeId]);

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      setSelectedNodeId(nodeId);
      setTraceMode(null);

      if (!nodeId) {
        setFocus(undefined);
        return;
      }

      const node =
        basePayload.nodes.find((item) => item.id === nodeId) ??
        getFullGraph().nodes.find((item) => item.id === nodeId);
      if (node?.slug) {
        setFocus(node.slug);
      }
    },
    [basePayload.nodes, setFocus],
  );

  const handleSearchSelect = useCallback(
    (node: GraphNodeDisplay) => {
      setActiveScenarioId(null);
      setTraceMode(null);
      setSelectedNodeId(node.id);
      setFocus(node.slug);
    },
    [setFocus],
  );

  const handleTrace = useCallback((direction: TraceDirection) => {
    setTraceMode(direction);
  }, []);

  const handleResetView = useCallback(() => {
    setTraceMode(null);
    setSelectedNodeId(null);
    setActiveScenarioId(null);
    setFocus(undefined);
  }, [setFocus]);

  const handleScenarioSelect = useCallback(
    (scenarioId: string | null) => {
      setActiveScenarioId(scenarioId);
      setTraceMode(null);

      if (scenarioId) {
        const { scenario } = applyScenario(scenarioId);
        setSelectedNodeId(scenario.focusNode);
        const node = findNodeBySlug(scenario.focusNode);
        if (node) {
          setFocus(node.slug);
        }
      } else {
        setSelectedNodeId(null);
        setFocus(undefined);
      }
    },
    [setFocus],
  );

  const activeScenario = activeScenarioId
    ? scenarios.find((s) => s.id === activeScenarioId)
    : null;

  const highlightConnections = useCallback(
    (nodeId: string) => {
      setActiveScenarioId(null);
      setSelectedNodeId(nodeId);
      setTraceMode("both");
    },
    [],
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 lg:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Semiconductor Fundamentals — Ecosystem Map
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          A zoomable map of how chips are physically created and how the supply
          chain connects. Click a stage to expand it, click terms to see concise
          definitions, and highlight bottlenecks like HBM or EUV across the full
          journey.
        </p>
        {activeScenario ? (
          <p className="text-xs font-medium text-primary">
            Guided path: {activeScenario.name}
          </p>
        ) : null}
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-h-0 flex-col gap-3">
          <VizContainer
            className="min-h-0 flex-1 order-2 lg:order-1"
            minHeight={520}
            ariaLabel="Semiconductor ecosystem map"
          >
            {(dimensions) =>
              dimensions.width > 0 ? (
                <EcosystemGraph
                  config={config}
                  selectedNodeId={selectedNodeId}
                  onNodeSelect={handleNodeSelect}
                  className="h-full"
                />
              ) : null
            }
          </VizContainer>
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <EcosystemToolbar
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
            onSearchSelect={handleSearchSelect}
            selectedNodeId={selectedNodeId}
            onTrace={handleTrace}
            onResetView={handleResetView}
            activeScenarioId={activeScenarioId}
            onScenarioSelect={handleScenarioSelect}
          />

          <DetailPanel
            node={selectedNode}
            edges={filteredPayload.edges}
            allEdges={basePayload.edges}
            onClose={() => handleNodeSelect(null)}
            onHighlight={highlightConnections}
            className="min-h-[240px]"
          />
        </div>
      </div>
    </div>
  );
}

