"use client";

import { COMPANY_CATEGORY_LIST } from "@/lib/constants/categories";
import {
  VizLegend,
  type LegendItem,
} from "@/components/visualizations/shared/viz-legend";
import { cn } from "@/lib/utils/cn";

interface GraphLegendProps {
  className?: string;
}

export function GraphLegend({ className }: GraphLegendProps) {
  const items: LegendItem[] = COMPANY_CATEGORY_LIST.map((category) => ({
    id: category.value,
    label: category.label,
    color: category.color,
  }));

  return (
    <VizLegend
      title="Company categories"
      items={items}
      orientation="vertical"
      className={cn(className)}
    />
  );
}
