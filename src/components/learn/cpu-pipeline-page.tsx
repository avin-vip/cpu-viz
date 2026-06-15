"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useMemo } from "react";

import {
  StepController,
  type StepItem,
} from "@/components/visualizations/shared/step-controller";
import { PipelineDiagram } from "@/components/visualizations/viz-registry";
import { VizContainer } from "@/components/visualizations/viz-container";
import type { PipelineStage } from "@/types/visualization";
import type { ReactFlowVizConfig } from "@/types/visualization";

interface CpuPipelinePageProps {
  config: ReactFlowVizConfig;
  stages: PipelineStage[];
}

function CpuPipelinePageInner({ config, stages }: CpuPipelinePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeStep = useMemo(() => {
    const raw = searchParams.get("step");
    if (!raw) {
      return 0;
    }

    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.max(0, Math.min(parsed - 1, stages.length - 1));
  }, [searchParams, stages.length]);

  const stepItems: StepItem[] = useMemo(
    () =>
      stages.map((stage) => ({
        id: stage.id,
        label: stage.label,
        shortLabel: stage.shortLabel,
      })),
    [stages],
  );

  const activeStage = stages[activeStep];

  const handleStepChange = useCallback(
    (index: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("step", String(index + 1));
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 lg:p-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          CPU Architecture
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Instruction Pipeline
        </h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Walk through the classic five-stage RISC pipeline — fetch, decode,
          execute, memory, and writeback — and see how instructions overlap in
          time.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <VizContainer
            minHeight={360}
            ariaLabel="CPU instruction pipeline diagram"
            className="h-[420px]"
          >
            {(dimensions) =>
              dimensions.width > 0 ? (
                <PipelineDiagram
                  config={config}
                  activeStep={activeStep}
                  className="h-full"
                />
              ) : null
            }
          </VizContainer>

          <StepController
            steps={stepItems}
            activeStep={activeStep}
            onStepChange={handleStepChange}
          />
        </div>

        <aside className="rounded-lg border border-border bg-card p-5">
          {activeStage ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Stage {activeStage.order}
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {activeStage.label}
              </h2>
              {activeStage.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activeStage.description}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a pipeline stage to read its description.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

export function CpuPipelinePage(props: CpuPipelinePageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
          Loading pipeline explorer…
        </div>
      }
    >
      <CpuPipelinePageInner {...props} />
    </Suspense>
  );
}

function extractPipelineStages(config: ReactFlowVizConfig): PipelineStage[] {
  return [...config.nodes]
    .sort((a, b) => {
      const stageA = (a.data as { stage?: number }).stage ?? 0;
      const stageB = (b.data as { stage?: number }).stage ?? 0;
      return stageA - stageB;
    })
    .map((node, index) => {
      const data = node.data as {
        label?: string;
        description?: string;
        stage?: number;
        shortLabel?: string;
      };

      return {
        id: node.id,
        label: data.label ?? node.id,
        shortLabel: data.shortLabel,
        description: data.description,
        order: data.stage ?? index + 1,
      };
    });
}

export { extractPipelineStages };
