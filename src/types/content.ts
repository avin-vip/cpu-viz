import type { ContentBlockType } from "@prisma/client";

import type { VizConfig } from "@/types/visualization";

export interface TextBlockData {
  markdown: string;
}

export interface HeadingBlockData {
  level: 1 | 2 | 3;
  text: string;
}

export interface DiagramBlockData {
  src: string;
  alt: string;
  caption?: string;
}

export interface VisualizationBlockData {
  vizSlug: string;
  props?: Record<string, unknown>;
}

export interface CalloutBlockData {
  variant: "info" | "warning" | "tip";
  markdown: string;
}

export interface GlossaryTermBlockData {
  conceptSlug: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizBlockData {
  questions: QuizQuestion[];
}

export type ContentBlockDataMap = {
  TEXT: TextBlockData;
  HEADING: HeadingBlockData;
  DIAGRAM: DiagramBlockData;
  VISUALIZATION: VisualizationBlockData;
  CALLOUT: CalloutBlockData;
  GLOSSARY_TERM: GlossaryTermBlockData;
  QUIZ: QuizBlockData;
};

export type TypedContentBlock<T extends ContentBlockType = ContentBlockType> = {
  id: string;
  type: T;
  order: number;
  data: ContentBlockDataMap[T];
};

export type ContentBlock = {
  [K in ContentBlockType]: TypedContentBlock<K>;
}[ContentBlockType];

export interface ConceptLink {
  slug: string;
  term: string;
  href: string;
}

export interface ResolvedTextBlockData extends TextBlockData {
  conceptLinks: ConceptLink[];
}

export interface ResolvedCalloutBlockData extends CalloutBlockData {
  conceptLinks: ConceptLink[];
}

export interface ResolvedVisualizationBlockData extends VisualizationBlockData {
  vizConfig: VizConfig | null;
}

export type ResolvedContentBlockDataMap = {
  TEXT: ResolvedTextBlockData;
  HEADING: HeadingBlockData;
  DIAGRAM: DiagramBlockData;
  VISUALIZATION: ResolvedVisualizationBlockData;
  CALLOUT: ResolvedCalloutBlockData;
  GLOSSARY_TERM: GlossaryTermBlockData & { concept?: ConceptLink };
  QUIZ: QuizBlockData;
};

export type ResolvedContentBlockOf<T extends ContentBlockType> = {
  id: string;
  type: T;
  order: number;
  data: ResolvedContentBlockDataMap[T];
};

export type ResolvedContentBlock = {
  [K in ContentBlockType]: ResolvedContentBlockOf<K>;
}[ContentBlockType];

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  order: number;
  estimatedMin: number | null;
}

export interface TrackWithLessons {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  lessons: LessonSummary[];
}

export interface ModuleWithTracks {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string | null;
  order: number;
  published: boolean;
  tracks: TrackWithLessons[];
}

export interface LessonWithContext {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  order: number;
  estimatedMin: number | null;
  published: boolean;
  blocks: ContentBlock[];
  track: {
    id: string;
    slug: string;
    title: string;
    module: {
      id: string;
      slug: string;
      title: string;
    };
  };
}

export interface ResolvedLesson extends Omit<LessonWithContext, "blocks"> {
  blocks: ResolvedContentBlock[];
}

export function isContentBlockType(value: string): value is ContentBlockType {
  return (
    value === "TEXT" ||
    value === "HEADING" ||
    value === "DIAGRAM" ||
    value === "VISUALIZATION" ||
    value === "CALLOUT" ||
    value === "GLOSSARY_TERM" ||
    value === "QUIZ"
  );
}

export function parseContentBlock(block: {
  id: string;
  type: ContentBlockType;
  order: number;
  data: unknown;
}): ContentBlock {
  return {
    id: block.id,
    type: block.type,
    order: block.order,
    data: block.data,
  } as ContentBlock;
}
