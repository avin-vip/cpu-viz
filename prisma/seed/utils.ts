import type { PrismaClient } from "@prisma/client";

/** Composite key for tracks: `moduleSlug:trackSlug` */
export type TrackKey = `${string}:${string}`;

export type SeedContext = {
  modules: Record<string, string>;
  tracks: Record<TrackKey, string>;
  concepts: Record<string, string>;
  companies: Record<string, string>;
};

export function trackKey(moduleSlug: string, trackSlug: string): TrackKey {
  return `${moduleSlug}:${trackSlug}`;
}

export async function buildSeedContext(prisma: PrismaClient): Promise<SeedContext> {
  const [modules, tracks, concepts, companies] = await Promise.all([
    prisma.module.findMany({ select: { id: true, slug: true } }),
    prisma.track.findMany({
      select: { id: true, slug: true, module: { select: { slug: true } } },
    }),
    prisma.concept.findMany({ select: { id: true, slug: true } }),
    prisma.company.findMany({ select: { id: true, slug: true } }),
  ]);

  return {
    modules: Object.fromEntries(modules.map((m) => [m.slug, m.id])),
    tracks: Object.fromEntries(
      tracks.map((t) => [trackKey(t.module.slug, t.slug), t.id]),
    ),
    concepts: Object.fromEntries(concepts.map((c) => [c.slug, c.id])),
    companies: Object.fromEntries(companies.map((c) => [c.slug, c.id])),
  };
}

/**
 * Validates that prerequisite edges form a DAG (no cycles).
 * Edge semantics: source must be learned before target.
 */
export function validatePrerequisiteDAG(
  edges: ReadonlyArray<{ source: string; target: string }>,
): void {
  const adjacency = new Map<string, string[]>();

  for (const { source, target } of edges) {
    const neighbors = adjacency.get(source) ?? [];
    neighbors.push(target);
    adjacency.set(source, neighbors);
    adjacency.set(target, adjacency.get(target) ?? []);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string): void {
    if (inStack.has(node)) {
      throw new Error(
        `Concept prerequisite cycle detected involving "${node}". Prerequisites must form a DAG.`,
      );
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);

    for (const neighbor of adjacency.get(node) ?? []) {
      dfs(neighbor);
    }

    inStack.delete(node);
  }

  for (const node of adjacency.keys()) {
    dfs(node);
  }
}
