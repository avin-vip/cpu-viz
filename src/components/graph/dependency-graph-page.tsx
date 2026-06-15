"use client";

import { Suspense, useCallback, useMemo, useState } from "react";

import { DependencyGraphLegend } from "@/components/graph/dependency-graph-legend";
import { DependencyGraphToolbar } from "@/components/graph/dependency-graph-toolbar";
import { GraphDetailPanel } from "@/components/graph/graph-detail-panel";
import { SupplyChainGraph } from "@/components/visualizations/viz-registry";
import { VizContainer } from "@/components/visualizations/viz-container";
import { useGraphUrlState } from "@/hooks/use-graph-url-state";
import {
  applyScenario,
  filterByNodeTypes,
  findNodeBySlug,
  getFullGraph,
  getScenarios,
  traceSubgraph,
} from "@/lib/graph/static-graph";
import { toReactFlow } from "@/lib/visualizations/to-react-flow";
import type { DependencyNodeType, TraceDirection } from "@/types/dependency-graph";
import type { GraphPayload } from "@/types/graph";
import type { ReactFlowVizConfig } from "@/types/visualization";

const LAYOUT_OPTIONS = {
  rankdir: "LR" as const,
  nodesep: 80,
  ranksep: 140,
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

export function DependencyGraphPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Loading dependency graph…
        </div>
      }
    >
      <DependencyGraphPageInner />
    </Suspense>
  );
}

function DependencyGraphPageInner() {
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
    let payload = basePayload;

    if (traceMode && selectedNodeId) {
      payload = traceSubgraph(selectedNodeId, traceMode, 3);
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

  const config = useMemo(
    () => buildConfig(filteredPayload),
    [filteredPayload],
  );

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
    (node: { id: string; slug: string }) => {
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

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 lg:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Semiconductor Dependency Explorer
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Map how companies, technologies, products, manufacturing processes,
          and end markets connect across the AI semiconductor supply chain.
          Search nodes, trace upstream and downstream dependencies, and run
          scenario simulations.
        </p>
        {activeScenario ? (
          <p className="text-xs font-medium text-primary">
            Active scenario: {activeScenario.name}
          </p>
        ) : null}
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 flex-col gap-3">
          <VizContainer
            className="min-h-0 flex-1 order-2 lg:order-1"
            minHeight={480}
            ariaLabel="Semiconductor dependency graph"
          >
            {(dimensions) =>
              dimensions.width > 0 ? (
                <SupplyChainGraph
                  config={config}
                  selectedNodeId={selectedNodeId}
                  onNodeSelect={handleNodeSelect}
                  className="h-full"
                />
              ) : null
            }
          </VizContainer>

          <DependencyGraphLegend className="order-3 lg:hidden" />
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <DependencyGraphToolbar
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
            selectedNodeId={selectedNodeId}
            onSearchSelect={handleSearchSelect}
            onTrace={handleTrace}
            onResetView={handleResetView}
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onScenarioSelect={handleScenarioSelect}
          />

          <GraphDetailPanel
            node={selectedNode}
            edges={filteredPayload.edges}
            allEdges={basePayload.edges}
            onClose={() => handleNodeSelect(null)}
            className="min-h-[240px]"
          />

          <DependencyGraphLegend className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}
