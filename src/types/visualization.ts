import type { VizRenderer } from "@prisma/client";
import type { Edge, Node } from "@xyflow/react";

export type { VizRenderer };

export interface PipelineStage {
  id: string;
  label: string;
  shortLabel?: string;
  description?: string;
  order: number;
}

export interface ReactFlowNodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  category?: string;
  color?: string;
  href?: string;
}

export interface ReactFlowEdgeData extends Record<string, unknown> {
  label?: string;
  strength: number;
  edgeType: string;
}

export type ReactFlowNode = Node<ReactFlowNodeData>;
export type ReactFlowEdge = Edge<ReactFlowEdgeData>;

export type LayoutAlgorithm = "dagre" | "manual" | "force";

export interface ReactFlowLayoutOptions {
  rankdir?: "TB" | "BT" | "LR" | "RL";
  nodesep?: number;
  ranksep?: number;
  marginx?: number;
  marginy?: number;
}

export interface ReactFlowInteractionOptions {
  panOnScroll?: boolean;
  fitViewOnLoad?: boolean;
  nodesDraggable?: boolean;
  zoomOnScroll?: boolean;
}

export interface ReactFlowVizConfig {
  renderer: "REACT_FLOW";
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  layout: LayoutAlgorithm;
  layoutOptions?: ReactFlowLayoutOptions;
  interaction?: ReactFlowInteractionOptions;
}

export interface D3VizConfig {
  renderer: "D3";
  chartType: "treemap" | "layered" | "bar" | "sunburst" | "line";
  data: Record<string, unknown>;
  dimensions?: {
    width?: number | string;
    height?: number | string;
  };
  scales?: Record<string, string>;
  interaction?: {
    tooltip?: boolean;
    clickToDrill?: boolean;
  };
}

export interface CompositeVizConfig {
  renderer: "COMPOSITE";
  children: VizConfig[];
  layout?: "stack" | "tabs" | "grid";
}

export type VizConfig = ReactFlowVizConfig | D3VizConfig | CompositeVizConfig;

export function isReactFlowVizConfig(
  config: VizConfig,
): config is ReactFlowVizConfig {
  return config.renderer === "REACT_FLOW";
}

export function isD3VizConfig(config: VizConfig): config is D3VizConfig {
  return config.renderer === "D3";
}
