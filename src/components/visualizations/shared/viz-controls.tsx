"use client";

import { useReactFlow } from "@xyflow/react";

import { cn } from "@/lib/utils/cn";

interface VizControlsProps {
  className?: string;
  showFitView?: boolean;
  showZoom?: boolean;
}

export function VizControls({
  className,
  showFitView = true,
  showZoom = true,
}: VizControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border border-border bg-card/90 p-1 shadow-sm backdrop-blur-sm",
        className,
      )}
      role="toolbar"
      aria-label="Graph view controls"
    >
      {showZoom && (
        <>
          <button
            type="button"
            onClick={() => zoomIn({ duration: 200 })}
            className="rounded px-2.5 py-1.5 text-sm text-foreground transition hover:bg-muted"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomOut({ duration: 200 })}
            className="rounded px-2.5 py-1.5 text-sm text-foreground transition hover:bg-muted"
            aria-label="Zoom out"
          >
            −
          </button>
        </>
      )}

      {showFitView && (
        <button
          type="button"
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          className="rounded px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
          aria-label="Fit graph to view"
        >
          Fit
        </button>
      )}
    </div>
  );
}
