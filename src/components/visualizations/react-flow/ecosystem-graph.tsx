"use client";

import { useCallback, useMemo } from "react";
import {
  Background,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type OnSelectionChangeParams,
} from "@xyflow/react";

import { VizControls } from "@/components/visualizations/shared/viz-controls";
import { DependencyEdge } from "@/components/visualizations/react-flow/edges/dependency-edge";
import { useFitView } from "@/components/visualizations/react-flow/hooks/use-fit-view";
import { CompanyNode } from "@/components/visualizations/react-flow/nodes/company-node";
import { PipelineStageNode } from "@/components/visualizations/react-flow/nodes/pipeline-stage-node";
import type { ReactFlowVizConfig } from "@/types/visualization";

const nodeTypes = {
  company: CompanyNode,
  pipelineStage: PipelineStageNode,
};

const edgeTypes = {
  supplyChain: DependencyEdge,
};

interface EcosystemGraphProps {
  config: ReactFlowVizConfig;
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  className?: string;
}

function EcosystemGraphInner({
  config,
  selectedNodeId,
  onNodeSelect,
  className,
}: EcosystemGraphProps) {
  const nodes = useMemo(() => {
    return config.nodes.map((node) => ({
      ...node,
      type: node.type ?? "company",
      selected: node.id === selectedNodeId,
    })) as Node[];
  }, [config.nodes, selectedNodeId]);

  const edges = useMemo(() => {
    return config.edges.map((edge) => ({
      ...edge,
      type: edge.type ?? "supplyChain",
      selected:
        edge.source === selectedNodeId || edge.target === selectedNodeId,
    }));
  }, [config.edges, selectedNodeId]);

  const fitViewOnLoad = config.interaction?.fitViewOnLoad ?? true;
  useFitView({
    enabled: fitViewOnLoad,
    deps: [nodes.length],
  });

  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      const nextId = selectedNodes[0]?.id ?? null;
      onNodeSelect?.(nextId);
    },
    [onNodeSelect],
  );

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node.id);
    },
    [onNodeSelect],
  );

  const handlePaneClick = useCallback(() => {
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={config.interaction?.nodesDraggable ?? false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll={config.interaction?.panOnScroll ?? true}
        zoomOnScroll={config.interaction?.zoomOnScroll ?? true}
        fitView={false}
        minZoom={0.15}
        maxZoom={2}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onSelectionChange={handleSelectionChange}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} size={1} color="var(--border)" />
        <MiniMap
          className="!bg-card !border-border"
          nodeColor={(node) => (node.data?.color as string) ?? "var(--muted)"}
          maskColor="color-mix(in srgb, var(--background) 65%, transparent)"
        />
        <VizControls className="absolute right-3 top-3 z-10" />
      </ReactFlow>
    </div>
  );
}

export function EcosystemGraph(props: EcosystemGraphProps) {
  return (
    <ReactFlowProvider>
      <EcosystemGraphInner {...props} />
    </ReactFlowProvider>
  );
}

