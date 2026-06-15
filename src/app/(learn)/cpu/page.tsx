import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getModule } from "@/lib/content/get-module";

export const dynamic = "force-dynamic";

export const revalidate = 3600;

export default async function CpuModulePage() {
  const learningModule = await getModule("cpu");

  if (!learningModule) {
    notFound();
  }

  const firstLesson = learningModule.tracks[0]?.lessons[0];
  const lessonCount = learningModule.tracks.reduce(
    (count, track) => count + track.lessons.length,
    0,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: learningModule.title }]} className="mb-6" />

      <div className="mb-8">
        <Badge variant="primary" className="mb-4">
          Module 2
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {learningModule.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {learningModule.description}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {firstLesson && (
            <Button asChild>
              <Link href={`/cpu/${firstLesson.slug}`}>
                Start with &ldquo;{firstLesson.title}&rdquo;
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/cpu/pipeline">Pipeline explorer</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {learningModule.tracks.map((track) => (
          <section key={track.id}>
            <h2 className="text-xl font-semibold text-foreground">
              {track.title}
            </h2>
            {track.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {track.description}
              </p>
            )}
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
              {track.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <Link
                    href={`/cpu/${lesson.slug}`}
                    className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-accent/50"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {lesson.title}
                      </p>
                      {lesson.summary && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {lesson.summary}
                        </p>
                      )}
                    </div>
                    {lesson.estimatedMin && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {lesson.estimatedMin} min
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
