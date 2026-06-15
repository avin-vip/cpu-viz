import type { CompanyCategory, GraphEdge, NodeType } from "@prisma/client";

import { prisma } from "@/lib/prisma/client";
import { resolveNodes } from "@/lib/graph/node-resolver";
import type {
  GraphEdgeDisplay,
  GraphPayload,
  NodeRef,
  SupplyChainFilters,
} from "@/types/graph";
import {
  DEFAULT_SUPPLY_CHAIN_DEPTH as DEFAULT_DEPTH,
  SUPPLY_CHAIN_EDGE_TYPES as DEFAULT_EDGE_TYPES,
} from "@/types/graph";

interface BfsState {
  nodeIds: Set<string>;
  edges: GraphEdge[];
}

function edgeKey(edge: GraphEdge): string {
  return edge.id;
}

export function getNeighborId(edge: GraphEdge, currentId: string): string | null {
  if (edge.sourceType === "COMPANY" && edge.sourceId === currentId) {
    return edge.targetType === "COMPANY" ? edge.targetId : null;
  }
  if (edge.targetType === "COMPANY" && edge.targetId === currentId) {
    return edge.sourceType === "COMPANY" ? edge.sourceId : null;
  }
  return null;
}

async function fetchEdgesForNodes(
  nodeIds: string[],
  edgeTypes: typeof DEFAULT_EDGE_TYPES,
): Promise<GraphEdge[]> {
  if (nodeIds.length === 0) {
    return [];
  }

  return prisma.graphEdge.findMany({
    where: {
      type: { in: edgeTypes },
      OR: [
        {
          sourceType: "COMPANY",
          sourceId: { in: nodeIds },
          targetType: "COMPANY",
        },
        {
          targetType: "COMPANY",
          targetId: { in: nodeIds },
          sourceType: "COMPANY",
        },
      ],
    },
  });
}

async function bfsFromNode(
  startId: string,
  depth: number,
  edgeTypes: typeof DEFAULT_EDGE_TYPES,
  categories?: CompanyCategory[],
): Promise<BfsState> {
  const nodeIds = new Set<string>([startId]);
  const collectedEdges = new Map<string, GraphEdge>();
  let frontier = new Set<string>([startId]);

  for (let hop = 0; hop < depth; hop++) {
    const frontierIds = [...frontier];
    if (frontierIds.length === 0) {
      break;
    }

    const edges = await fetchEdgesForNodes(frontierIds, edgeTypes);
    const nextFrontier = new Set<string>();

    for (const edge of edges) {
      collectedEdges.set(edgeKey(edge), edge);

      for (const currentId of frontierIds) {
        const neighborId = getNeighborId(edge, currentId);
        if (neighborId && !nodeIds.has(neighborId)) {
          nextFrontier.add(neighborId);
        }
      }
    }

    for (const id of nextFrontier) {
      nodeIds.add(id);
    }

    frontier = nextFrontier;
  }

  if (categories && categories.length > 0) {
    const companies = await prisma.company.findMany({
      where: { id: { in: [...nodeIds] }, category: { in: categories } },
      select: { id: true },
    });
    const allowedIds = new Set(companies.map((company) => company.id));
    allowedIds.add(startId);

    const filteredNodeIds = new Set(
      [...nodeIds].filter((id) => allowedIds.has(id)),
    );

    const filteredEdges = [...collectedEdges.values()].filter(
      (edge) =>
        filteredNodeIds.has(edge.sourceId) &&
        filteredNodeIds.has(edge.targetId),
    );

    return { nodeIds: filteredNodeIds, edges: filteredEdges };
  }

  return { nodeIds, edges: [...collectedEdges.values()] };
}

async function getTopConnectedNodes(
  limit: number,
  edgeTypes: typeof DEFAULT_EDGE_TYPES,
  categories?: CompanyCategory[],
): Promise<BfsState> {
  const edges = await prisma.graphEdge.findMany({
    where: {
      type: { in: edgeTypes },
      sourceType: "COMPANY",
      targetType: "COMPANY",
    },
    select: { sourceId: true, targetId: true },
  });

  const connectionCounts = new Map<string, number>();

  for (const edge of edges) {
    connectionCounts.set(
      edge.sourceId,
      (connectionCounts.get(edge.sourceId) ?? 0) + 1,
    );
    connectionCounts.set(
      edge.targetId,
      (connectionCounts.get(edge.targetId) ?? 0) + 1,
    );
  }

  let rankedIds = [...connectionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  if (categories && categories.length > 0) {
    const companies = await prisma.company.findMany({
      where: { id: { in: rankedIds }, category: { in: categories } },
      select: { id: true },
    });
    const allowed = new Set(companies.map((company) => company.id));
    rankedIds = rankedIds.filter((id) => allowed.has(id));
  }

  const seedIds = rankedIds.slice(0, limit);
  const nodeIds = new Set(seedIds);

  const allEdges = await fetchEdgesForNodes(seedIds, edgeTypes);
  const relevantEdges = allEdges.filter(
    (edge) => nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId),
  );

  return { nodeIds, edges: relevantEdges };
}

export function toEdgeDisplay(edge: GraphEdge): GraphEdgeDisplay {
  return {
    id: edge.id,
    type: edge.type,
    source: edge.sourceId,
    target: edge.targetId,
    label: edge.label ?? undefined,
    strength: edge.strength,
    metadata: edge.metadata
      ? (edge.metadata as Record<string, unknown>)
      : undefined,
  };
}

export async function getSupplyChainSubgraph(
  filters: SupplyChainFilters = {},
): Promise<GraphPayload> {
  const depth = filters.depth ?? DEFAULT_DEPTH;
  const edgeTypes = filters.edgeTypes ?? DEFAULT_EDGE_TYPES;
  const categories = filters.categories;

  let state: BfsState;

  if (filters.focus) {
    const focusCompany = await prisma.company.findUnique({
      where: { slug: filters.focus },
      select: { id: true },
    });

    if (!focusCompany) {
      return { nodes: [], edges: [] };
    }

    state = await bfsFromNode(
      focusCompany.id,
      depth,
      edgeTypes,
      categories,
    );
  } else {
    state = await getTopConnectedNodes(15, edgeTypes, categories);
  }

  const nodeRefs: NodeRef[] = [...state.nodeIds].map((id) => ({
    type: "COMPANY" as NodeType,
    id,
  }));

  const nodes = await resolveNodes(nodeRefs);
  const edges = state.edges.map(toEdgeDisplay);

  return { nodes, edges };
}
