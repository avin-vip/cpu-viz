"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";

import type { ReactFlowEdgeData } from "@/types/visualization";

const STRENGTH_STROKE_WIDTH: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2.5,
  5: 3,
};

function strengthToStrokeWidth(strength: number): number {
  return STRENGTH_STROKE_WIDTH[strength] ?? 2;
}

function DependencyEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
  selected,
}: EdgeProps & { data?: ReactFlowEdgeData }) {
  const strength = data?.strength ?? 3;
  const strokeWidth = strengthToStrokeWidth(strength);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth,
          stroke: selected ? "var(--primary)" : (style?.stroke ?? "#64748b"),
          opacity: selected ? 1 : 0.75,
        }}
      />

      {data?.label ? (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded bg-card/90 px-1.5 py-0.5 text-[10px] text-muted-foreground"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const DependencyEdge = memo(DependencyEdgeComponent);
