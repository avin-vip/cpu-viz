import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MODULES } from "@/lib/constants/modules";
import { cn } from "@/lib/utils/cn";
import type { ModuleWithTracks } from "@/types/content";

const iconMap: Record<string, string> = {
  cpu: "◈",
  pipeline: "⇢",
  layers: "▤",
  grid: "▦",
  factory: "⚙",
  brain: "◎",
  network: "⬡",
  building: "▣",
};

export interface ModuleCardProps {
  module: ModuleWithTracks;
  className?: string;
}

export function ModuleCard({ module, className }: ModuleCardProps) {
  const meta = MODULES[module.slug as keyof typeof MODULES];
  const isPublished = meta?.published ?? module.published;
  const lessonCount = module.tracks.reduce(
    (count, track) => count + track.lessons.length,
    0,
  );
  const icon = iconMap[module.icon ?? meta?.icon ?? "cpu"] ?? "◈";

  if (!isPublished) {
    return (
      <Card
        className={cn(
          "opacity-60",
          className,
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg text-muted-foreground"
            >
              {icon}
            </span>
            <Badge variant="outline">Coming soon</Badge>
          </div>
          <CardTitle className="mt-3">{module.title}</CardTitle>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Not yet available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/${module.slug}`} className={cn("group block", className)}>
      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-card/80">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg text-primary transition-colors group-hover:bg-primary/20"
            >
              {icon}
            </span>
            <Badge variant="primary">
              {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
            </Badge>
          </div>
          <CardTitle className="mt-3 transition-colors group-hover:text-primary">
            {module.title}
          </CardTitle>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
