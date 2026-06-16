import graphData from "@/data/semiconductor-ecosystem.json";
import type {
  DependencyNodeType,
  KnowledgeGraphData,
  ScenarioDefinition,
  TraceDirection,
} from "@/types/dependency-graph";
import type { GraphEdgeDisplay, GraphNodeDisplay, GraphPayload } from "@/types/graph";

const graph = graphData as KnowledgeGraphData;

export function getEcosystemGraph(): KnowledgeGraphData {
  return graph;
}

export function getAllNodes(): GraphNodeDisplay[] {
  return graph.nodes;
}

export function getAllEdges(): GraphEdgeDisplay[] {
  return graph.edges;
}

export function getScenarios(): ScenarioDefinition[] {
  return graph.scenarios;
}

export function findNodeBySlug(slug: string): GraphNodeDisplay | undefined {
  return graph.nodes.find((node) => node.slug === slug || node.id === slug);
}

export function findNodeById(id: string): GraphNodeDisplay | undefined {
  return graph.nodes.find((node) => node.id === id);
}

export function searchNodes(query: string, limit = 12): GraphNodeDisplay[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  return graph.nodes
    .filter(
      (node) =>
        node.label.toLowerCase().includes(q) ||
        node.slug.toLowerCase().includes(q) ||
        node.subtitle?.toLowerCase().includes(q) ||
        node.category?.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

function collectTrace(
  startId: string,
  direction: TraceDirection,
  depth: number,
): { nodeIds: Set<string>; edges: GraphEdgeDisplay[] } {
  const nodeIds = new Set<string>([startId]);
  const collectedEdges: GraphEdgeDisplay[] = [];
  const edgeKeys = new Set<string>();
  let frontier = new Set<string>([startId]);

  for (let hop = 0; hop < depth; hop++) {
    const nextFrontier = new Set<string>();

    for (const edge of graph.edges) {
      if (direction === "upstream" || direction === "both") {
        for (const nodeId of frontier) {
          if (edge.target === nodeId && !nodeIds.has(edge.source)) {
            nodeIds.add(edge.source);
            nextFrontier.add(edge.source);
          }
          if (edge.target === nodeId && !edgeKeys.has(edge.id)) {
            collectedEdges.push(edge);
            edgeKeys.add(edge.id);
          }
        }
      }

      if (direction === "downstream" || direction === "both") {
        for (const nodeId of frontier) {
          if (edge.source === nodeId && !nodeIds.has(edge.target)) {
            nodeIds.add(edge.target);
            nextFrontier.add(edge.target);
          }
          if (edge.source === nodeId && !edgeKeys.has(edge.id)) {
            collectedEdges.push(edge);
            edgeKeys.add(edge.id);
          }
        }
      }
    }

    frontier = nextFrontier;
    if (frontier.size === 0) {
      break;
    }
  }

  return { nodeIds, edges: collectedEdges };
}

export function traceSubgraph(
  startId: string,
  direction: TraceDirection,
  depth = 3,
): GraphPayload {
  const { nodeIds, edges } = collectTrace(startId, direction, depth);
  const nodes = graph.nodes.filter((node) => nodeIds.has(node.id));
  const edgeSet = new Set(edges.map((e) => e.id));
  const connectingEdges = graph.edges.filter(
    (edge) =>
      edgeSet.has(edge.id) ||
      (nodeIds.has(edge.source) && nodeIds.has(edge.target)),
  );

  return {
    nodes,
    edges: [...new Map(connectingEdges.map((e) => [e.id, e])).values()],
  };
}

export function filterByNodeTypes(
  payload: GraphPayload,
  types: DependencyNodeType[],
): GraphPayload {
  if (types.length === 0) {
    return payload;
  }

  const typeSet = new Set(types);
  const nodes = payload.nodes.filter((node) =>
    typeSet.has(node.type as DependencyNodeType),
  );
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = payload.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );

  return { nodes, edges };
}

export function applyScenario(scenarioId: string): GraphPayload & {
  scenario: ScenarioDefinition;
} {
  const scenario = graph.scenarios.find((s) => s.id === scenarioId);
  if (!scenario) {
    return { nodes: graph.nodes, edges: graph.edges, scenario: graph.scenarios[0]! };
  }

  const highlightSet = new Set(scenario.highlightNodes);
  const nodes = graph.nodes.filter((node) => highlightSet.has(node.id));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );

  return { nodes, edges, scenario };
}

export function getUpstreamNodes(nodeId: string): GraphNodeDisplay[] {
  const sourceIds = new Set(
    graph.edges.filter((e) => e.target === nodeId).map((e) => e.source),
  );
  return graph.nodes.filter((n) => sourceIds.has(n.id));
}

export function getDownstreamNodes(nodeId: string): GraphNodeDisplay[] {
  const targetIds = new Set(
    graph.edges.filter((e) => e.source === nodeId).map((e) => e.target),
  );
  return graph.nodes.filter((n) => targetIds.has(n.id));
}

export function getFullGraph(): GraphPayload {
  return { nodes: graph.nodes, edges: graph.edges };
}

