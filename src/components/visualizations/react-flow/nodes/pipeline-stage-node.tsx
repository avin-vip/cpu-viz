"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils/cn";

export interface PipelineStageNodeData extends Record<string, unknown> {
  label: string;
  shortLabel?: string;
  description?: string;
  stage?: number;
  color?: string;
  isActive?: boolean;
}

function PipelineStageNodeComponent({
  data,
  selected,
}: NodeProps & { data: PipelineStageNodeData }) {
  const accentColor = data.color ?? "var(--primary)";
  const isHighlighted = Boolean(data.isActive || selected);

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-border !bg-muted-foreground"
      />

      <motion.div
        layout
        initial={false}
        animate={{
          scale: isHighlighted ? 1.04 : 1,
          boxShadow: isHighlighted
            ? `0 0 0 2px ${accentColor}, 0 8px 24px color-mix(in srgb, ${accentColor} 35%, transparent)`
            : "0 0 0 1px var(--border)",
        }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className={cn(
          "min-w-[140px] rounded-lg border bg-card px-4 py-3 text-center",
          isHighlighted ? "border-transparent" : "border-border",
        )}
      >
        {data.shortLabel ? (
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {data.shortLabel}
          </p>
        ) : null}
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          {data.label}
        </p>
      </motion.div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-border !bg-muted-foreground"
      />
    </>
  );
}

export const PipelineStageNode = memo(PipelineStageNodeComponent);
