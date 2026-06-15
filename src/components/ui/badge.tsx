import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

const variantStyles = {
  default: "border-border bg-muted text-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  secondary: "border-border bg-accent text-accent-foreground",
  outline: "border-border bg-transparent text-muted-foreground",
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
