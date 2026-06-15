import { prisma } from "@/lib/prisma/client";
import {
  parseContentBlock,
  type ContentBlock,
  type LessonWithContext,
} from "@/types/content";

export async function getLesson(
  moduleSlug: string,
  lessonSlug: string,
): Promise<LessonWithContext | null> {
  const lesson = await prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      published: true,
      track: {
        module: {
          slug: moduleSlug,
        },
      },
    },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
      track: {
        select: {
          id: true,
          slug: true,
          title: true,
          module: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  const blocks: ContentBlock[] = lesson.blocks.map((block) =>
    parseContentBlock({
      id: block.id,
      type: block.type,
      order: block.order,
      data: block.data,
    }),
  );

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary,
    order: lesson.order,
    estimatedMin: lesson.estimatedMin,
    published: lesson.published,
    blocks,
    track: lesson.track,
  };
}
