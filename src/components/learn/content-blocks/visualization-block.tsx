"use client";

import {
  getVizComponent,
  VizFallback,
} from "@/components/visualizations/viz-registry";
import type { ResolvedVisualizationBlockData } from "@/types/content";
import { isReactFlowVizConfig } from "@/types/visualization";

export interface VisualizationBlockProps {
  data: ResolvedVisualizationBlockData;
}

export function VisualizationBlock({ data }: VisualizationBlockProps) {
  const Component = getVizComponent(data.vizSlug);

  if (!Component || !data.vizConfig || !isReactFlowVizConfig(data.vizConfig)) {
    return (
      <div className="my-8">
        <VizFallback slug={data.vizSlug} />
      </div>
    );
  }

  return (
    <div className="my-8">
      <Component config={data.vizConfig} {...(data.props ?? {})} />
    </div>
  );
}
