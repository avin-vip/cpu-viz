import { describe, expect, it } from "vitest";

import { toReactFlow } from "@/lib/visualizations/to-react-flow";
import type { GraphEdgeDisplay, GraphNodeDisplay } from "@/types/graph";

function makeNode(id: string, label: string): GraphNodeDisplay {
  return {
    id,
    type: "COMPANY",
    slug: id,
    label,
    href: `/companies/${id}`,
  };
}

function makeEdge(
  id: string,
  source: string,
  target: string,
  strength: number,
): GraphEdgeDisplay {
  return {
    id,
    type: "SUPPLIES",
    source,
    target,
    strength,
  };
}

describe("toReactFlow", () => {
  it("maps edge strength to stroke width", () => {
    const strengths = [1, 2, 3, 4, 5] as const;
    const expectedWidths = [1, 1.5, 2, 2.5, 3];

    for (const [index, strength] of strengths.entries()) {
      const result = toReactFlow(
        [],
        [makeEdge(`e-${strength}`, "a", "b", strength)],
        { layout: "manual" },
      );

      expect(result.edges[0].style?.strokeWidth).toBe(expectedWidths[index]);
    }
  });

  it("defaults unknown strength to stroke width 2", () => {
    const result = toReactFlow(
      [],
      [makeEdge("e-unknown", "a", "b", 99)],
      { layout: "manual" },
    );

    expect(result.edges[0].style?.strokeWidth).toBe(2);
  });

  it("assigns dagre positions to connected nodes", () => {
    const nodes = [makeNode("a", "Alpha"), makeNode("b", "Beta")];
    const edges = [makeEdge("e1", "a", "b", 3)];

    const result = toReactFlow(nodes, edges, {
      layout: "dagre",
      layoutOptions: { rankdir: "LR" },
    });

    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].position).not.toEqual({ x: 0, y: 0 });
    expect(result.nodes[1].position).not.toEqual({ x: 0, y: 0 });
    expect(result.nodes[0].position.x).not.toBe(result.nodes[1].position.x);
  });

  it("keeps manual layout nodes at origin", () => {
    const nodes = [makeNode("a", "Alpha"), makeNode("b", "Beta")];
    const edges = [makeEdge("e1", "a", "b", 3)];

    const result = toReactFlow(nodes, edges, { layout: "manual" });

    for (const node of result.nodes) {
      expect(node.position).toEqual({ x: 0, y: 0 });
    }
  });

  it("returns empty graph config for no nodes", () => {
    const result = toReactFlow([], []);

    expect(result.renderer).toBe("REACT_FLOW");
    expect(result.nodes).toEqual([]);
    expect(result.edges).toEqual([]);
    expect(result.layout).toBe("dagre");
  });

  it("maps node display fields into React Flow node data", () => {
    const node: GraphNodeDisplay = {
      id: "co-1",
      type: "COMPANY",
      slug: "tsmc",
      label: "TSMC",
      subtitle: "TSM",
      category: "Foundry",
      color: "#06b6d4",
      href: "/companies/tsmc",
    };

    const result = toReactFlow([node], [], { layout: "manual" });

    expect(result.nodes[0]).toMatchObject({
      id: "co-1",
      type: "company",
      data: {
        label: "TSMC",
        subtitle: "TSM",
        category: "Foundry",
        color: "#06b6d4",
        href: "/companies/tsmc",
      },
    });
  });

  it("includes default interaction options", () => {
    const result = toReactFlow([makeNode("a", "Alpha")], [], {
      layout: "manual",
    });

    expect(result.interaction).toMatchObject({
      panOnScroll: true,
      fitViewOnLoad: true,
      nodesDraggable: false,
      zoomOnScroll: true,
    });
  });
});
