"use client";

import { cn } from "@/lib/utils/cn";

export interface LegendItem {
  id: string;
  label: string;
  color: string;
  description?: string;
}

interface VizLegendProps {
  items: LegendItem[];
  title?: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function VizLegend({
  items,
  title = "Legend",
  className,
  orientation = "horizontal",
}: VizLegendProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card/90 p-3 backdrop-blur-sm",
        className,
      )}
      role="list"
      aria-label={title}
    >
      {title ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      ) : null}

      <ul
        className={cn(
          "flex gap-3",
          orientation === "vertical" ? "flex-col" : "flex-wrap",
        )}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-2 text-xs text-foreground"
            role="listitem"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden
            />
            <span className="font-medium">{item.label}</span>
            {item.description ? (
              <span className="text-muted-foreground">{item.description}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
