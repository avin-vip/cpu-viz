import { applyDagreLayout } from "@/lib/visualizations/layout-algorithms";
import type {
  GraphEdgeDisplay,
  GraphNodeDisplay,
} from "@/types/graph";
import type {
  ReactFlowEdge,
  ReactFlowEdgeData,
  ReactFlowInteractionOptions,
  ReactFlowLayoutOptions,
  ReactFlowNode,
  ReactFlowNodeData,
  ReactFlowVizConfig,
} from "@/types/visualization";

const STRENGTH_STROKE_WIDTH: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2.5,
  5: 3,
};

function strengthToStrokeWidth(strength: number): number {
  return STRENGTH_STROKE_WIDTH[strength] ?? 2;
}

function toReactFlowNode(node: GraphNodeDisplay): ReactFlowNode {
  const data: ReactFlowNodeData = {
    label: node.label,
    subtitle: node.subtitle,
    category: node.category,
    color: node.color,
    href: node.href,
  };

  return {
    id: node.id,
    type: "company",
    position: { x: 0, y: 0 },
    data,
  };
}

function toReactFlowEdge(edge: GraphEdgeDisplay): ReactFlowEdge {
  const data: ReactFlowEdgeData = {
    label: edge.label,
    strength: edge.strength,
    edgeType: edge.type,
  };

  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "supplyChain",
    data,
    style: {
      strokeWidth: strengthToStrokeWidth(edge.strength),
    },
  };
}

export interface ToReactFlowOptions {
  layout?: "dagre" | "manual";
  layoutOptions?: ReactFlowLayoutOptions;
  interaction?: ReactFlowInteractionOptions;
}

export function toReactFlow(
  nodes: GraphNodeDisplay[],
  edges: GraphEdgeDisplay[],
  options: ToReactFlowOptions = {},
): ReactFlowVizConfig {
  const layout = options.layout ?? "dagre";
  let reactFlowNodes = nodes.map(toReactFlowNode);
  const reactFlowEdges = edges.map(toReactFlowEdge);

  if (layout === "dagre" && reactFlowNodes.length > 0) {
    reactFlowNodes = applyDagreLayout({
      nodes: reactFlowNodes,
      edges: reactFlowEdges,
      options: options.layoutOptions,
    });
  }

  return {
    renderer: "REACT_FLOW",
    nodes: reactFlowNodes,
    edges: reactFlowEdges,
    layout,
    layoutOptions: options.layoutOptions,
    interaction: {
      panOnScroll: true,
      fitViewOnLoad: true,
      nodesDraggable: false,
      zoomOnScroll: true,
      ...options.interaction,
    },
  };
}
