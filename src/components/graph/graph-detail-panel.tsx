"use client";

import { cn } from "@/lib/utils/cn";
import {
  getDownstreamNodes,
  getUpstreamNodes,
} from "@/lib/graph/static-graph";
import {
  NODE_TYPE_COLORS,
  NODE_TYPE_LABELS,
  type DependencyNodeType,
} from "@/types/dependency-graph";
import type { GraphEdgeDisplay, GraphNodeDisplay } from "@/types/graph";

interface RelationshipCounts {
  upstream: number;
  downstream: number;
  total: number;
}

interface GraphDetailPanelProps {
  node: GraphNodeDisplay | null;
  edges: GraphEdgeDisplay[];
  allEdges?: GraphEdgeDisplay[];
  onClose?: () => void;
  className?: string;
}

function countRelationships(
  nodeId: string,
  edges: GraphEdgeDisplay[],
): RelationshipCounts {
  let upstream = 0;
  let downstream = 0;

  for (const edge of edges) {
    if (edge.target === nodeId) {
      upstream += 1;
    }
    if (edge.source === nodeId) {
      downstream += 1;
    }
  }

  return { upstream, downstream, total: upstream + downstream };
}

function NeighborList({
  title,
  nodes,
}: {
  title: string;
  nodes: GraphNodeDisplay[];
}) {
  if (nodes.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="space-y-1">
        {nodes.map((neighbor) => (
          <li
            key={neighbor.id}
            className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-xs"
          >
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  neighbor.color ??
                  NODE_TYPE_COLORS[neighbor.type as DependencyNodeType],
              }}
            />
            <span className="truncate font-medium text-foreground">
              {neighbor.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GraphDetailPanel({
  node,
  edges,
  allEdges,
  onClose,
  className,
}: GraphDetailPanelProps) {
  if (!node) {
    return (
      <aside
        className={cn(
          "flex h-full flex-col justify-center rounded-lg border border-dashed border-border bg-card/50 p-6 text-center",
          className,
        )}
        aria-label="Node details"
      >
        <p className="text-sm font-medium text-foreground">Select a node</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Click a node in the graph or search to inspect dependencies,
          relationships, and scenario impact.
        </p>
      </aside>
    );
  }

  const edgeSource = allEdges ?? edges;
  const counts = countRelationships(node.id, edgeSource);
  const upstream = getUpstreamNodes(node.id);
  const downstream = getDownstreamNodes(node.id);
  const nodeType = node.type as DependencyNodeType;
  const typeLabel = NODE_TYPE_LABELS[nodeType] ?? node.type;

  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-lg border border-border bg-card",
        className,
      )}
      aria-label={`Details for ${node.label}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {typeLabel}
          </p>
          <h2 className="truncate text-lg font-semibold text-foreground">
            {node.label}
          </h2>
          {node.subtitle ? (
            <p className="text-sm text-muted-foreground">{node.subtitle}</p>
          ) : null}
          {node.category ? (
            <span
              className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: node.color
                  ? `color-mix(in srgb, ${node.color} 18%, transparent)`
                  : "var(--muted)",
                color: node.color ?? "var(--muted-foreground)",
              }}
            >
              {node.category}
            </span>
          ) : null}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close detail panel"
          >
            Close
          </button>
        ) : null}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {node.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {node.description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No description available.
          </p>
        )}

        <dl className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md bg-muted/50 p-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Upstream
            </dt>
            <dd className="text-lg font-semibold text-foreground">
              {counts.upstream}
            </dd>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Downstream
            </dt>
            <dd className="text-lg font-semibold text-foreground">
              {counts.downstream}
            </dd>
          </div>
          <div className="rounded-md bg-muted/50 p-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Links
            </dt>
            <dd className="text-lg font-semibold text-foreground">
              {counts.total}
            </dd>
          </div>
        </dl>

        <NeighborList title="Upstream dependencies" nodes={upstream} />
        <NeighborList title="Downstream dependencies" nodes={downstream} />
      </div>
    </aside>
  );
}
