import { CalloutBlock } from "@/components/learn/content-blocks/callout-block";
import { DiagramBlock } from "@/components/learn/content-blocks/diagram-block";
import { HeadingBlock } from "@/components/learn/content-blocks/heading-block";
import { TextBlock } from "@/components/learn/content-blocks/text-block";
import { VisualizationBlock } from "@/components/learn/content-blocks/visualization-block";
import { ConceptLinkPopover } from "@/components/learn/concept-link";
import { GlossaryPanel } from "@/components/learn/glossary-panel";
import { Panel, PanelContent } from "@/components/ui/panel";
import type { GlossaryEntry } from "@/components/learn/glossary-panel";
import type { ResolvedContentBlock } from "@/types/content";

export interface LessonRendererProps {
  blocks: ResolvedContentBlock[];
  conceptDefinitions?: Record<string, string>;
  glossaryTerms?: GlossaryEntry[];
}

function ContentBlockView({
  block,
  conceptDefinitions,
}: {
  block: ResolvedContentBlock;
  conceptDefinitions?: Record<string, string>;
}) {
  if (block.type === "TEXT") {
    return (
      <TextBlock data={block.data} conceptDefinitions={conceptDefinitions} />
    );
  }

  if (block.type === "HEADING") {
    return <HeadingBlock data={block.data} />;
  }

  if (block.type === "CALLOUT") {
    return (
      <CalloutBlock data={block.data} conceptDefinitions={conceptDefinitions} />
    );
  }

  if (block.type === "DIAGRAM") {
    return <DiagramBlock data={block.data} />;
  }

  if (block.type === "VISUALIZATION") {
    return <VisualizationBlock data={block.data} />;
  }

  if (block.type === "GLOSSARY_TERM" && block.data.concept) {
    return (
      <Panel className="my-4">
        <PanelContent>
          <p className="text-sm text-muted-foreground">
            Key term:{" "}
            <ConceptLinkPopover
              concept={block.data.concept}
              definition={conceptDefinitions?.[block.data.concept.slug]}
            />
          </p>
        </PanelContent>
      </Panel>
    );
  }

  if (block.type === "QUIZ") {
    return (
      <Panel className="my-4">
        <PanelContent>
          <p className="text-sm font-medium text-foreground">
            Quiz ({block.data.questions.length} questions)
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Interactive quizzes are coming in a future release.
          </p>
        </PanelContent>
      </Panel>
    );
  }

  return null;
}

export function LessonRenderer({
  blocks,
  conceptDefinitions,
  glossaryTerms = [],
}: LessonRendererProps) {
  return (
    <article className="max-w-3xl">
      <div className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id}>
            <ContentBlockView
              block={block}
              conceptDefinitions={conceptDefinitions}
            />
          </div>
        ))}
      </div>

      {glossaryTerms.length > 0 && <GlossaryPanel terms={glossaryTerms} />}
    </article>
  );
}
