import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getNeighborId,
  getSupplyChainSubgraph,
  toEdgeDisplay,
} from "@/lib/graph/get-subgraph";
import type { GraphEdge } from "@prisma/client";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    company: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    graphEdge: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/graph/node-resolver", () => ({
  resolveNodes: vi.fn(async (refs: { id: string }[]) =>
    refs.map((ref) => ({
      id: ref.id,
      type: "COMPANY",
      slug: ref.id,
      label: ref.id,
      href: `/companies/${ref.id}`,
    })),
  ),
}));

function makeEdge(
  overrides: Partial<GraphEdge> & Pick<GraphEdge, "sourceId" | "targetId">,
): GraphEdge {
  return {
    id: overrides.id ?? "edge-1",
    type: overrides.type ?? "SUPPLIES",
    sourceType: overrides.sourceType ?? "COMPANY",
    sourceId: overrides.sourceId,
    targetType: overrides.targetType ?? "COMPANY",
    targetId: overrides.targetId,
    label: overrides.label ?? null,
    strength: overrides.strength ?? 3,
    metadata: overrides.metadata ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe("getNeighborId", () => {
  it("returns target when traversing outbound company edge", () => {
    const edge = makeEdge({ sourceId: "a", targetId: "b" });
    expect(getNeighborId(edge, "a")).toBe("b");
  });

  it("returns source when traversing inbound company edge", () => {
    const edge = makeEdge({ sourceId: "a", targetId: "b" });
    expect(getNeighborId(edge, "b")).toBe("a");
  });

  it("returns null for non-company endpoints", () => {
    const edge = makeEdge({
      sourceType: "CONCEPT",
      sourceId: "concept-1",
      targetId: "b",
    });
    expect(getNeighborId(edge, "concept-1")).toBeNull();
  });
});

describe("toEdgeDisplay", () => {
  it("maps prisma edge fields to display shape", () => {
    const edge = makeEdge({
      id: "edge-42",
      sourceId: "a",
      targetId: "b",
      label: "supplies",
      strength: 4,
      metadata: { volume: "high" },
    });

    expect(toEdgeDisplay(edge)).toEqual({
      id: "edge-42",
      type: "SUPPLIES",
      source: "a",
      target: "b",
      label: "supplies",
      strength: 4,
      metadata: { volume: "high" },
    });
  });

  it("omits label when null", () => {
    const edge = makeEdge({ sourceId: "a", targetId: "b", label: null });
    expect(toEdgeDisplay(edge).label).toBeUndefined();
  });
});

describe("getSupplyChainSubgraph", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns empty graph when focus company is missing", async () => {
    mockPrisma.company.findUnique.mockResolvedValue(null);

    const result = await getSupplyChainSubgraph({ focus: "missing" });

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it("returns resolved nodes and edges for a focused company", async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: "tsmc" });
    mockPrisma.graphEdge.findMany
      .mockResolvedValueOnce([
        makeEdge({ id: "e1", sourceId: "tsmc", targetId: "asml" }),
      ])
      .mockResolvedValueOnce([]);

    const result = await getSupplyChainSubgraph({
      focus: "tsmc",
      depth: 1,
    });

    expect(result.nodes).toHaveLength(2);
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0]).toMatchObject({
      source: "tsmc",
      target: "asml",
    });
  });

  it("seeds from top connected nodes when focus is omitted", async () => {
    mockPrisma.graphEdge.findMany
      .mockResolvedValueOnce([
        { sourceId: "a", targetId: "b" },
        { sourceId: "b", targetId: "c" },
        { sourceId: "a", targetId: "c" },
      ])
      .mockResolvedValueOnce([
        makeEdge({ id: "e1", sourceId: "a", targetId: "b" }),
        makeEdge({ id: "e2", sourceId: "b", targetId: "c" }),
      ]);

    const result = await getSupplyChainSubgraph();

    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.edges.length).toBeGreaterThan(0);
  });
});
