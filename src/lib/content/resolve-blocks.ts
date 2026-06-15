import { prisma } from "@/lib/prisma/client";
import type {
  ContentBlock,
  ConceptLink,
  ResolvedContentBlock,
  ResolvedLesson,
} from "@/types/content";
import type { VizConfig } from "@/types/visualization";

const CONCEPT_LINK_PATTERN = /\[\[([a-z0-9-]+)\]\]/gi;

export function extractConceptSlugs(markdown: string): string[] {
  const slugs = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = CONCEPT_LINK_PATTERN.exec(markdown)) !== null) {
    slugs.add(match[1].toLowerCase());
  }

  CONCEPT_LINK_PATTERN.lastIndex = 0;
  return [...slugs];
}

async function loadConceptLinks(slugs: string[]): Promise<Map<string, ConceptLink>> {
  if (slugs.length === 0) {
    return new Map();
  }

  const concepts = await prisma.concept.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, term: true },
  });

  return new Map(
    concepts.map((concept) => [
      concept.slug,
      {
        slug: concept.slug,
        term: concept.term,
        href: `/concepts/${concept.slug}`,
      },
    ]),
  );
}

async function loadVizConfig(slug: string): Promise<VizConfig | null> {
  const visualization = await prisma.visualization.findUnique({
    where: { slug },
    select: { config: true, renderer: true },
  });

  if (!visualization) {
    return null;
  }

  return {
    renderer: visualization.renderer,
    ...(visualization.config as Record<string, unknown>),
  } as VizConfig;
}

async function resolveBlock(block: ContentBlock): Promise<ResolvedContentBlock> {
  switch (block.type) {
    case "TEXT": {
      const slugs = extractConceptSlugs(block.data.markdown);
      const conceptMap = await loadConceptLinks(slugs);
      const conceptLinks = slugs
        .map((slug) => conceptMap.get(slug))
        .filter((link): link is ConceptLink => link !== undefined);

      return {
        id: block.id,
        type: "TEXT",
        order: block.order,
        data: {
          ...block.data,
          conceptLinks,
        },
      };
    }

    case "CALLOUT": {
      const slugs = extractConceptSlugs(block.data.markdown);
      const conceptMap = await loadConceptLinks(slugs);
      const conceptLinks = slugs
        .map((slug) => conceptMap.get(slug))
        .filter((link): link is ConceptLink => link !== undefined);

      return {
        id: block.id,
        type: "CALLOUT",
        order: block.order,
        data: {
          ...block.data,
          conceptLinks,
        },
      };
    }

    case "VISUALIZATION": {
      const vizConfig = await loadVizConfig(block.data.vizSlug);
      return {
        id: block.id,
        type: "VISUALIZATION",
        order: block.order,
        data: {
          ...block.data,
          vizConfig,
        },
      };
    }

    case "GLOSSARY_TERM": {
      const conceptMap = await loadConceptLinks([block.data.conceptSlug]);
      const concept = conceptMap.get(block.data.conceptSlug);
      return {
        id: block.id,
        type: "GLOSSARY_TERM",
        order: block.order,
        data: {
          ...block.data,
          concept,
        },
      };
    }

    case "HEADING":
      return block;

    case "DIAGRAM":
      return block;

    case "QUIZ":
      return block;
  }
}

export async function resolveBlocks(
  blocks: ContentBlock[],
): Promise<ResolvedContentBlock[]> {
  return Promise.all(blocks.map(resolveBlock));
}

export async function resolveLesson(
  lesson: { blocks: ContentBlock[] } & Omit<ResolvedLesson, "blocks">,
): Promise<ResolvedLesson> {
  const resolvedBlocks = await resolveBlocks(lesson.blocks);
  return {
    ...lesson,
    blocks: resolvedBlocks,
  };
}

export function replaceConceptLinks(
  markdown: string,
  links: ConceptLink[],
): string {
  const linkMap = new Map(links.map((link) => [link.slug, link]));

  return markdown.replace(CONCEPT_LINK_PATTERN, (match, slug: string) => {
    const link = linkMap.get(slug.toLowerCase());
    if (!link) {
      return match;
    }
    return `[${link.term}](${link.href})`;
  });
}
