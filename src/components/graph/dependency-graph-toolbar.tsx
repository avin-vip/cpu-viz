"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";
import { searchNodes } from "@/lib/graph/static-graph";
import type { DependencyNodeType } from "@/types/dependency-graph";
import {
  NODE_TYPE_COLORS,
  NODE_TYPE_LABELS,
} from "@/types/dependency-graph";
import type { ScenarioDefinition, TraceDirection } from "@/types/dependency-graph";
import type { GraphNodeDisplay } from "@/types/graph";

const ALL_NODE_TYPES: DependencyNodeType[] = [
  "COMPANY",
  "TECHNOLOGY",
  "PRODUCT",
  "PROCESS",
  "END_MARKET",
];

interface DependencyGraphToolbarProps {
  selectedTypes: DependencyNodeType[];
  onTypesChange: (types: DependencyNodeType[]) => void;
  selectedNodeId: string | null;
  onSearchSelect: (node: GraphNodeDisplay) => void;
  onTrace: (direction: TraceDirection) => void;
  onResetView: () => void;
  scenarios: ScenarioDefinition[];
  activeScenarioId: string | null;
  onScenarioSelect: (scenarioId: string | null) => void;
  className?: string;
}

export function DependencyGraphToolbar({
  selectedTypes,
  onTypesChange,
  selectedNodeId,
  onSearchSelect,
  onTrace,
  onResetView,
  scenarios,
  activeScenarioId,
  onScenarioSelect,
  className,
}: DependencyGraphToolbarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GraphNodeDisplay[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setResults(searchNodes(query));
    setOpen(true);
  }, [query]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const typeSet = new Set(selectedTypes);
  const allTypesSelected = selectedTypes.length === 0;

  function toggleType(type: DependencyNodeType) {
    if (allTypesSelected) {
      onTypesChange([type]);
      return;
    }

    const next = new Set(typeSet);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }

    const values = [...next] as DependencyNodeType[];
    onTypesChange(
      values.length === ALL_NODE_TYPES.length ? [] : values,
    );
  }

  function handleSelect(node: GraphNodeDisplay) {
    setQuery(node.label);
    setOpen(false);
    onSearchSelect(node);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        ref={containerRef}
        className="relative rounded-lg border border-border bg-card p-4"
        role="search"
      >
        <label htmlFor="graph-search" className="sr-only">
          Search nodes
        </label>
        <input
          id="graph-search"
          type="search"
          placeholder="Search companies, technologies, products…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        {open && results.length > 0 ? (
          <ul
            className="absolute left-4 right-4 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-lg"
            role="listbox"
          >
            {results.map((node) => (
              <li key={node.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => handleSelect(node)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        node.color ??
                        NODE_TYPE_COLORS[node.type as DependencyNodeType],
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {node.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {NODE_TYPE_LABELS[node.type as DependencyNodeType]}
                      {node.subtitle ? ` · ${node.subtitle}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div
        className="rounded-lg border border-border bg-card p-4"
        role="region"
        aria-label="Node type filters"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            Node types
          </h2>
          <button
            type="button"
            onClick={() => onTypesChange([])}
            className="text-xs font-medium text-primary hover:underline"
          >
            {allTypesSelected ? "All types" : "Show all"}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {ALL_NODE_TYPES.map((type) => {
            const isChecked = allTypesSelected || typeSet.has(type);
            return (
              <label
                key={type}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition",
                  isChecked
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => toggleType(type)}
                />
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: NODE_TYPE_COLORS[type] }}
                  aria-hidden
                />
                {NODE_TYPE_LABELS[type]}
              </label>
            );
          })}
        </div>
      </div>

      {selectedNodeId ? (
        <div
          className="rounded-lg border border-border bg-card p-4"
          role="region"
          aria-label="Dependency tracing"
        >
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Trace dependencies
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onTrace("upstream")}
              className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              ↑ Upstream
            </button>
            <button
              type="button"
              onClick={() => onTrace("downstream")}
              className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              ↓ Downstream
            </button>
            <button
              type="button"
              onClick={() => onTrace("both")}
              className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              ↔ Both
            </button>
            <button
              type="button"
              onClick={onResetView}
              className="rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              Reset view
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="rounded-lg border border-border bg-card p-4"
        role="region"
        aria-label="Scenario simulations"
      >
        <h2 className="mb-1 text-sm font-semibold text-foreground">
          Scenarios
        </h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Simulate supply chain stress events and see affected nodes.
        </p>
        <div className="flex flex-col gap-2">
          {scenarios.map((scenario) => {
            const active = activeScenarioId === scenario.id;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() =>
                  onScenarioSelect(active ? null : scenario.id)
                }
                className={cn(
                  "rounded-md border px-3 py-2 text-left text-xs transition",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className="block font-medium">{scenario.name}</span>
                <span className="mt-0.5 block text-[11px] leading-snug opacity-80">
                  {scenario.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
