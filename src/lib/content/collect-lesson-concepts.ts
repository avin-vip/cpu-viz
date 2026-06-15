import type { GlossaryEntry } from "@/components/learn/glossary-panel";
import type { ResolvedContentBlock } from "@/types/content";

export function collectLessonConcepts(blocks: ResolvedContentBlock[]): {
  conceptSlugs: string[];
  glossaryTerms: GlossaryEntry[];
} {
  const conceptSlugs = new Set<string>();
  const glossaryTerms: GlossaryEntry[] = [];

  for (const block of blocks) {
    if (block.type === "TEXT" || block.type === "CALLOUT") {
      for (const link of block.data.conceptLinks) {
        conceptSlugs.add(link.slug);
      }
    } else if (block.type === "GLOSSARY_TERM") {
      conceptSlugs.add(block.data.conceptSlug);
      if (block.data.concept) {
        glossaryTerms.push({ ...block.data.concept });
      }
    }
  }

  return {
    conceptSlugs: [...conceptSlugs],
    glossaryTerms,
  };
}
