import type { Metadata } from "next";

import {
  CpuPipelinePage,
  extractPipelineStages,
} from "@/components/learn/cpu-pipeline-page";
import { prisma } from "@/lib/prisma/client";
import type { ReactFlowVizConfig } from "@/types/visualization";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CPU Instruction Pipeline",
  description:
    "Interactive five-stage instruction pipeline explorer with step-by-step descriptions.",
};

export default async function PipelinePage() {
  const visualization = await prisma.visualization.findUnique({
    where: { slug: "cpu-pipeline" },
    select: { config: true },
  });

  if (!visualization) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Pipeline visualization is not available. Run database seed to load
          content.
        </p>
      </div>
    );
  }

  const rawConfig = visualization.config as Record<string, unknown>;

  if (
    rawConfig.renderer !== "REACT_FLOW" ||
    !Array.isArray(rawConfig.nodes) ||
    !Array.isArray(rawConfig.edges)
  ) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Invalid pipeline visualization configuration.
        </p>
      </div>
    );
  }

  const config = rawConfig as unknown as ReactFlowVizConfig;
  const stages = extractPipelineStages(config);

  return <CpuPipelinePage config={config} stages={stages} />;
}
