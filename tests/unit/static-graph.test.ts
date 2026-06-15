import { describe, expect, it } from "vitest";

import {
  applyScenario,
  findNodeBySlug,
  getFullGraph,
  searchNodes,
  traceSubgraph,
} from "@/lib/graph/static-graph";

describe("static-graph", () => {
  it("loads the full knowledge graph", () => {
    const graph = getFullGraph();
    expect(graph.nodes.length).toBeGreaterThanOrEqual(10);
    expect(graph.edges.length).toBeGreaterThanOrEqual(10);
  });

  it("finds nodes by slug", () => {
    const nvidia = findNodeBySlug("nvidia");
    expect(nvidia?.label).toBe("NVIDIA");
    expect(nvidia?.type).toBe("COMPANY");
  });

  it("searches nodes by label", () => {
    const results = searchNodes("hbm");
    expect(results.some((node) => node.id === "hbm3e")).toBe(true);
  });

  it("traces upstream from NVIDIA", () => {
    const subgraph = traceSubgraph("nvidia", "upstream", 2);
    const ids = new Set(subgraph.nodes.map((node) => node.id));
    expect(ids.has("tsmc")).toBe(true);
    expect(ids.has("sk-hynix")).toBe(true);
  });

  it("traces downstream from HBM3E", () => {
    const subgraph = traceSubgraph("hbm3e", "downstream", 2);
    const ids = new Set(subgraph.nodes.map((node) => node.id));
    expect(ids.has("memory-fabrication")).toBe(true);
  });

  it("applies HBM shortage scenario", () => {
    const { nodes, scenario } = applyScenario("hbm-shortage");
    expect(scenario.name).toBe("HBM Shortage");
    expect(nodes.some((node) => node.id === "hbm3e")).toBe(true);
    expect(nodes.some((node) => node.id === "sk-hynix")).toBe(true);
  });
});
