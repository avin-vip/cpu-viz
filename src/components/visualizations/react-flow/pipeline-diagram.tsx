"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
} from "@xyflow/react";

import { VizControls } from "@/components/visualizations/shared/viz-controls";
import { DependencyEdge } from "@/components/visualizations/react-flow/edges/dependency-edge";
import { useFitView } from "@/components/visualizations/react-flow/hooks/use-fit-view";
import { PipelineStageNode } from "@/components/visualizations/react-flow/nodes/pipeline-stage-node";
import type { ReactFlowVizConfig } from "@/types/visualization";

const nodeTypes = {
  pipelineStage: PipelineStageNode,
};

const edgeTypes = {
  supplyChain: DependencyEdge,
};

interface PipelineDiagramProps {
  config: ReactFlowVizConfig;
  activeStep: number;
  className?: string;
}

function PipelineDiagramInner({
  config,
  activeStep,
  className,
}: PipelineDiagramProps) {
  const stageCount = config.nodes.length;
  const clampedStep = Math.max(0, Math.min(activeStep, stageCount - 1));

  const sortedNodes = useMemo(() => {
    return [...config.nodes].sort((a, b) => {
      const stageA = (a.data as { stage?: number }).stage ?? 0;
      const stageB = (b.data as { stage?: number }).stage ?? 0;
      return stageA - stageB;
    });
  }, [config.nodes]);

  const nodes = useMemo(() => {
    return sortedNodes.map((node, index) => ({
      ...node,
      type: node.type ?? "pipelineStage",
      data: {
        ...node.data,
        isActive: index === clampedStep,
      },
    })) as Node[];
  }, [sortedNodes, clampedStep]);

  const edges = useMemo(
    () =>
      config.edges.map((edge) => ({
        ...edge,
        type: edge.type ?? "default",
        animated: indexIsActiveOrBefore(edge, nodes, clampedStep),
      })) as Edge[],
    [config.edges, nodes, clampedStep],
  );

  const fitViewOnLoad = config.interaction?.fitViewOnLoad ?? true;
  useFitView({
    enabled: fitViewOnLoad,
    deps: [nodes.length, clampedStep],
  });

  return (
    <div className={className} style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={config.interaction?.nodesDraggable ?? false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={config.interaction?.panOnScroll ?? true}
        zoomOnScroll={config.interaction?.zoomOnScroll ?? true}
        fitView={false}
        minZoom={0.4}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="var(--border)" />
        <Controls showInteractive={false} className="!bg-card !border-border" />
        <VizControls className="absolute right-3 top-3 z-10" />
      </ReactFlow>
    </div>
  );
}

function indexIsActiveOrBefore(
  edge: { source: string; target: string },
  nodes: Node[],
  activeIndex: number,
): boolean {
  const sourceIndex = nodes.findIndex((node) => node.id === edge.source);
  const targetIndex = nodes.findIndex((node) => node.id === edge.target);
  return sourceIndex <= activeIndex && targetIndex <= activeIndex;
}

export function PipelineDiagram(props: PipelineDiagramProps) {
  return (
    <ReactFlowProvider>
      <PipelineDiagramInner {...props} />
    </ReactFlowProvider>
  );
}
