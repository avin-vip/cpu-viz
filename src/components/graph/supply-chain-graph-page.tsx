"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { GraphDetailPanel } from "@/components/graph/graph-detail-panel";
import { GraphLegend } from "@/components/graph/graph-legend";
import { GraphToolbar } from "@/components/graph/graph-toolbar";
import { SupplyChainGraph } from "@/components/visualizations/viz-registry";
import { VizContainer } from "@/components/visualizations/viz-container";
import { useGraphUrlState } from "@/hooks/use-graph-url-state";
import type { GraphPayload } from "@/types/graph";
import type { ReactFlowVizConfig } from "@/types/visualization";

interface SupplyChainGraphPageProps {
  initialPayload: GraphPayload;
  initialConfig: ReactFlowVizConfig;
}

export function SupplyChainGraphPage(props: SupplyChainGraphPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Loading supply chain graph…
        </div>
      }
    >
      <SupplyChainGraphPageInner {...props} />
    </Suspense>
  );
}

function SupplyChainGraphPageInner({
  initialPayload,
  initialConfig,
}: SupplyChainGraphPageProps) {
  const { state, setCategories, setFocus } = useGraphUrlState();
  const [payload, setPayload] = useState(initialPayload);
  const [config, setConfig] = useState(initialConfig);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    setPayload(initialPayload);
    setConfig(initialConfig);
  }, [initialPayload, initialConfig]);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) {
      return null;
    }
    return payload.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [payload.nodes, selectedNodeId]);

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      setSelectedNodeId(nodeId);

      if (!nodeId) {
        return;
      }

      const node = payload.nodes.find((item) => item.id === nodeId);
      if (node?.slug) {
        setFocus(node.slug);
      }
    },
    [payload.nodes, setFocus],
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 lg:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Semiconductor Supply Chain
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Explore how foundries, fabless designers, equipment makers, and EDA
          vendors connect across the industry. Pan and zoom the graph; click a
          company to inspect relationships.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-h-0 flex-col gap-3">
          <GraphToolbar
            selectedCategories={state.categories}
            onCategoriesChange={setCategories}
          />

          <VizContainer
            className="min-h-0 flex-1"
            minHeight={480}
            ariaLabel="Supply chain relationship graph"
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

          <GraphLegend className="lg:hidden" />
        </div>

        <div className="flex min-h-0 flex-col gap-3">
          <GraphDetailPanel
            node={selectedNode}
            edges={payload.edges}
            onClose={() => handleNodeSelect(null)}
            className="min-h-[280px] flex-1"
          />
          <GraphLegend className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}
