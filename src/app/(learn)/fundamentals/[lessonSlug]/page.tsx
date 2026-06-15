import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { LessonNav } from "@/components/learn/lesson-nav";
import { LessonRenderer } from "@/components/learn/lesson-renderer";
import { Badge } from "@/components/ui/badge";
import { collectLessonConcepts } from "@/lib/content/collect-lesson-concepts";
import { getLesson } from "@/lib/content/get-lesson";
import { getModule } from "@/lib/content/get-module";
import { resolveLesson } from "@/lib/content/resolve-blocks";
import { prisma } from "@/lib/prisma/client";

export const dynamic = "force-dynamic";

interface LessonPageProps {
  params: Promise<{ lessonSlug: string }>;
}

async function loadConceptDefinitions(slugs: string[]) {
  if (slugs.length === 0) {
    return {};
  }

  const concepts = await prisma.concept.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, definition: true },
  });

  return Object.fromEntries(
    concepts.map((concept) => [concept.slug, concept.definition]),
  );
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = await getLesson("fundamentals", lessonSlug);

  if (!lesson) {
    return { title: "Lesson not found" };
  }

  return {
    title: lesson.title,
    description: lesson.summary ?? undefined,
  };
}

export default async function FundamentalsLessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = await getLesson("fundamentals", lessonSlug);

  if (!lesson) {
    notFound();
  }

  const [resolved, module] = await Promise.all([
    resolveLesson(lesson),
    getModule("fundamentals"),
  ]);

  const { conceptSlugs, glossaryTerms } = collectLessonConcepts(resolved.blocks);

  const conceptDefinitions = await loadConceptDefinitions(conceptSlugs);

  for (const term of glossaryTerms) {
    if (conceptDefinitions[term.slug]) {
      term.definition = conceptDefinitions[term.slug];
    }
  }

  const trackLessons =
    module?.tracks.find((track) => track.id === lesson.track.id)?.lessons ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: lesson.track.module.title, href: "/fundamentals" },
          { label: lesson.track.title },
          { label: lesson.title },
        ]}
        className="mb-6"
      />

      <header className="mb-8">
        <Badge variant="outline" className="mb-3">
          {lesson.track.title}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="mt-3 text-lg text-muted-foreground">{lesson.summary}</p>
        )}
        {lesson.estimatedMin && (
          <p className="mt-2 text-sm text-muted-foreground">
            {lesson.estimatedMin} min read
          </p>
        )}
      </header>

      <LessonRenderer
        blocks={resolved.blocks}
        conceptDefinitions={conceptDefinitions}
        glossaryTerms={glossaryTerms}
      />

      <LessonNav
        moduleSlug="fundamentals"
        lessons={trackLessons}
        currentSlug={lesson.slug}
      />
    </div>
  );
}
