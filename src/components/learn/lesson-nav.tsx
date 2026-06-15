import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { LessonSummary } from "@/types/content";

export interface LessonNavProps {
  moduleSlug: string;
  lessons: LessonSummary[];
  currentSlug: string;
}

export function LessonNav({
  moduleSlug,
  lessons,
  currentSlug,
}: LessonNavProps) {
  const currentIndex = lessons.findIndex((lesson) => lesson.slug === currentSlug);
  const previous = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Lesson navigation"
      className="mt-12 flex items-stretch justify-between gap-4 border-t border-border pt-8"
    >
      {previous ? (
        <Button variant="outline" asChild className="h-auto flex-col items-start py-3">
          <Link href={`/${moduleSlug}/${previous.slug}`}>
            <span className="text-xs text-muted-foreground">Previous</span>
            <span className="font-medium">{previous.title}</span>
          </Link>
        </Button>
      ) : (
        <div />
      )}

      {next ? (
        <Button variant="outline" asChild className="ml-auto h-auto flex-col items-end py-3 text-right">
          <Link href={`/${moduleSlug}/${next.slug}`}>
            <span className="text-xs text-muted-foreground">Next</span>
            <span className="font-medium">{next.title}</span>
          </Link>
        </Button>
      ) : null}
    </nav>
  );
}
