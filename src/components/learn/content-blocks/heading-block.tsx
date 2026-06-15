import type { HeadingBlockData } from "@/types/content";
import { cn } from "@/lib/utils/cn";

export interface HeadingBlockProps {
  data: HeadingBlockData;
}

const levelStyles = {
  1: "text-3xl font-bold tracking-tight mt-0 mb-6",
  2: "text-2xl font-semibold tracking-tight mt-10 mb-4 pb-2 border-b border-border",
  3: "text-xl font-semibold tracking-tight mt-8 mb-3",
} as const;

export function HeadingBlock({ data }: HeadingBlockProps) {
  const className = cn("text-foreground", levelStyles[data.level]);

  if (data.level === 1) {
    return <h1 className={className}>{data.text}</h1>;
  }
  if (data.level === 2) {
    return <h2 className={className}>{data.text}</h2>;
  }
  return <h3 className={className}>{data.text}</h3>;
}
