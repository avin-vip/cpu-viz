"use client";

import {
  NODE_TYPE_COLORS,
  NODE_TYPE_LABELS,
  type DependencyNodeType,
} from "@/types/dependency-graph";
import {
  VizLegend,
  type LegendItem,
} from "@/components/visualizations/shared/viz-legend";
import { cn } from "@/lib/utils/cn";

interface DependencyGraphLegendProps {
  className?: string;
}

export function DependencyGraphLegend({ className }: DependencyGraphLegendProps) {
  const items: LegendItem[] = (
    Object.keys(NODE_TYPE_LABELS) as DependencyNodeType[]
  ).map((type) => ({
    id: type,
    label: NODE_TYPE_LABELS[type],
    color: NODE_TYPE_COLORS[type],
  }));

  return (
    <VizLegend
      title="Node types"
      items={items}
      orientation="vertical"
      className={cn(className)}
    />
  );
}
