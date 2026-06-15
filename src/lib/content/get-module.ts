import { prisma } from "@/lib/prisma/client";
import type { ModuleWithTracks, TrackWithLessons } from "@/types/content";

const lessonSummarySelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  order: true,
  estimatedMin: true,
} as const;

export async function getModule(
  slug: string,
): Promise<ModuleWithTracks | null> {
  const learningModule = await prisma.module.findUnique({
    where: { slug },
    include: {
      tracks: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { order: "asc" },
            select: lessonSummarySelect,
          },
        },
      },
    },
  });

  if (!learningModule) {
    return null;
  }

  const tracks: TrackWithLessons[] = learningModule.tracks
    .map((track) => ({
      id: track.id,
      slug: track.slug,
      title: track.title,
      description: track.description,
      order: track.order,
      lessons: track.lessons,
    }))
    .filter((track) => track.lessons.length > 0);

  return {
    id: learningModule.id,
    slug: learningModule.slug,
    title: learningModule.title,
    description: learningModule.description,
    icon: learningModule.icon,
    order: learningModule.order,
    published: learningModule.published,
    tracks,
  };
}

export async function getAllModules(): Promise<ModuleWithTracks[]> {
  const modules = await prisma.module.findMany({
    where: { published: true },
    orderBy: { order: "asc" },
    include: {
      tracks: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { published: true },
            orderBy: { order: "asc" },
            select: lessonSummarySelect,
          },
        },
      },
    },
  });

  return modules.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    icon: row.icon,
    order: row.order,
    published: row.published,
    tracks: row.tracks
      .map((track) => ({
        id: track.id,
        slug: track.slug,
        title: track.title,
        description: track.description,
        order: track.order,
        lessons: track.lessons,
      }))
      .filter((track) => track.lessons.length > 0),
  }));
}

export async function getModuleLessonCount(slug: string): Promise<number> {
  const learningModule = await prisma.module.findUnique({
    where: { slug },
    select: {
      tracks: {
        select: {
          lessons: {
            where: { published: true },
            select: { id: true },
          },
        },
      },
    },
  });

  if (!learningModule) {
    return 0;
  }

  return learningModule.tracks.reduce(
    (count, track) => count + track.lessons.length,
    0,
  );
}
