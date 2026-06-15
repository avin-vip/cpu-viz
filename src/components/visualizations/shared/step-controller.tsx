"use client";

import { useCallback, useEffect } from "react";

import { cn } from "@/lib/utils/cn";

export interface StepItem {
  id: string;
  label: string;
  shortLabel?: string;
}

interface StepControllerProps {
  steps: StepItem[];
  activeStep: number;
  onStepChange: (index: number) => void;
  className?: string;
}

export function StepController({
  steps,
  activeStep,
  onStepChange,
  className,
}: StepControllerProps) {
  const clampedStep = Math.max(0, Math.min(activeStep, steps.length - 1));
  const canGoPrev = clampedStep > 0;
  const canGoNext = clampedStep < steps.length - 1;

  const goPrev = useCallback(() => {
    if (canGoPrev) {
      onStepChange(clampedStep - 1);
    }
  }, [canGoPrev, clampedStep, onStepChange]);

  const goNext = useCallback(() => {
    if (canGoNext) {
      onStepChange(clampedStep + 1);
    }
  }, [canGoNext, clampedStep, onStepChange]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        goPrev();
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext]);

  if (steps.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      role="group"
      aria-label="Pipeline step controls"
    >
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous step"
        >
          Previous
        </button>

        <span className="text-sm text-muted-foreground" aria-live="polite">
          Step {clampedStep + 1} of {steps.length}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          className="rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next step"
        >
          Next
        </button>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Pipeline stages"
      >
        {steps.map((step, index) => {
          const isActive = index === clampedStep;

          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onStepChange(index)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                isActive
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {step.shortLabel ?? step.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
