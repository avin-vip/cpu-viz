"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

import { cn } from "@/lib/utils/cn";
import type { ReactFlowNodeData } from "@/types/visualization";

function CompanyNodeComponent({
  data,
  selected,
}: NodeProps & { data: ReactFlowNodeData }) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-border !bg-muted-foreground"
      />

      <div
        className={cn(
          "min-w-[160px] max-w-[200px] rounded-lg border bg-card px-3 py-2.5 shadow-sm transition",
          selected
            ? "border-primary ring-2 ring-primary/40"
            : "border-border hover:border-primary/50",
        )}
        style={
          data.color
            ? { borderLeftWidth: 3, borderLeftColor: data.color }
            : undefined
        }
      >
        <p className="truncate text-sm font-semibold leading-tight text-foreground">
          {data.label}
        </p>

        {data.subtitle ? (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {data.subtitle}
          </p>
        ) : null}

        {data.category ? (
          <span
            className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
            style={{
              backgroundColor: data.color
                ? `color-mix(in srgb, ${data.color} 18%, transparent)`
                : "var(--muted)",
              color: data.color ?? "var(--muted-foreground)",
            }}
          >
            {data.category}
          </span>
        ) : null}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-border !bg-muted-foreground"
      />
    </>
  );
}

export const CompanyNode = memo(CompanyNodeComponent);
