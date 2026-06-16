"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { ReactFlowVizConfig } from "@/types/visualization";

export interface PipelineVizProps {
  config: ReactFlowVizConfig;
  activeStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
}

export interface SupplyChainVizProps {
  config: ReactFlowVizConfig;
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  className?: string;
}

const PipelineDiagram = dynamic(
  () =>
    import("@/components/visualizations/react-flow/pipeline-diagram").then(
      (mod) => mod.PipelineDiagram,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] animate-pulse items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
        Loading pipeline diagram…
      </div>
    ),
  },
);

const SupplyChainGraph = dynamic(
  () =>
    import("@/components/visualizations/react-flow/supply-chain-graph").then(
      (mod) => mod.SupplyChainGraph,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] animate-pulse items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
        Loading supply chain graph…
      </div>
    ),
  },
);

const EcosystemGraph = dynamic(
  () =>
    import("@/components/visualizations/react-flow/ecosystem-graph").then(
      (mod) => mod.EcosystemGraph,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] animate-pulse items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
        Loading ecosystem map…
      </div>
    ),
  },
);

export type VizSlug = "cpu-pipeline" | "supply-chain" | "semiconductor-ecosystem";

export interface EcosystemVizProps {
  config: ReactFlowVizConfig;
  selectedNodeId?: string | null;
  onNodeSelect?: (nodeId: string | null) => void;
  className?: string;
}

export type VizComponentProps = PipelineVizProps | SupplyChainVizProps | EcosystemVizProps;

const VIZ_REGISTRY: Record<VizSlug, ComponentType<VizComponentProps>> = {
  "cpu-pipeline": PipelineDiagram as ComponentType<VizComponentProps>,
  "supply-chain": SupplyChainGraph as ComponentType<VizComponentProps>,
  "semiconductor-ecosystem": EcosystemGraph as ComponentType<VizComponentProps>,
};

export function getVizComponent(
  slug: string,
): ComponentType<VizComponentProps> | null {
  if (slug in VIZ_REGISTRY) {
    return VIZ_REGISTRY[slug as VizSlug];
  }
  return null;
}

export function isKnownVizSlug(slug: string): slug is VizSlug {
  return slug in VIZ_REGISTRY;
}

export function VizFallback({ slug }: { slug: string }) {
  return (
    <div
      className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-center"
      role="status"
    >
      <p className="text-sm font-medium text-foreground">
        Visualization unavailable
      </p>
      <p className="text-xs text-muted-foreground">
        No renderer registered for &ldquo;{slug}&rdquo;.
      </p>
    </div>
  );
}

export { PipelineDiagram, SupplyChainGraph };

export { EcosystemGraph };
