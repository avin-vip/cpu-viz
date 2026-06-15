import dagre from "dagre";

import type {
  ReactFlowEdge,
  ReactFlowLayoutOptions,
  ReactFlowNode,
} from "@/types/visualization";

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 60;

export interface DagreLayoutInput {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  options?: ReactFlowLayoutOptions;
}

export function applyDagreLayout({
  nodes,
  edges,
  options = {},
}: DagreLayoutInput): ReactFlowNode[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: options.rankdir ?? "TB",
    nodesep: options.nodesep ?? 50,
    ranksep: options.ranksep ?? 80,
    marginx: options.marginx ?? 20,
    marginy: options.marginy ?? 20,
  });

  for (const node of nodes) {
    graph.setNode(node.id, {
      width: node.width ?? DEFAULT_NODE_WIDTH,
      height: node.height ?? DEFAULT_NODE_HEIGHT,
    });
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  return nodes.map((node) => {
    const layoutNode = graph.node(node.id);
    const width = node.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? DEFAULT_NODE_HEIGHT;

    return {
      ...node,
      position: {
        x: layoutNode.x - width / 2,
        y: layoutNode.y - height / 2,
      },
    };
  });
}
