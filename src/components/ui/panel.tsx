import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "inset" | "viz";
}

const variantStyles = {
  default: "border-border bg-card",
  inset: "border-border bg-muted/50",
  viz: "border-border bg-[#0c0c10] shadow-inner shadow-black/20",
} as const;

export function Panel({
  className,
  variant = "default",
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "rounded-lg border",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function PanelHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

export function PanelTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function PanelContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
