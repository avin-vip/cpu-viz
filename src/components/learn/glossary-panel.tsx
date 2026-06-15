import { ConceptLinkPopover } from "@/components/learn/concept-link";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import type { ConceptLink } from "@/types/content";

export interface GlossaryEntry extends ConceptLink {
  definition?: string;
}

export interface GlossaryPanelProps {
  terms: GlossaryEntry[];
}

export function GlossaryPanel({ terms }: GlossaryPanelProps) {
  if (terms.length === 0) {
    return null;
  }

  return (
    <Panel className="mt-8">
      <PanelHeader>
        <PanelTitle>Glossary</PanelTitle>
      </PanelHeader>
      <PanelContent>
        <dl className="space-y-4">
          {terms.map((term) => (
            <div key={term.slug}>
              <dt className="text-sm font-medium text-foreground">
                <ConceptLinkPopover concept={term} definition={term.definition} />
              </dt>
              {term.definition && (
                <dd className="mt-1 text-sm text-muted-foreground">
                  {term.definition}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </PanelContent>
    </Panel>
  );
}
